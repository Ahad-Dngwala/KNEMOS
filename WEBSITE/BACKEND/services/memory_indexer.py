# backend/services/memory_indexer.py
"""
Memory Lane pipeline:
  mss screenshot  Tesseract OCR  mxbai embed  ChromaDB

SQLite stores metadata (id, timestamp, path, preview).
ChromaDB stores the semantic vectors + documents.

If Tesseract is not installed, OCR is gracefully skipped.
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

#  Tesseract (optional) 
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
_tesseract_available = False

try:
    import pytesseract
    if os.path.exists(TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
        _tesseract_available = True
        print("[Memory] Tesseract OCR available")
    else:
        print("[Memory] Tesseract not found  OCR disabled, using window title fallback")
except ImportError:
    print("[Memory] pytesseract not installed  OCR disabled")

#  Paths 
SCREENSHOTS_DIR = Path("./data/screenshots")
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = "./data/knemos.db"

#  SQLite metadata table 
def _init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS screenshots (
            id TEXT PRIMARY KEY,
            timestamp INTEGER,
            screenshot_path TEXT,
            text_preview TEXT
        )
    """)
    conn.commit()
    conn.close()

_init_db()

#  ChromaDB vector collection 
chroma_client = chromadb.PersistentClient(path="./data/chromadb")
memory_col = chroma_client.get_or_create_collection(
    "screen_memory",
    metadata={"hnsw:space": "cosine"}
)


def _do_ocr(img: Image.Image) -> str:
    """Run Tesseract OCR, return cleaned text."""
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
    Full pipeline: capture  OCR  embed  store.
    Returns screenshot_id on success, None if screen was blank/unreadable.
    """
    # 1. Screenshot
    try:
        with mss.mss() as sct:
            monitor = sct.monitors[1]  # Primary monitor
            raw = sct.grab(monitor)
            img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
    except Exception as e:
        print(f"[Memory] Screenshot error: {e}")
        return None

    # 2. OCR
    text = _do_ocr(img)

    # If OCR failed/disabled, use context_title as semantic anchor
    if len(text) < 30:
        if context_title and len(context_title) > 5:
            text = f"Active window: {context_title}"
        else:
            return None  # Nothing to embed

    # 3. Save screenshot (compressed JPEG)
    screenshot_id = str(uuid.uuid4())
    img_path = SCREENSHOTS_DIR / f"{screenshot_id}.jpg"
    img.save(str(img_path), "JPEG", quality=55)

    # 4. Embed
    vec = embedder.embed_single(text[:1500])
    ts = int(time.time())
    preview = text[:200]

    # 5a. Store metadata in SQLite
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "INSERT INTO screenshots (id, timestamp, screenshot_path, text_preview) VALUES (?, ?, ?, ?)",
            (screenshot_id, ts, str(img_path), preview)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Memory] SQLite error: {e}")

    # 5b. Store vector in ChromaDB
    try:
        memory_col.add(
            ids=[screenshot_id],
            embeddings=[vec.tolist()],
            documents=[text[:2000]],
            metadatas=[{
                "timestamp": ts,
                "screenshot_path": str(img_path),
                "text_preview": preview
            }]
        )
    except Exception as e:
        print(f"[Memory] ChromaDB error: {e}")

    return screenshot_id


def search_memory(query: str, limit: int = 5) -> list[dict]:
    """Natural language vector search over screenshot history."""
    count = memory_col.count()
    if count == 0:
        return []

    q_vec = embedder.embed_single(query)
    n = min(limit, count)

    results = memory_col.query(
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


def list_screenshots(limit: int = 50) -> list[dict]:
    """Return recent screenshot metadata from SQLite."""
    try:
        conn = sqlite3.connect(DB_PATH)
        rows = conn.execute(
            "SELECT id, timestamp, screenshot_path, text_preview FROM screenshots ORDER BY timestamp DESC LIMIT ?",
            (limit,)
        ).fetchall()
        conn.close()
        return [
            {"id": r[0], "timestamp": r[1], "screenshot_path": r[2], "text_preview": r[3]}
            for r in rows
        ]
    except Exception:
        return []
