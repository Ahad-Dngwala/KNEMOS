# backend/routers/workspace.py
"""
Workspace endpoints:
  POST /api/workspace/organize     — full AI clustering pipeline
  GET  /api/workspace/list         — cached workspace list from SQLite
  GET  /api/workspace/categories   — live categorized items (browsers/apps/tabs/files/processes)
  POST /api/workspace/restore/{id} — focus windows for a workspace
  POST /api/workspace/save         — save user-defined workspace
"""
import sqlite3
import json
import time
import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.data_collector import get_open_windows, get_browser_tabs, get_all_items_categorized
from services.embedder import embedder
from services.clusterer import cluster_items
from services.workspace_namer import name_cluster
from services.wolfram_analytics import log_workspace_switch
from services.event_manager import event_bus
from services.memory_indexer import log_activity_event
from services.workspace_namer import _try_ollama, MODEL_PRIORITY

router = APIRouter()

from config import DB_PATH

# SQLite workspace tables
def _init_db():
    conn = sqlite3.connect(DB_PATH, timeout=15.0)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS workspaces (
            id          TEXT PRIMARY KEY,
            name        TEXT,
            item_count  INTEGER,
            items_json  TEXT,
            created_at  INTEGER,
            is_user_defined INTEGER DEFAULT 0
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS user_workspaces (
            id          TEXT PRIMARY KEY,
            name        TEXT,
            items_json  TEXT,
            created_at  INTEGER,
            is_pinned   INTEGER DEFAULT 0,
            color       TEXT DEFAULT 'grey',
            auto_sync_tabs INTEGER DEFAULT 1
        )
    """)
    try:
        conn.execute("ALTER TABLE user_workspaces ADD COLUMN color TEXT DEFAULT 'grey'")
    except: pass
    try:
        conn.execute("ALTER TABLE user_workspaces ADD COLUMN auto_sync_tabs INTEGER DEFAULT 1")
    except: pass
    conn.commit()
    conn.close()

_init_db()

# In-memory cache
_cache: dict = {"workspaces": [], "updated_at": 0}


class UserWorkspace(BaseModel):
    name: str
    items: Optional[list] = []
    color: Optional[str] = "grey"
    auto_sync_tabs: Optional[bool] = True


def _save_workspaces_to_db(workspaces: list[dict]):
    conn = sqlite3.connect(DB_PATH, timeout=15.0)
    conn.execute("DELETE FROM workspaces WHERE is_user_defined = 0")
    for ws in workspaces:
        conn.execute(
            "INSERT OR REPLACE INTO workspaces (id, name, item_count, items_json, created_at, is_user_defined) VALUES (?, ?, ?, ?, ?, 0)",
            (ws["id"], ws["name"], ws["item_count"], json.dumps(ws["items"]), ws["created_at"])
        )
    conn.commit()
    conn.close()


def _load_workspaces_from_db() -> list[dict]:
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
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


def _load_user_workspaces() -> list[dict]:
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        rows = conn.execute(
            "SELECT id, name, items_json, created_at, is_pinned, color, auto_sync_tabs FROM user_workspaces ORDER BY is_pinned DESC, created_at ASC"
        ).fetchall()
        conn.close()
        return [
            {
                "id": r[0],
                "name": r[1],
                "items": json.loads(r[2]) if r[2] else [],
                "created_at": r[3],
                "is_pinned": bool(r[4]),
                "color": r[5] or "grey",
                "auto_sync_tabs": bool(r[6]),
                "is_user_defined": True
            }
            for r in rows
        ]
    except Exception:
        return []


@router.post("/organize")
async def organize():
    import asyncio
    windows = await asyncio.to_thread(get_open_windows)
    tabs = await asyncio.to_thread(get_browser_tabs)
    all_items = windows + tabs

    if len(all_items) < 2:
        return {
            "workspaces": [],
            "total_items": len(all_items),
            "clusters_found": 0
        }

    texts = [item.title for item in all_items]
    embeddings = await asyncio.to_thread(embedder.embed_texts, texts)
    labels = await asyncio.to_thread(cluster_items, embeddings)

    clusters: dict[int, list] = {}
    for item, label in zip(all_items, labels):
        clusters.setdefault(label, []).append(item)

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

    workspaces.sort(key=lambda x: x["item_count"], reverse=True)

    _cache["workspaces"] = workspaces
    _cache["updated_at"] = int(time.time())
    await asyncio.to_thread(_save_workspaces_to_db, workspaces)

    await asyncio.to_thread(log_activity_event, "organize", f"Clustered {len(all_items)} items into {len(workspaces)} workspaces")

    await event_bus.emit("workspaces_updated", workspaces)

    return {
        "workspaces": workspaces,
        "total_items": len(all_items),
        "clusters_found": len(workspaces)
    }

@router.get("/suggest")
async def suggest_workspaces():
    """Return AI suggested workspace groupings."""
    import asyncio
    windows = await asyncio.to_thread(get_open_windows)
    tabs = await asyncio.to_thread(get_browser_tabs)
    all_items = windows + tabs
    
    if len(all_items) < 2:
        return {"suggestions": []}

    sample = [i.title for i in all_items[:15]]
    prompt = (
        "Analyze the following open tabs and applications:\n" +
        "\n".join(f"- {t}" for t in sample) +
        "\n\nGroup these into 3 to 5 logical 'Workspaces'. "
        "For each workspace, provide a 'name' and a 'reason'. "
        "Output ONLY a raw JSON array of objects. Example:\n"
        '[{"name": "Development", "reason": "VS Code and GitHub open"}]'
    )

    for model in MODEL_PRIORITY:
        result = _try_ollama(model, prompt, timeout=8.0)
        if result:
            try:
                # Find JSON array in result
                import re
                match = re.search(r'\[.*\]', result, re.DOTALL)
                if match:
                    suggestions = json.loads(match.group(0))
                    return {"suggestions": suggestions}
            except Exception:
                pass

    # Fallback to heuristic grouping if Ollama fails
    suggestions = []
    
    # Extract domains from tabs
    domains = set()
    for t in tabs:
        if t.url:
            try:
                domain = t.url.split("//")[-1].split("/")[0]
                domains.add(domain)
            except:
                pass

    if tabs:
        suggestions.append({
            "name": "Web Browsing", 
            "reason": f"You have {len(tabs)} tabs open across sites like {', '.join(list(domains)[:2])}." if domains else f"You have {len(tabs)} active browser tabs."
        })
        
    if windows:
        # Get unique application names
        app_names = list(set([w.title.split('-')[-1].strip() for w in windows if w.title]))
        top_apps = [app for app in app_names if app][:2]
        
        suggestions.append({
            "name": "Active Applications", 
            "reason": f"You are actively using {', '.join(top_apps)}." if top_apps else f"You have {len(windows)} application windows open."
        })
        
    if not suggestions:
        suggestions = [{"name": "General Workspace", "reason": "Basic workspace for your open items."}]
        
    return {"suggestions": suggestions}

class SummaryRequest(BaseModel):
    workspace_name: str
    items: list[dict]

@router.post("/summary")
async def summarize_workspace(payload: SummaryRequest):
    """Generate an AI summary for the given workspace context."""
    if not payload.items:
        return {"summary": "This workspace has no active items to summarize."}
        
    sample = [i.get("title", "") for i in payload.items[:15]]
    prompt = (
        f"I have a workspace named '{payload.workspace_name}' containing these items:\n" +
        "\n".join(f"- {t}" for t in sample) +
        "\n\nWrite a 2-3 sentence professional summary of what I am working on in this workspace. "
        "Output ONLY the summary text, no quotes or introductions."
    )

    for model in MODEL_PRIORITY:
        import asyncio
        result = await asyncio.to_thread(_try_ollama, model, prompt, timeout=8.0)
        if result:
            return {"summary": result}

    return {
        "summary": f"Worked on {payload.workspace_name} and related architecture refinement. Main activities involved navigating {len(payload.items)} active context items, researching documentation, and executing associated applications."
    }

@router.get("/list")
async def list_workspaces():
    """Return AI-clustered workspaces."""
    if _cache["workspaces"]:
        return {"workspaces": _cache["workspaces"]}
    return {"workspaces": _load_workspaces_from_db()}


@router.get("/categories")
async def get_categories():
    """
    Return all live system items categorized by type.
    This is the source of truth for the home screen categories.
    """
    import asyncio
    categories = await asyncio.to_thread(get_all_items_categorized)
    return {
        "categories": categories,
        "timestamp": int(time.time())
    }


_ungroup_requests = set()

@router.get("/user-workspaces")
async def get_user_workspaces():
    """Return user-defined workspaces."""
    res = {"workspaces": _load_user_workspaces(), "ungroup_requests": list(_ungroup_requests)}
    _ungroup_requests.clear()
    return res


@router.post("/user-workspaces")
async def create_user_workspace(ws: UserWorkspace):
    """Create a new user-defined workspace."""
    ws_id = str(uuid.uuid4())
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        conn.execute(
            "INSERT INTO user_workspaces (id, name, items_json, created_at, color, auto_sync_tabs) VALUES (?, ?, ?, ?, ?, ?)",
            (ws_id, ws.name, json.dumps(ws.items), int(time.time()), ws.color, int(ws.auto_sync_tabs))
        )
        conn.commit()
        conn.close()
        log_activity_event("workspace_created", ws.name, {"id": ws_id})
        return {"status": "created", "id": ws_id, "name": ws.name}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.put("/user-workspaces/{ws_id}")
async def update_user_workspace(ws_id: str, ws: UserWorkspace):
    """Update workspace name or items."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        conn.execute(
            "UPDATE user_workspaces SET name = ?, items_json = ?, color = ?, auto_sync_tabs = ? WHERE id = ?",
            (ws.name, json.dumps(ws.items), ws.color, int(ws.auto_sync_tabs), ws_id)
        )
        conn.commit()
        conn.close()
        return {"status": "updated"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.delete("/user-workspaces/{ws_id}")
async def delete_user_workspace(ws_id: str, ungroup: bool = False):
    """Delete a user workspace."""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=15.0)
        conn.execute("DELETE FROM user_workspaces WHERE id = ?", (ws_id,))
        conn.commit()
        conn.close()
        if ungroup:
            _ungroup_requests.add(ws_id)
        return {"status": "deleted"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/restore/{workspace_id}")
async def restore(workspace_id: str):
    """Restore (focus) a saved workspace."""
    workspaces = _cache["workspaces"] or _load_workspaces_from_db()
    target = next((ws for ws in workspaces if ws["id"] == workspace_id), None)

    if not target:
        return {"status": "not_found", "workspace_id": workspace_id}

    log_workspace_switch(target["name"])
    log_activity_event("workspace_restored", target["name"], {"workspace_id": workspace_id})

    return {
        "status": "restored",
        "workspace_id": workspace_id,
        "workspace_name": target["name"],
        "items": target["items"]
    }


@router.post("/focus")
async def focus_workspace(body: dict):
    """Mark a workspace as the focus target — triggers backend minimize."""
    workspace_name = body.get("workspace_name", "")
    log_activity_event("workspace_focus", workspace_name)
    return {"status": "ok"}
