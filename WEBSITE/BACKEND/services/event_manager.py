# backend/services/event_manager.py
"""
Central event bus for KnemOS services.
Decouples services so they don't import each other directly.
Usage:
    from services.event_manager import event_bus
    await event_bus.emit("workspace_updated", data)
    event_bus.on("workspace_updated", my_handler)
"""
import asyncio
from collections import defaultdict
from typing import Callable, Any


class EventBus:
    def __init__(self):
        self._listeners: dict[str, list[Callable]] = defaultdict(list)

    def on(self, event: str, handler: Callable):
        """Register a synchronous or async handler for an event."""
        self._listeners[event].append(handler)

    def off(self, event: str, handler: Callable):
        """Remove a handler."""
        if handler in self._listeners[event]:
            self._listeners[event].remove(handler)

    async def emit(self, event: str, data: Any = None):
        """Fire all handlers registered for event."""
        for handler in self._listeners.get(event, []):
            try:
                result = handler(data)
                if asyncio.iscoroutine(result):
                    await result
            except Exception as e:
                print(f"[EventBus] Error in handler for '{event}': {e}")

    def emit_sync(self, event: str, data: Any = None):
        """Fire all sync-only handlers. Use when not in async context."""
        for handler in self._listeners.get(event, []):
            try:
                handler(data)
            except Exception as e:
                print(f"[EventBus] Sync error in handler for '{event}': {e}")


# Singleton instance  import this everywhere
event_bus = EventBus()
