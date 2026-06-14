# backend/services/auth.py
import secrets
import os
from pathlib import Path
from fastapi import Request, HTTPException, Security
from fastapi.security import APIKeyHeader

import jwt

import sys

if getattr(sys, 'frozen', False):
    BACKEND_DIR = Path(sys.executable).resolve().parent
else:
    BACKEND_DIR = Path(__file__).resolve().parent.parent

TOKEN_FILE = BACKEND_DIR / "data" / ".auth_secret"
JWT_TOKEN_FILE = BACKEND_DIR / "data" / ".jwt_token"

_secret = None
_token = None

def init_auth():
    """Generate or load the local JWT token secret."""
    global _secret, _token
    TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    if TOKEN_FILE.exists():
        _secret = TOKEN_FILE.read_text().strip()
    else:
        _secret = secrets.token_urlsafe(32)
        TOKEN_FILE.write_text(_secret)
        try:
            os.chmod(TOKEN_FILE, 0o600)
        except Exception:
            pass
            
    # Generate long-lived local JWT token
    _token = jwt.encode({"sub": "knemos_local", "role": "admin"}, _secret, algorithm="HS256")
    JWT_TOKEN_FILE.write_text(_token)
    try:
        os.chmod(JWT_TOKEN_FILE, 0o600)
    except Exception:
        pass
    print(f"[Auth] Local IPC Token initialized.")

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

async def verify_token(request: Request, auth_header: str = Security(api_key_header)):
    """Dependency to check the local token."""
    if not _token:
        # If init_auth wasn't called, fallback to open (for tests etc. if needed)
        return True
        
    # Check query param (for WebSockets or specific requests)
    token = request.query_params.get("token")
        
    # Check header if not in query
    if not token and auth_header:
        # Standard Bearer format
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = auth_header
            
    if token:
        try:
            # First try local IPC token
            payload = jwt.decode(token, _secret, algorithms=["HS256"])
            if payload.get("sub") == "knemos_local":
                return True
        except jwt.InvalidTokenError:
            pass
            
        try:
            # For Supabase Auth Tokens
            payload = jwt.decode(token, options={"verify_signature": False})
            print(f"[Auth] Decoded payload: {payload}")
            if payload.get("sub") or payload.get("role") == "authenticated":
                return True
            else:
                print(f"[Auth] Payload rejected: missing sub or role. Payload: {payload}")
        except Exception as e:
            print(f"[Auth] JWT Decode error: {e}")
            pass
            
    print(f"[Auth] Rejecting token: {token}")
            
    # For local dev extension integration without token (if needed, we can whitelist specific origins or IPs)
    # Since the Chrome Extension is local and can't read the file, we can either use a fixed extension key 
    # or skip auth for /api/system/browser-tabs by not applying this dependency to that route.

    raise HTTPException(status_code=401, detail="Unauthorized local IPC connection")

def get_current_token():
    return _token
