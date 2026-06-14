# backend/services/memory_indexer.py
"""
Memory Lane pipeline (v2):
  - Text/activity logs as primary storage (SQLite)
  - Screenshots as optional compressed context (rolling 48h, max 100)
  - ChromaDB v2 collection: screen_memory_v2 (1024-dim mxbai-embed-large)
  - Automatic deduplication and retention enforcement
"""
import mss
import chromadb
from PIL import Image
import time
import uuid
import os
import sqlite3
from pathlib import Path
from services.embedder import embedder

# Tesseract (optional)
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
_tesseract_available = False

try:
    import pytesseract
    if os.path.exists(TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
        _tesseract_available = True
        print("[Memory] Tesseract OCR available")
    else:
        print("[Memory] Tesseract not found — OCR disabled, using window title fallback")
except ImportError:
    print("[Memory] pytesseract not installed — OCR disabled")

from config import DATA_DIR
SCREENSHOTS_DIR = DATA_DIR / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
from config import DB_PATH, CHROMA_PATH

# Screenshot retention settings
MAX_SCREENSHOT_AGE_HOURS = 48
MAX_SCREENSHOT_COUNT = 100

# SQLite metadata tables
def _init_db():
    conn = sqlite3.connect(DB_PATH, timeout=15.0)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS screenshots (
            id TEXT PRIMARY KEY,
            timestamp INTEGER,
            screenshot_path TEXT,
            text_preview TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            event_type TEXT,
            title TEXT,
            metadata_json TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            start_time INTEGER,
            end_time INTEGER,
            dominant_app TEXT,
            item_count INTEGER,
            focus_score INTEGER,
            interruptions INTEGER,
            summary TEXT
        )
    """)
    conn.commit()
    conn.close()

_init_db()


def log_activity_event(event_type: str, title: str, metadata: dict = None):
    """Store a lightweight text-based activity event in SQLite."""
    import json
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        conn.execute(
            "INSERT INTO activity_log (timestamp, event_type, title, metadata_json) VALUES (?, ?, ?, ?)",
            (int(time.time()), event_type, title, json.dumps(metadata or {}))
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Memory] Activity log error: {e}")


def get_activity_timeline(hours: int = 24, limit: int = 200) -> list[dict]:
    """Return chronological activity events from the last N hours."""
    import json
    cutoff = int(time.time()) - (hours * 3600)
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        rows = conn.execute(
            """SELECT timestamp, event_type, title, metadata_json
               FROM activity_log WHERE timestamp > ?
               ORDER BY timestamp DESC LIMIT ?""",
            (cutoff, limit)
        ).fetchall()
        conn.close()
        return [
            {
                "timestamp": r[0],
                "event_type": r[1],
                "title": r[2],
                "metadata": json.loads(r[3]) if r[3] else {}
            }
            for r in rows
        ]
    except Exception as e:
        print(f"[Memory] get_activity_timeline error: {e}")
        return []


def _enforce_screenshot_retention():
    """Delete old/excess screenshots to enforce storage limits."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        cutoff = int(time.time()) - (MAX_SCREENSHOT_AGE_HOURS * 3600)

        # Delete by age
        old_rows = conn.execute(
            "SELECT id, screenshot_path FROM screenshots WHERE timestamp < ?", (cutoff,)
        ).fetchall()
        deleted_ids = []
        for row_id, path in old_rows:
            deleted_ids.append(row_id)
            try:
                if path and Path(path).exists():
                    Path(path).unlink()
            except Exception as e:
                print(f"[Memory] Failed to delete old screenshot: {e}")
            conn.execute("DELETE FROM screenshots WHERE id = ?", (row_id,))

        # Delete excess (over max count) — keep newest
        all_rows = conn.execute(
            "SELECT id, screenshot_path FROM screenshots ORDER BY timestamp DESC"
        ).fetchall()
        if len(all_rows) > MAX_SCREENSHOT_COUNT:
            excess = all_rows[MAX_SCREENSHOT_COUNT:]
            for row_id, path in excess:
                deleted_ids.append(row_id)
                try:
                    if path and Path(path).exists():
                        Path(path).unlink()
                except Exception as e:
                    print(f"[Memory] Failed to delete excess screenshot: {e}")
                conn.execute("DELETE FROM screenshots WHERE id = ?", (row_id,))

        conn.commit()
        conn.close()

        # Delete corresponding vectors from ChromaDB to prevent ballooning
        if deleted_ids:
            try:
                col = _get_chroma_collection()
                if col is not None:
                    col.delete(ids=deleted_ids)
                    print(f"[Memory] Pruned {len(deleted_ids)} old vectors from ChromaDB.")
            except Exception as e:
                print(f"[Memory] ChromaDB pruning error: {e}")

    except Exception as e:
        print(f"[Memory] Retention cleanup error: {e}")


def _is_duplicate_screenshot(text: str) -> bool:
    """Check if the last screenshot had very similar content (simple dedup)."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        row = conn.execute(
            "SELECT text_preview FROM screenshots ORDER BY timestamp DESC LIMIT 1"
        ).fetchone()
        conn.close()
        if row and row[0]:
            # Simple overlap check: if >70% of words match, it's a dup
            a_words = set(text.lower().split())
            b_words = set(row[0].lower().split())
            if len(a_words) == 0:
                return True
            overlap = len(a_words & b_words) / len(a_words)
            return overlap > 0.7
    except Exception as e:
        print(f"[Memory] Dup check error: {e}")
    return False


# ChromaDB v2 collection (1024-dim, versioned to avoid mismatch)
_chroma_client = None
_memory_col = None

def _get_chroma_collection():
    global _chroma_client, _memory_col
    if _memory_col is not None:
        return _memory_col
    try:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        # Use versioned collection name to avoid dimension mismatch with old data
        _memory_col = _chroma_client.get_or_create_collection(
            "screen_memory_v2",
            metadata={"hnsw:space": "cosine", "dimension": "1024"}
        )
        print(f"[Memory] ChromaDB collection 'screen_memory_v2' ready. Count: {_memory_col.count()}")
    except Exception as e:
        print(f"[Memory] ChromaDB init error: {e}")
        _memory_col = None
    return _memory_col


def _do_ocr(img: Image.Image) -> str:
    if not _tesseract_available:
        return ""
    try:
        import pytesseract
        text = pytesseract.image_to_string(img, config='--psm 11')
        return text.strip()
    except Exception as e:
        print(f"[Memory] OCR error: {e}")
        return ""


def capture_and_index(context_title: str = "") -> str | None:
    """
    Full pipeline: capture → OCR → deduplicate → embed → store.
    Returns screenshot_id on success.
    """
    # 1. Enforce retention before adding new
    _enforce_screenshot_retention()

    # 2. Screenshot
    try:
        with mss.mss() as sct:
            monitor = sct.monitors[1]
            raw = sct.grab(monitor)
            img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
    except Exception as e:
        print(f"[Memory] Screenshot error: {e}")
        return None

    # 3. OCR
    text = _do_ocr(img)

    # Use context_title as fallback if OCR insufficient
    if len(text) < 30:
        if context_title and len(context_title) > 5:
            text = f"Active window: {context_title}"
        else:
            return None

    # 4. Deduplication check
    if _is_duplicate_screenshot(text):
        print("[Memory] Duplicate screenshot detected, skipping.")
        # Still log activity but don't store the screenshot
        log_activity_event("screenshot_skipped", "Duplicate content detected")
        return None

    # 5. Save screenshot (heavily compressed JPEG, smaller for retention)
    screenshot_id = str(uuid.uuid4())
    img_path = SCREENSHOTS_DIR / f"{screenshot_id}.jpg"
    # Resize to 50% before saving to reduce storage
    small_img = img.resize((img.width // 2, img.height // 2), Image.LANCZOS)
    small_img.save(str(img_path), "JPEG", quality=40)

    # 6. Embed
    col = _get_chroma_collection()
    vec = embedder.embed_single(text[:1500])
    ts = int(time.time())
    preview = text[:200]

    # 7. Store metadata in SQLite
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        conn.execute(
            "INSERT INTO screenshots (id, timestamp, screenshot_path, text_preview) VALUES (?, ?, ?, ?)",
            (screenshot_id, ts, str(img_path), preview)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Memory] SQLite error: {e}")

    # 8. Store vector in ChromaDB v2
    if col is not None:
        try:
            col.add(
                ids=[screenshot_id],
                embeddings=[vec.tolist()],
                documents=[text[:2000]],
                metadatas=[{
                    "timestamp": ts,
                    "screenshot_path": str(img_path),
                    "text_preview": preview,
                    "context_title": context_title
                }]
            )
        except Exception as e:
            print(f"[Memory] ChromaDB error: {e}")

    # 9. Log as activity event
    log_activity_event("screenshot", context_title or "Screen captured", {
        "screenshot_id": screenshot_id
    })

    return screenshot_id


def search_memory(query: str, limit: int = 5) -> list[dict]:
    """Natural language vector search over screenshot history (v2 collection)."""
    col = _get_chroma_collection()
    if col is None:
        return []

    count = col.count()
    if count == 0:
        return []

    q_vec = embedder.embed_single(query)
    n = min(limit, count)

    try:
        results = col.query(
            query_embeddings=[q_vec.tolist()],
            n_results=n
        )
        output = []
        for i, doc_id in enumerate(results['ids'][0]):
            meta = results['metadatas'][0][i]
            distance = results['distances'][0][i]
            output.append({
                "id": doc_id,
                "text_preview": results['documents'][0][i][:300],
                "timestamp": meta.get('timestamp', 0),
                "screenshot_path": meta.get('screenshot_path', ''),
                "similarity": round(max(0.0, 1 - distance), 3)
            })
        return output
    except Exception as e:
        print(f"[Memory] Search error: {e}")
        return []


def search_activity_log(query: str, limit: int = 10) -> list[dict]:
    """Text-based search over activity log (keyword matching)."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        rows = conn.execute(
            """SELECT timestamp, event_type, title, metadata_json
               FROM activity_log
               WHERE title LIKE ?
               ORDER BY timestamp DESC LIMIT ?""",
            (f"%{query}%", limit)
        ).fetchall()
        conn.close()
        import json
        return [
            {
                "timestamp": r[0],
                "event_type": r[1],
                "title": r[2],
                "metadata": json.loads(r[3]) if r[3] else {}
            }
            for r in rows
        ]
    except Exception as e:
        print(f"[Memory] search_activity_log error: {e}")
        return []


def list_screenshots(limit: int = 50) -> list[dict]:
    """Return recent screenshot metadata from SQLite."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        rows = conn.execute(
            "SELECT id, timestamp, screenshot_path, text_preview FROM screenshots ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        ).fetchall()
        conn.close()
        return [
            {"id": r[0], "timestamp": r[1], "screenshot_path": r[2], "text_preview": r[3]}
            for r in rows
        ]
    except Exception as e:
        print(f"[Memory] list_screenshots error: {e}")
        return []
