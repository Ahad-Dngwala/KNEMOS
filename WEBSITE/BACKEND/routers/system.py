# backend/routers/system.py
"""
System endpoints:
  GET  /api/system/health            — backend ping
  GET  /api/system/ram               — live RAM stats
  GET  /api/system/windows           — open windows
  GET  /api/system/processes         — running processes
  GET  /api/system/focus             — current cognitive focus score
  POST /api/system/browser-tabs      — receive tabs from Chrome Extension
"""
import os
from typing import List
import signal
import threading
from fastapi import APIRouter, Request
from pydantic import BaseModel
from services.data_collector import get_ram_stats, get_open_windows, update_browser_tabs, get_processes
from services.wolfram_analytics import compute_focus_score
from models.schemas import BrowserTab

router = APIRouter()


class TabsPayload(BaseModel):
    browser_id: str = "default"
    browser_type: str = "chrome"
    session_id: str = "default"
    tabs: List[BrowserTab]


@router.get("/health")
async def health(request: Request):
    port = request.url.port or 8765
    return {
        "status": "healthy",
        "backend_version": "2.4.0",
        "port": port,
        "db": True,
        "scheduler": True,
        "websocket": True,
        "activity_logger": True,
        "fully_ready": True
    }

@router.post("/shutdown")
async def shutdown():
    def kill_server():
        import time
        time.sleep(0.5)
        try:
            os.kill(os.getpid(), signal.SIGINT)
        except:
            pass # Windows sometimes requires signal.CTRL_C_EVENT or fallback
            try:
                os.kill(os.getpid(), signal.SIGTERM)
            except:
                pass
    threading.Thread(target=kill_server).start()
    return {"status": "shutting down"}


@router.get("/ram")
async def ram():
    return get_ram_stats()


@router.get("/windows")
async def windows():
    import asyncio
    items = await asyncio.to_thread(get_open_windows)
    return {"windows": [i.model_dump() for i in items]}


@router.get("/processes")
async def processes():
    """Return list of running processes with CPU and memory usage."""
    import asyncio
    procs = await asyncio.to_thread(get_processes)
    return {"processes": procs}


@router.get("/focus")
async def focus():
    """Return current cognitive focus score - was previously missing (404)."""
    import asyncio
    return await asyncio.to_thread(compute_focus_score)


@router.post("/browser-tabs")
async def receive_tabs(payload: TabsPayload):
    """Browser Extensions post tabs here."""
    from services.memory_indexer import log_activity_event
    tabs = [t.model_dump() for t in payload.tabs]
    
    # Deduplicate repeated tab states to avoid redundant DB writes
    import hashlib
    import json
    tabs_hash = hashlib.md5(json.dumps(tabs, sort_keys=True).encode()).hexdigest()
    
    global _last_tabs_hash
    if '_last_tabs_hash' not in globals():
        _last_tabs_hash = {}
        
    if _last_tabs_hash.get(payload.browser_id) == tabs_hash:
        return {"status": "ok", "received": len(tabs), "skipped": True}
        
    _last_tabs_hash[payload.browser_id] = tabs_hash

    # Pass metadata to update_browser_tabs
    update_browser_tabs(payload.browser_id, payload.browser_type, tabs)

    # Log tabs as activity events for RAG context
    for tab in tabs[:10]:  # Log top 10 tabs only
        if tab.get("title"):
            log_activity_event("tab_detected", tab["title"], {
                "url": tab.get("url", ""),
                "active": tab.get("active", False)
            })

    return {"status": "ok", "received": len(tabs)}


def get_dir_size(path: str) -> float:
    total = 0
    if os.path.exists(path):
        for dirpath, _, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                if not os.path.islink(fp):
                    total += os.path.getsize(fp)
    return total / (1024 * 1024)

@router.get("/resources")
async def get_resources():
    return {
        "screenshots_mb": round(get_dir_size("./data/screenshots"), 2),
        "chromadb_mb": round(get_dir_size("./data/chromadb"), 2),
        "sqlite_mb": round(os.path.getsize("./data/knemos.db") / (1024*1024) if os.path.exists("./data/knemos.db") else 0, 2),
        "screenshots_path": os.path.abspath("./data/screenshots"),
    }
