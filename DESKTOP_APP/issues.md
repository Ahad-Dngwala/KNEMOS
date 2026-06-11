# KnemOS  Issues, Bugs & Vulnerabilities Tracker

A comprehensive audit of known issues, flaws, security vulnerabilities, and technical debt across the entire KnemOS codebase.

Severity key:  Critical ·  High ·  Medium ·  Low ·  Enhancement

---

## Table of Contents

1. [Security Vulnerabilities](#1-security-vulnerabilities)
2. [Backend  FastAPI](#2-backend--fastapi)
3. [AI Pipeline Issues](#3-ai-pipeline-issues)
4. [Data Persistence (SQLite + ChromaDB)](#4-data-persistence-sqlite--chromadb)
5. [Desktop App  Frontend](#5-desktop-app--frontend)
6. [Real-Time (WebSocket)](#6-real-time-websocket)
7. [Scheduler & Background Jobs](#7-scheduler--background-jobs)
8. [Windows System Integration](#8-windows-system-integration)
9. [TypeScript / Type Safety](#9-typescript--type-safety)
10. [Performance](#10-performance)
11. [Configuration & DevOps](#11-configuration--devops)
12. [Cross-Team Integration Gaps](#12-cross-team-integration-gaps)

---

## 1. Security Vulnerabilities

###  CRIT-001  Unauthenticated API (No Auth on Backend)

**File**: `WEBSITE/BACKEND/main.py`  
**Issue**: The FastAPI backend has **zero authentication**. Every endpoint (`/api/workspace/organize`, `/api/memory/search`, `/api/system/browser-tabs`) is accessible by any process on `localhost` without any token or credential check.  
**Impact**: Any malicious local application can read the user's workspace history, trigger workspace re-organization, inject fake browser tabs, or read indexed screenshot text.  
**Fix**: Implement a locally-generated API key stored in `.env` and validated via a FastAPI dependency (`Depends(verify_api_key)`). The Desktop App and extension should include this key in `Authorization` headers.

---

###  CRIT-002  Path Traversal in Screenshot Endpoint

**File**: `WEBSITE/BACKEND/routers/memory.py` (assumed pattern)  
**Issue**: The backend serves screenshots by reading an `?path=` query parameter. If there is no strict path validation, an attacker (or any process) can request `?path=C:/Users/user/Documents/passwords.txt` to read arbitrary files off the system.  
**Fix**: Validate that the requested path is strictly within the `SCREENSHOTS_PATH` directory using `os.path.commonpath()` before opening the file.

```python
# Safe pattern:
abs_path = os.path.abspath(path)
if not abs_path.startswith(os.path.abspath(SCREENSHOTS_PATH)):
    raise HTTPException(status_code=403, detail="Forbidden")
```

---

###  HIGH-001  `.env` File Contains Sensitive Keys

**File**: `WEBSITE/BACKEND/.env`  
**Issue**: The `.env` file is committed to the repository (or risk of being committed). It contains `WOLFRAM_APP_ID` (a billable API key) and database paths. If the repo becomes public, these credentials are exposed.  
**Fix**: Ensure `.env` is in `.gitignore`. Provide a `.env.example` file with blank values as reference.

---

###  HIGH-002  CORS Allows `chrome-extension://*` Wildcard

**File**: `WEBSITE/BACKEND/main.py`, line ~76  
**Issue**: The CORS configuration allows `chrome-extension://*`  this means **any** Chrome extension installed on the machine can make authenticated requests to the backend.  
**Fix**: Change to allow only the specific extension ID once deployed (e.g., `chrome-extension://abcdefg...`). Store the extension ID in `.env`.

---

###  MED-001  WebSocket Has No Authentication

**File**: `WEBSITE/BACKEND/main.py`  `@app.websocket("/ws")`  
**Issue**: The WebSocket endpoint accepts any connection from any client without verifying the origin or token. A malicious process could open a WebSocket and receive all real-time RAM stats, workspace data, and screenshot notifications.  
**Fix**: Pass a `?token=...` query parameter to the WebSocket URL and validate it against the same locally-generated API key from CRIT-001.

---

## 2. Backend  FastAPI

###  HIGH-003  Synchronous Blocking Calls in Async Context

**File**: `WEBSITE/BACKEND/services/memory_indexer.py`  
**Issue**: `capture_and_index()` calls `pytesseract.image_to_string()` synchronously inside an `async def` APScheduler job. Tesseract is a CPU-bound operation that can block the asyncio event loop for 0.53 seconds, freezing all WebSocket broadcasts and API responses during that time.  
**Fix**: Wrap the Tesseract call in `asyncio.get_event_loop().run_in_executor(None, ...)` to push it to a thread pool.

---

###  MED-002  Wolfram Analytics Blocks Synchronously on Every Request

**File**: `WEBSITE/BACKEND/services/wolfram_analytics.py`  
**Issue**: Every call to `compute_focus_score()` attempts to connect to a Wolfram Kernel. If Wolfram is not installed, the function catches the exception but not before spending time trying to locate the kernel on each scheduled 5-minute call.  
**Fix**: Probe for Wolfram availability **once at startup** and cache the result as a module-level boolean. Skip the call entirely if unavailable.

---

###  MED-003  No Request Validation on `browser-tabs` Endpoint

**File**: `WEBSITE/BACKEND/routers/system.py`  
**Issue**: The `/api/system/browser-tabs` POST endpoint accepts any JSON payload from the extension. There is no validation of structure, field types, or maximum payload size. A malformed or extremely large payload could cause an unhandled exception or memory spike.  
**Fix**: Define a Pydantic model for the expected payload and use it as the request body type. FastAPI will automatically validate and reject invalid payloads.

---

###  LOW-001  `asyncio` Import Placed Mid-File in `main.py`

**File**: `WEBSITE/BACKEND/main.py`, line ~48  
**Issue**: `import asyncio` was added mid-file after the class definition rather than at the top with other imports. This doesn't cause a bug but violates PEP8 and is confusing.  
**Fix**: Move `import asyncio` to the top of `main.py`.

---

###  LOW-002  No API Versioning

**File**: `WEBSITE/BACKEND/main.py`  
**Issue**: All endpoints use `/api/...` with no version prefix (e.g., `/api/v1/...`). When breaking changes are made (e.g., the Chrome Extension expects a specific response format), there is no way to maintain backward compatibility.  
**Fix**: Prefix all routes with `/api/v1/...`.

---

## 3. AI Pipeline Issues

###  HIGH-004  ChromaDB Collection Dimension Mismatch on Model Change

**File**: `WEBSITE/BACKEND/services/memory_indexer.py`  
**Issue**: ChromaDB collections are created with a fixed dimension. If the embedding model is changed (e.g., from `all-MiniLM` at 384 dims to `mxbai-embed-large` at 1024 dims), all subsequent insert operations silently fail with `Collection expecting embedding with dimension of 384, got 1024`.  
**Impact**: Memory Lane stops working entirely. No new screenshots are indexed.  
**Fix**: On startup, read the stored collection metadata and compare expected dimension to the current model's output dimension. If mismatched, automatically recreate the collection with the correct dimension and log a warning to the user.

---

###  MED-004  Zero-Vector Embeddings Corrupt Similarity Search

**File**: `WEBSITE/BACKEND/services/embedder.py`  
**Issue**: When `mxbai-embed-large` is unavailable (Ollama down), `embed_single()` returns `np.zeros(1024)`. This zero vector gets inserted into ChromaDB. When a real query is later embedded and compared, the cosine similarity of any vector against a zero vector is mathematically undefined (0/0), which can cause ChromaDB to return corrupted or nonsensical results.  
**Fix**: Do not insert embeddings into ChromaDB if the embedding failed. Return an explicit error response to the caller so the indexing is skipped, not silently corrupted.

---

###  MED-005  HDBSCAN Fails Silently on < 2 Items

**File**: `WEBSITE/BACKEND/routers/workspace.py`, line ~95  
**Issue**: The `organize` endpoint returns early if `len(all_items) < 2`, but gives no feedback to the user. The UI will simply display an empty workspace list with no explanation.  
**Fix**: Return a structured response with a `reason` field (e.g., `{"workspaces": [], "reason": "Not enough windows open to cluster"}`). The frontend should display this message in the workspace panel.

---

###  MED-006  Workspace Namer Loops Through Both Qwen Models Even When First Succeeds

**File**: `WEBSITE/BACKEND/services/workspace_namer.py`  
**Issue**: The `MODEL_PRIORITY` loop iterates through `[qwen2.5:7b, qwen2.5:3b]`. If `qwen2.5:7b` returns a valid name, the code correctly breaks. But if `qwen2.5:7b` is not installed, the 5-second timeout is fully waited before trying `qwen2.5:3b`. With many clusters, this multiplies: for 5 clusters, the naming step can block for 25 seconds.  
**Fix**: On first startup, probe which models are available and set `MODEL_PRIORITY` to only the installed ones. Cache this result for the process lifetime.

---

###  LOW-003  Embedder Probe Doesn't Verify 1024-Dim Output

**File**: `WEBSITE/BACKEND/services/embedder.py`  `_probe_ollama()`  
**Issue**: The probe sends a test embedding request and only checks `status_code == 200`. It does not verify that the returned embedding has the correct 1024 dimensions. If a different (incompatible) Ollama model is configured in `.env`, the probe passes but all subsequent embeddings are the wrong dimension.  
**Fix**: In the probe, deserialize the response and assert `len(data["embedding"]) == 1024`.

---

## 4. Data Persistence (SQLite + ChromaDB)

###  HIGH-005  SQLite DB Path is Hardcoded, Ignores `.env`

**File**: `WEBSITE/BACKEND/routers/workspace.py`, line ~22  
**Issue**: `DB_PATH = "./data/knemos.db"` is hardcoded directly in the router file. The `.env` file defines `DB_PATH` but it is never read here.  
**Fix**: Load `DB_PATH = os.getenv("DB_PATH", "./data/knemos.db")` at module level.

---

###  MED-007  SQLite Has No Connection Pooling

**File**: `WEBSITE/BACKEND/routers/workspace.py`  
**Issue**: Every database operation opens a new `sqlite3.connect()`, executes, and closes. Under concurrent requests (multiple WebSocket clients + REST calls), this can hit SQLite's write-lock limitation and throw `database is locked` errors.  
**Fix**: Use `aiosqlite` for async SQLite access, or use `SQLAlchemy` with a connection pool.

---

###  MED-008  ChromaDB Not Backed Up

**File**: `WEBSITE/BACKEND/data/chromadb/`  
**Issue**: The ChromaDB vector store accumulates valuable indexed memory. There is no backup mechanism. If the directory is deleted (as was done during the dimension-fix earlier in development), all of the user's Memory Lane history is permanently lost.  
**Fix**: Implement a scheduled daily backup of the `chromadb` directory to a date-stamped `.zip` file in a `backups/` folder.

---

###  LOW-004  No `created_at` Index on SQLite Workspaces Table

**File**: `WEBSITE/BACKEND/routers/workspace.py`  `_init_db()`  
**Issue**: The `workspaces` table has no index on `created_at`. As the table grows over weeks, the `ORDER BY item_count DESC` query will perform a full table scan.  
**Fix**: Add `CREATE INDEX IF NOT EXISTS idx_workspaces_created ON workspaces (created_at DESC)`.

---

## 5. Desktop App  Frontend

###  HIGH-006  Backend URL is Hardcoded in Multiple Files

**Files**: `src/hooks/useWebSocket.ts`, `src/hooks/useWorkspaces.ts`, `src/hooks/useMemorySearch.ts`  
**Issue**: `http://127.0.0.1:8765` and `ws://127.0.0.1:8765/ws` are copy-pasted into three separate files. If the port changes, it must be updated in three places and can be missed.  
**Fix**: Extract into `src/config.ts`:
```typescript
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8765'
export const WS_URL = BACKEND_URL.replace('http', 'ws') + '/ws'
```

---

###  MED-009  `MemoryResult.tsx` Uses HTTP Image Path Instead of `convertFileSrc`

**File**: `DESKTOP_APP/src/components/memory/MemoryResult.tsx`  
**Issue**: Screenshot images are currently loaded via `http://127.0.0.1:8765/api/memory/image?path=...`. This means: (a) the backend must implement a file-serving endpoint, (b) the image data travels over HTTP even though both endpoints are on the same machine, and (c) it does not work in production Tauri builds due to CSP restrictions on `http://` image sources in some configurations.  
**Fix**: Use Tauri's `convertFileSrc()` to create a `asset://` URL that Tauri's asset protocol serves securely and locally:
```typescript
import { convertFileSrc } from '@tauri-apps/api/tauri'
const imageSrc = convertFileSrc(result.screenshot_path)
```

---

###  MED-010  No Error Boundary in Root App

**File**: `DESKTOP_APP/src/App.tsx`  
**Issue**: There is no React Error Boundary wrapping the application. If any child component throws an unhandled JavaScript exception (e.g., from malformed WebSocket JSON), the entire app goes blank with no recovery path.  
**Fix**: Wrap `<App>` in an `<ErrorBoundary>` component that shows a user-friendly "Something went wrong" screen with a "Restart" button that calls Tauri's `relaunch()`.

---

###  MED-011  `useWebSocket` Reconnect Creates Infinite Loop on Unmount

**File**: `DESKTOP_APP/src/hooks/useWebSocket.ts`  
**Issue**: The reconnect logic uses `setTimeout(connect, 3000)` but stores the timer ID in a `ref`. If the component unmounts (e.g., during hot module replacement in development), the reconnect timer is not cleared. This can cause multiple simultaneous WebSocket connections to be created, resulting in duplicate state updates.  
**Fix**: Return a cleanup function from the `useEffect` that calls `clearTimeout(reconnectTimer.current)` and `ws.close()`.

---

###  LOW-005  `App.css` Is Unused

**File**: `DESKTOP_APP/src/App.css`  
**Issue**: The default Vite-generated `App.css` is still present but its styles are overridden by `index.css`. It is an unused file causing minor confusion.  
**Fix**: Delete `App.css` and remove its import from `App.tsx`.

---

###  LOW-006  No Loading State for Initial Workspace Fetch

**File**: `DESKTOP_APP/src/components/workspace/WorkspaceDashboard.tsx`  
**Issue**: On first boot, before the WebSocket connects and before the React Query initial fetch completes, the workspace panel is empty with no visual feedback. The user does not know if the app is loading or the backend is down.  
**Fix**: Check `isLoading` from `useWorkspaces` and render skeleton cards while loading.

---

## 6. Real-Time (WebSocket)

###  MED-012  WebSocket Broadcasts to All Clients Simultaneously (No Backpressure)

**File**: `WEBSITE/BACKEND/main.py`  `ConnectionManager.broadcast()`  
**Issue**: When the scheduler fires a `ram_update` event every 10 seconds, it broadcasts to all connected clients simultaneously using `await conn.send_json(...)`. If a client's network buffer is full (slow client), `send_json` will block until it completes, delaying the broadcast for all other clients.  
**Fix**: Use `asyncio.gather(*[conn.send_json(msg) for conn in self.connections], return_exceptions=True)` to send to all clients concurrently.

---

###  MED-013  No WebSocket Message Size Limit

**File**: `WEBSITE/BACKEND/main.py`  
**Issue**: There is no limit on the size of WebSocket messages. If the workspace list grows very large (e.g., 200 windows, each with metadata), the JSON payload could be very large, causing delays.  
**Fix**: Implement pagination or summarization for large workspace payloads. Alternatively, send only the delta (changes) rather than the full workspace list on every update.

---

## 7. Scheduler & Background Jobs

###  MED-014  `auto_organize_job` Imports `organize` at Runtime

**File**: `WEBSITE/BACKEND/scheduler.py`  
**Issue**: The `auto_organize_job` imports `from routers.workspace import organize` inside the async function body. This works but is a pattern that can cause subtle circular import issues if the module graph changes. Python's import system caches modules, but runtime imports inside async functions are unusual and harder to debug.  
**Fix**: Move the import to the top of `scheduler.py` or use dependency injection via a callable passed into `start_scheduler()`.

---

###  MED-015  Scheduler Has No Jitter / Startup Delay

**File**: `WEBSITE/BACKEND/scheduler.py`  
**Issue**: All scheduled jobs fire simultaneously at startup (T+10s for RAM, T+30s for organize, T+60s for screenshots). This causes a "thundering herd" at startup where all background jobs compete for system resources at once.  
**Fix**: Add `jitter` parameter to each job or use `next_run_time` to stagger the first execution:
```python
@scheduler.scheduled_job('interval', seconds=30, id='auto_organize', next_run_time=datetime.now() + timedelta(seconds=10))
```

---

###  LOW-007  Missed Job Logs Are Noisy

**File**: APScheduler default behavior  
**Issue**: The log contains `Run time of job ... was missed by 0:00:03.486942`. This occurs when the RAM job's 10-second interval is missed because the system is busy. It is not an error but it clutters the terminal.  
**Fix**: Set `misfire_grace_time=15` on the RAM job so APScheduler tolerates up to 15 seconds of slippage before logging a miss.

---

## 8. Windows System Integration

###  HIGH-007  `get_open_windows()` Has No Filter for System Processes

**File**: `WEBSITE/BACKEND/services/data_collector.py`  
**Issue**: The function likely returns all open windows, including system processes like `Microsoft Text Input Application`, `Settings`, and Windows shell internals. These pollute the clustering data and generate meaningless workspace names like "System Settings".  
**Fix**: Add a deny-list of known system process titles and filter them from the result before embedding.

---

###  MED-016  Screenshots Include Sensitive Data (Passwords, Keys)

**File**: `WEBSITE/BACKEND/services/memory_indexer.py`  
**Issue**: The screenshot capture is indiscriminate. If the user has a password manager or terminal with environment variables open, those secrets will be embedded into ChromaDB as searchable vectors.  
**Impact**: A high-similarity vector search could theoretically surface context about sensitive windows.  
**Fix**: Implement a blocklist of window titles (e.g., `KeePass`, `1Password`, `Bitwarden`) and skip screenshot capture when these windows are in the foreground.

---

###  MED-017  Windows-Only (`pywin32`) Breaks Non-Windows Platforms

**File**: `WEBSITE/BACKEND/services/data_collector.py`  
**Issue**: `import win32gui` will throw `ImportError` on macOS and Linux, making the entire backend non-functional on non-Windows platforms.  
**Fix**: Wrap the import in a try-except with platform detection:
```python
import platform
if platform.system() == 'Windows':
    import win32gui
    ...
```
And provide stub implementations for other platforms that return empty lists.

---

## 9. TypeScript / Type Safety

###  MED-018  `allowImportingTsExtensions` in `tsconfig.json` Is Non-Standard

**File**: `DESKTOP_APP/tsconfig.json`  
**Issue**: Using `allowImportingTsExtensions: true` (required for the `.tsx` explicit imports in `AnalyticsDashboard.tsx`) requires `noEmit: true` or `emitDeclarationOnly: true`. This works but it is a non-standard pattern. Standard TypeScript projects do not use explicit `.tsx` in import paths.  
**Fix**: The root cause was IDE staleness. Remove the explicit `.tsx` extensions from the imports in `AnalyticsDashboard.tsx` and restart the TypeScript language server instead.

---

###  LOW-008  React Query `queryClient` Has Default Retry of 3

**File**: `DESKTOP_APP/src/main.tsx`  
**Issue**: The default `QueryClient` retries failed requests 3 times. For a local backend, if the backend is down, this means every request will attempt 3 times before showing an error  adding unnecessary delay to the "backend is down" feedback.  
**Fix**: Configure `defaultOptions: { queries: { retry: 1 } }` in the `QueryClient` constructor.

---

## 10. Performance

###  MED-019  Zustand Store Updates Are Not Batched

**File**: `DESKTOP_APP/src/hooks/useWebSocket.ts`  
**Issue**: When a `workspace_update` WebSocket payload arrives, `setWorkspaces()` is called which triggers a re-render. There is no batching. If multiple events arrive in rapid succession (e.g., on startup), multiple synchronous re-renders occur.  
**Fix**: React 18's concurrent features automatically batch state updates in async contexts (like WebSocket handlers). This should already be handled, but verify that `ReactDOM.createRoot` is used (not legacy `ReactDOM.render`).

---

###  MED-020  No Virtualization for Large Workspace / Memory Result Lists

**File**: `DESKTOP_APP/src/components/` (WorkspaceDashboard, MemoryLane)  
**Issue**: If a user has 50+ workspaces or 200+ memory results, the DOM will become very large. React renders all list items regardless of scroll position.  
**Fix**: Implement virtual scrolling using `@tanstack/react-virtual` for any list that might exceed 20-30 items.

---

###  LOW-009  Screenshots Not Compressed Before Embedding

**File**: `WEBSITE/BACKEND/services/memory_indexer.py`  
**Issue**: Screenshots are captured at full desktop resolution. The raw files can be 3-10 MB each. Over 60 days of 60-second captures, this is 72-240 GB of storage.  
**Fix**: Compress screenshots to JPEG at 60% quality and scale to 50% resolution before saving. The OCR is performed before compression so text quality is not affected.

---

## 11. Configuration & DevOps

###  MED-021  No `requirements.txt` Hash Pinning

**File**: `WEBSITE/BACKEND/requirements.txt`  
**Issue**: Dependencies are pinned by version range (e.g., `fastapi>=0.100`) but not by hash. A compromised PyPI package could inject malicious code on `pip install`.  
**Fix**: Use `pip-compile --generate-hashes` to generate a lock file with cryptographic hashes for every dependency.

---

###  MED-022  Running `uvicorn --reload` in Production

**Issue**: The user has been running the server with `--reload` enabled. This mode uses `watchfiles` to monitor the entire backend directory and reload on any file change. This is a development-only feature and should never be used in production as it wastes CPU and can cause partial state loss on reload.  
**Fix**: The production startup command should be `uvicorn main:app --host 127.0.0.1 --port 8765` (no `--reload`).

---

###  LOW-010  No `.env.example` File

**Issue**: New developers (or Person 1 / Person 3 trying to run the backend) have no reference for what environment variables are required.  
**Fix**: Create `WEBSITE/BACKEND/.env.example` with all keys present but values blank or documented.

---

## 12. Cross-Team Integration Gaps

###  MED-023  No Validation That Extension Tab Data Matches Expected Schema

**File**: `WEBSITE/BACKEND/routers/system.py`  
**Issue**: Person 3's Chrome extension will POST tab data to `/api/system/browser-tabs`. There is currently no Pydantic model enforcing the expected shape of this payload. If Person 3's schema drifts, the backend will silently receive malformed data.  
**Fix**: Define and document the tab schema as a shared Pydantic model. Share the TypeScript equivalent type definition with Person 3.

---

###  MED-024  Deep Link `knemos://` Protocol Not Registered

**Issue**: Person 1's website is supposed to trigger a deep link (`knemos://auth?token=...`) to hand off authentication to the Desktop App. This protocol handler is not registered in `tauri.conf.json`.  
**Fix**: Register the custom protocol in `tauri.conf.json`:
```json
"deep-link": {
  "protocols": [{"name": "knemos", "schemes": ["knemos"]}]
}
```
And handle it in `main.rs` or via the `@tauri-apps/plugin-deep-link` plugin.

---

###  LOW-011  Website CORS Entry `knemos.vercel.app` is Hardcoded

**File**: `WEBSITE/BACKEND/main.py`  
**Issue**: The Vercel deployment URL for Person 1's website is hardcoded in the CORS allow-list. If the Vercel project URL changes, the backend must be manually updated.  
**Fix**: Move the allowed origin list to `.env` as a comma-separated string and parse it at startup.

---

*End of issues tracker. This document should be updated as issues are resolved or new ones discovered.*
