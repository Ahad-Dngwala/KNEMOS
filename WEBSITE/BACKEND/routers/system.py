# backend/routers/system.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.data_collector import get_ram_stats, get_open_windows, update_browser_tabs
from models.schemas import BrowserTab

router = APIRouter()


class TabsPayload(BaseModel):
    tabs: List[BrowserTab]


@router.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@router.get("/ram")
async def ram():
    return get_ram_stats()


@router.get("/windows")
async def windows():
    items = get_open_windows()
    return {"windows": [i.model_dump() for i in items]}


@router.post("/browser-tabs")
async def receive_tabs(payload: TabsPayload):
    """Chrome Extension (Person 3) posts browser tabs here."""
    update_browser_tabs([t.model_dump() for t in payload.tabs])
    return {"status": "ok", "received": len(payload.tabs)}
