from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@router.post("")
async def chat_endpoint(req: ChatRequest):
    """
    Mock AI Chat endpoint.
    In the full version, this connects to Ollama (Qwen2.5) with context from memory.
    """
    msg = req.message.lower()
    reply = f"I received your message: '{req.message}'. I am the local KnemOS AI (Mock)."

    # Basic semantic routing simulations
    if "morning" in msg or "today" in msg:
        reply = "This morning you were working on the 'Minimal White' theme implementation and reviewing Chrome tabs for Tailwind CSS."
    elif "screenshot" in msg:
        reply = "I found 3 screenshots from today. They mostly contain code diffs for the KnemOS desktop app."
    elif "files" in msg:
        reply = "You were actively editing 'index.css', 'SettingsPanel.tsx', and 'App.tsx' in the DESKTOP_APP/src folder."
    elif "bug" in msg or "fix" in msg:
        reply = "You were looking at a UI alignment bug in the CategoryCard. The relevant tabs were StackOverflow and the Framer Motion docs."

    return {
        "reply": reply,
        "context": {
            "workspaces": ["Knemos Dev", "Research"],
            "screenshots_analyzed": 0
        }
    }
