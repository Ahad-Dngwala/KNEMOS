# backend/routers/workspace.py
"""
Workspace endpoints:
  POST /api/workspace/organize    full AI clustering pipeline
  GET  /api/workspace/list        cached workspace list from SQLite
  POST /api/workspace/restore/{id}  focus windows for a workspace
"""
import sqlite3
import json
import time
import uuid
from fastapi import APIRouter
from services.data_collector import get_open_windows, get_browser_tabs
from services.embedder import embedder
from services.clusterer import cluster_items
from services.workspace_namer import name_cluster
from services.wolfram_analytics import log_workspace_switch
from services.event_manager import event_bus

router = APIRouter()

DB_PATH = "./data/knemos.db"

#  SQLite workspace table 
def _init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS workspaces (
            id          TEXT PRIMARY KEY,
            name        TEXT,
            item_count  INTEGER,
            items_json  TEXT,
            created_at  INTEGER
        )
    """)
    conn.commit()
    conn.close()

_init_db()

# In-memory cache for the last organize result
_cache: dict = {"workspaces": [], "updated_at": 0}


def _save_workspaces_to_db(workspaces: list[dict]):
    """Persist workspace metadata in SQLite. ChromaDB holds only vectors."""
    conn = sqlite3.connect(DB_PATH)
    # Clear old workspaces and insert fresh set
    conn.execute("DELETE FROM workspaces")
    for ws in workspaces:
        conn.execute(
            "INSERT INTO workspaces (id, name, item_count, items_json, created_at) VALUES (?, ?, ?, ?, ?)",
            (ws["id"], ws["name"], ws["item_count"], json.dumps(ws["items"]), ws["created_at"])
        )
    conn.commit()
    conn.close()


def _load_workspaces_from_db() -> list[dict]:
    """Load workspace metadata from SQLite."""
    try:
        conn = sqlite3.connect(DB_PATH)
        rows = conn.execute(
            "SELECT id, name, item_count, items_json, created_at FROM workspaces ORDER BY item_count DESC"
        ).fetchall()
        conn.close()
        return [
            {
                "id": r[0],
                "name": r[1],
                "item_count": r[2],
                "items": json.loads(r[3]),
                "created_at": r[4]
            }
            for r in rows
        ]
    except Exception:
        return []


@router.post("/organize")
async def organize():
    """
    Full pipeline:
      1. Collect open windows + browser tabs
      2. Embed with mxbai-embed-large
      3. Cluster with HDBSCAN
      4. Name clusters with Qwen2.5 (3s timeout  fallback)
      5. Persist to SQLite, emit event
    """
    windows = get_open_windows()
    tabs = get_browser_tabs()
    all_items = windows + tabs

    if len(all_items) < 2:
        return {
            "workspaces": [],
            "total_items": len(all_items),
            "clusters_found": 0
        }

    # Embed
    texts = [item.title for item in all_items]
    embeddings = embedder.embed_texts(texts)

    # Cluster
    labels = cluster_items(embeddings)

    # Group by cluster label
    clusters: dict[int, list] = {}
    for item, label in zip(all_items, labels):
        clusters.setdefault(label, []).append(item)

    # Name each cluster
    workspaces = []
    for label, items in clusters.items():
        ws_name = name_cluster([i.title for i in items])
        ws = {
            "id": str(uuid.uuid4()),
            "name": ws_name,
            "item_count": len(items),
            "items": [i.model_dump() for i in items],
            "created_at": int(time.time())
        }
        workspaces.append(ws)
        log_workspace_switch(ws_name)

    # Sort by size descending
    workspaces.sort(key=lambda x: x["item_count"], reverse=True)

    # Update cache and persist
    _cache["workspaces"] = workspaces
    _cache["updated_at"] = int(time.time())
    _save_workspaces_to_db(workspaces)

    # Emit event for WebSocket broadcast (wired in main.py)
    await event_bus.emit("workspaces_updated", workspaces)

    return {
        "workspaces": workspaces,
        "total_items": len(all_items),
        "clusters_found": len(workspaces)
    }


@router.get("/list")
async def list_workspaces():
    """Return cached workspaces. Falls back to SQLite if cache is empty."""
    if _cache["workspaces"]:
        return {"workspaces": _cache["workspaces"]}
    return {"workspaces": _load_workspaces_from_db()}


@router.post("/restore/{workspace_id}")
async def restore(workspace_id: str):
    """
    Restore (focus) a saved workspace.
    Full window focus implementation can use pywin32 SetForegroundWindow.
    For MVP: returns status and the workspace items for UI to act on.
    """
    workspaces = _cache["workspaces"] or _load_workspaces_from_db()
    target = next((ws for ws in workspaces if ws["id"] == workspace_id), None)

    if not target:
        return {"status": "not_found", "workspace_id": workspace_id}

    # Log the restore as a switch event
    log_workspace_switch(target["name"])

    return {
        "status": "restored",
        "workspace_id": workspace_id,
        "workspace_name": target["name"],
        "items": target["items"]
    }
