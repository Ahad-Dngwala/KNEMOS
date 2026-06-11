# backend/scheduler.py
"""
APScheduler background tasks:
  - Screenshot + index every 60 seconds
  - RAM stats broadcast every 10 seconds
  - Focus score broadcast every 5 minutes

Uses event_bus to communicate with WebSocket manager (decoupled).
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.memory_indexer import capture_and_index
from services.data_collector import get_ram_stats
from services.wolfram_analytics import compute_focus_score, log_ram_snapshot
from services.event_manager import event_bus

scheduler = AsyncIOScheduler()


def start_scheduler(ws_manager):
    """
    Wire up the WebSocket manager via event_bus so scheduler
    doesn't need to import main.py (avoids circular imports).
    """

    #  Register WebSocket broadcast handlers 
    async def _on_capture_complete(screenshot_id: str):
        await ws_manager.broadcast({
            "type": "capture_complete",
            "screenshot_id": screenshot_id
        })

    async def _on_ram_update(stats: dict):
        await ws_manager.broadcast({
            "type": "ram_update",
            "stats": stats,
            "saved_gb": stats.get("saved_gb", 0)
        })

    async def _on_workspaces_updated(workspaces: list):
        await ws_manager.broadcast({
            "type": "workspace_update",
            "workspaces": workspaces
        })

    async def _on_focus_score_update(score: dict):
        await ws_manager.broadcast({
            "type": "focus_score_update",
            "score": score
        })

    event_bus.on("capture_complete", _on_capture_complete)
    event_bus.on("ram_update", _on_ram_update)
    event_bus.on("workspaces_updated", _on_workspaces_updated)
    event_bus.on("focus_score_update", _on_focus_score_update)

    #  Scheduled jobs 
    @scheduler.scheduled_job('interval', seconds=60, id='screenshot')
    async def screenshot_job():
        try:
            screenshot_id = capture_and_index()
            if screenshot_id:
                await event_bus.emit("capture_complete", screenshot_id)
        except Exception as e:
            print(f"[Scheduler/Screenshot] Error: {e}")

    @scheduler.scheduled_job('interval', seconds=10, id='ram')
    async def ram_job():
        try:
            stats = get_ram_stats()
            log_ram_snapshot(stats["used_gb"], stats["percent"])
            await event_bus.emit("ram_update", stats)
        except Exception as e:
            print(f"[Scheduler/RAM] Error: {e}")

    @scheduler.scheduled_job('interval', minutes=5, id='focus_score')
    async def focus_score_job():
        try:
            score = compute_focus_score()
            await event_bus.emit("focus_score_update", score)
        except Exception as e:
            print(f"[Scheduler/FocusScore] Error: {e}")

    scheduler.start()
    print("[Scheduler] Started: screenshots/60s · RAM/10s · FocusScore/5min")
