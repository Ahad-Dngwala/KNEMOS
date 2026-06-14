# backend/main.py
"""
KNEMOS FastAPI Backend — Entry Point v2.0
Port: 8765
WebSocket: ws://127.0.0.1:8765/ws

Run: uvicorn main:app --host 127.0.0.1 --port 8765 --reload
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import workspace, memory, analytics, system, chat, activity, sessions, focus, wolfram
from scheduler import start_scheduler
from services.auth import init_auth, verify_token
import uvicorn
from fastapi import Depends


class ConnectionManager:
    """Manages active WebSocket connections with auto-cleanup."""

    def __init__(self):
        self.connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)
        print(f"[WS] Client connected — total: {len(self.connections)}")

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)
        print(f"[WS] Client disconnected — remaining: {len(self.connections)}")

    async def broadcast(self, message: dict):
        """Send JSON to all connected clients, remove dead connections."""
        dead = []
        for conn in self.connections:
            try:
                import asyncio
                await asyncio.wait_for(conn.send_json(message), timeout=2.0)
            except Exception as e:
                print(f"[WS] Broadcast error: {e}")
                dead.append(conn)
        for d in dead:
            if d in self.connections:
                self.connections.remove(d)


manager = ConnectionManager()


import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[KNEMOS] Backend v2.0 starting up...")
    init_auth()
    start_scheduler(manager)
    print("[KNEMOS] Ready at http://127.0.0.1:8765")
    try:
        yield
    except asyncio.CancelledError:
        pass
    # Shutdown
    print("[KNEMOS] Shutting down...")
    from services.wolfram_engine import wolfram_service
    wolfram_service.terminate()


app = FastAPI(
    title="KNEMOS AI Backend",
    version="2.0.0",
    description="Cognitive workspace OS — local AI backend",
    lifespan=lifespan
)

# CORS — covers Tauri dev + prod, Chrome Extension, Website dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1420",
        "http://127.0.0.1:1420",
        "tauri://localhost",
        "https://tauri.localhost",
        "chrome-extension://*",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (Protected)
protected = [Depends(verify_token)]
app.include_router(workspace.router, prefix="/api/workspace", tags=["workspace"], dependencies=protected)
app.include_router(memory.router,    prefix="/api/memory",    tags=["memory"], dependencies=protected)
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"], dependencies=protected)
app.include_router(chat.router,      prefix="/api/chat",      tags=["chat"], dependencies=protected)
app.include_router(activity.router,  prefix="/api/activity",  tags=["activity"], dependencies=protected)
app.include_router(sessions.router,  prefix="/api/sessions",  tags=["sessions"], dependencies=protected)
app.include_router(focus.router,     prefix="/api/focus",     tags=["focus"], dependencies=protected)
app.include_router(wolfram.router,   prefix="/api/wolfram",   tags=["wolfram"], dependencies=protected)

# System Router (Unprotected for extension tabs + health check)
app.include_router(system.router,    prefix="/api/system",    tags=["system"])


# WebSocket
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    # WS Auth
    from services.auth import get_current_token
    import jwt
    
    is_valid = False
    
    if not get_current_token():
        is_valid = True
    elif token == get_current_token():
        is_valid = True
    elif token:
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            if payload.get("sub") or payload.get("role") == "authenticated":
                is_valid = True
        except Exception:
            pass
            
    if not is_valid:
        await websocket.close(code=1008, reason="Unauthorized local IPC connection")
        return

    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import sys
    port = 8765
    if "--port" in sys.argv:
        try:
            port_index = sys.argv.index("--port")
            port = int(sys.argv[port_index + 1])
        except (ValueError, IndexError):
            pass

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=port,
        reload=False,
        log_level="info"
    )
