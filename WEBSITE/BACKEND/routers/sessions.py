# backend/routers/sessions.py
"""
Session management endpoints:
  GET  /api/sessions/current   — active session info
  GET  /api/sessions/list      — recent sessions (last 7 days)
"""
import sqlite3
import time
import uuid
from fastapi import APIRouter
from services.data_collector import get_open_windows, get_browser_tabs
from services.wolfram_analytics import compute_focus_score

router = APIRouter()

DB_PATH = "./data/knemos.db"

# Current session state (in-memory)
_current_session = {
    "id": str(uuid.uuid4()),
    "start_time": int(time.time()),
    "dominant_apps": [],
    "interruptions": 0,
    "tab_count": 0,
    "app_count": 0,
}


@router.get("/current")
async def current_session():
    """Return current active session info."""
    import asyncio
    now = int(time.time())
    duration_secs = now - _current_session["start_time"]
    duration_mins = duration_secs // 60

    # Get live data for current session context
    windows = await asyncio.to_thread(get_open_windows)
    tabs = await asyncio.to_thread(get_browser_tabs)
    focus = await asyncio.to_thread(compute_focus_score)

    _current_session["app_count"] = len(windows)
    _current_session["tab_count"] = len(tabs)

    # Dominant apps (top 3 by recency)
    dominant = [w.title for w in windows[:3]]
    _current_session["dominant_apps"] = dominant

    return {
        "id": _current_session["id"],
        "start_time": _current_session["start_time"],
        "duration_minutes": duration_mins,
        "dominant_apps": dominant,
        "app_count": len(windows),
        "tab_count": len(tabs),
        "focus_score": focus.get("score", 0),
        "focus_grade": focus.get("grade", "—"),
        "interruptions": _current_session["interruptions"],
        "status": "active"
    }


@router.get("/list")
async def list_sessions():
    """Return sessions from the last 7 days."""
    try:
        import asyncio
        
        def _get_sessions():
            conn = sqlite3.connect(DB_PATH, timeout=15.0)
            rows = conn.execute(
                """SELECT id, start_time, end_time, dominant_app, item_count, focus_score, interruptions, summary
                   FROM sessions ORDER BY start_time DESC LIMIT 20"""
            ).fetchall()
            conn.close()
            return rows
            
        rows = await asyncio.to_thread(_get_sessions)
        sessions = [
            {
                "id": r[0],
                "start_time": r[1],
                "end_time": r[2],
                "dominant_app": r[3],
                "item_count": r[4],
                "focus_score": r[5],
                "interruptions": r[6],
                "summary": r[7]
            }
            for r in rows
        ]
        return {"sessions": sessions}
    except Exception as e:
        print(f"[Sessions] DB error: {e}")
        return {"sessions": []}


@router.post("/interrupt")
async def log_interruption():
    """Log an interruption to the current session."""
    _current_session["interruptions"] += 1
    return {"interruptions": _current_session["interruptions"]}
