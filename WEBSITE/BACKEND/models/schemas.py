# backend/models/schemas.py
from pydantic import BaseModel
from typing import Optional, List, Literal


class WorkspaceItem(BaseModel):
    title: str
    source: Literal['browser_tab', 'window', 'file', 'process']
    url: Optional[str] = None
    path: Optional[str] = None


class Workspace(BaseModel):
    id: str
    name: str
    item_count: int
    items: List[WorkspaceItem]
    created_at: int   # Unix timestamp


class MemoryResult(BaseModel):
    id: str
    text_preview: str
    timestamp: int
    screenshot_path: str
    similarity: float


class Screenshot(BaseModel):
    id: str
    timestamp: int
    screenshot_path: str
    text_preview: str


class BrowserTab(BaseModel):
    id: int
    title: str
    url: str
    favIconUrl: Optional[str] = None
    active: bool


class FocusScore(BaseModel):
    score: int                    # 0-100
    grade: Literal['A', 'B', 'C']
    focus_minutes: int
    context_switches: int
    trend: Literal['improving', 'stable', 'declining']


class HeatmapPoint(BaseModel):
    hour: int                     # 0-23
    intensity: int                # 0-100


class RAMStats(BaseModel):
    total_gb: float
    used_gb: float
    available_gb: float
    percent: float
    saved_gb: float


class WindowItem(BaseModel):
    title: str
    source: str = 'window'
    path: Optional[str] = None
