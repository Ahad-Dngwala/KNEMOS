# backend/routers/memory.py
from fastapi import APIRouter
from pydantic import BaseModel
from services.memory_indexer import search_memory, capture_and_index, list_screenshots

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    limit: int = 5


@router.post("/search")
async def search(req: SearchRequest):
    results = search_memory(req.query, req.limit)
    return {"results": results}


@router.get("/screenshots")
async def screenshots():
    items = list_screenshots(limit=50)
    return {"screenshots": items, "total": len(items)}


@router.post("/capture")
async def force_capture():
    screenshot_id = capture_and_index()
    return {
        "status": "captured" if screenshot_id else "skipped",
        "screenshot_id": screenshot_id or "skipped"
    }
