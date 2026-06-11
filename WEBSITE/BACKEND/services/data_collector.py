# backend/services/data_collector.py
"""
System data collection: open windows, RAM stats, browser tabs.
Uses pywin32 + psutil for Windows-native access.
"""
import psutil
import win32gui
import win32process
from models.schemas import WorkspaceItem
from typing import List

# Titles to always exclude from workspace detection
IGNORED_TITLES = {
    "KnemOS", "Task Manager", "Program Manager", "", " ",
    "Microsoft Text Input Application", "Settings", "Windows Input Experience"
}


def get_open_windows() -> List[WorkspaceItem]:
    """Enumerate all visible windows using pywin32."""
    items = []
    seen = set()

    def enum_handler(hwnd, _):
        if not win32gui.IsWindowVisible(hwnd):
            return
        title = win32gui.GetWindowText(hwnd).strip()
        if not title or title in IGNORED_TITLES or title in seen:
            return
        seen.add(title)
        try:
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            proc = psutil.Process(pid)
            items.append(WorkspaceItem(
                title=title,
                source='window',
                path=proc.exe()
            ))
        except Exception:
            items.append(WorkspaceItem(title=title, source='window'))

    win32gui.EnumWindows(enum_handler, None)
    return items


def get_ram_stats() -> dict:
    """Return current RAM usage stats with 'saved_gb' estimate."""
    vm = psutil.virtual_memory()
    return {
        "total_gb":     round(vm.total / 1e9, 1),
        "used_gb":      round(vm.used / 1e9, 1),
        "available_gb": round(vm.available / 1e9, 1),
        "percent":      round(vm.percent, 1),
        "saved_gb":     round((vm.total - vm.used) / 1e9 * 0.4, 1)
    }


# In-memory store for browser tabs received from Chrome Extension
_browser_tabs: list[dict] = []


def update_browser_tabs(tabs: list[dict]):
    global _browser_tabs
    _browser_tabs = tabs


def get_browser_tabs() -> List[WorkspaceItem]:
    return [
        WorkspaceItem(title=t['title'], source='browser_tab', url=t.get('url'))
        for t in _browser_tabs
        if t.get('title')
    ]
