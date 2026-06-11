# backend/routers/analytics.py
from fastapi import APIRouter
from services.wolfram_analytics import compute_focus_score, get_heatmap, get_predictions

router = APIRouter()


@router.get("/focus-score")
async def focus_score():
    return compute_focus_score()


@router.get("/heatmap")
async def heatmap():
    return {"data": get_heatmap()}


@router.get("/predictions")
async def predictions():
    return get_predictions()
