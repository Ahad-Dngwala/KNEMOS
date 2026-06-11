# KnemOS  Features Catalogue

Complete list of all features across the KnemOS system.
Status key:  Built ·  Partially Built ·  Planned

---

##  Core AI Pipeline

| Feature | Description | Status |
|---|---|---|
| **Semantic Embedding** | All open windows/tabs embedded via `mxbai-embed-large` (1024-dim) |  Built |
| **HDBSCAN Clustering** | Density-based semantic grouping of open resources |  Built |
| **Workspace Naming (Qwen2.5:7b)** | AI names clusters via Ollama LLM with 5s timeout |  Built |
| **Workspace Naming (Qwen2.5:3b)** | Lighter fallback LLM for low-end machines |  Built |
| **Heuristic Naming Fallback** | Domain keyword analysis as instant fallback (always available) |  Built |
| **Auto-Organize Scheduler** | Auto-runs full clustering pipeline every 30 seconds |  Built |
| **Strict mxbai-embed-large** | Sentence-transformers fallback removed; only mxbai used |  Built |

---

##  Memory Lane

| Feature | Description | Status |
|---|---|---|
| **Periodic Screenshot Capture** | Captures screen every 60 seconds via `mss` |  Built |
| **Tesseract OCR Indexing** | Extracts text from each screenshot |  Built |
| **Semantic Memory Embedding** | OCR text embedded into ChromaDB (1024-dim) |  Built |
| **Natural Language Search** | `/api/memory/search?q=...` returns ranked results |  Built |
| **Memory Result UI** | Displays timestamp, text preview, similarity score |  Built |
| **Screenshot Preview** | Shows thumbnail of the captured screen state |  Partial (path returned, thumbnail loading needs `convertFileSrc`) |
| **Search Debouncing** | 400ms input debounce before firing query |  Built |

---

##  Workspace Management

| Feature | Description | Status |
|---|---|---|
| **Workspace List Endpoint** | `GET /api/workspace/list` returns AI clusters |  Built |
| **Organize Endpoint** | `POST /api/workspace/organize` runs full pipeline |  Built |
| **Restore Endpoint** | `POST /api/workspace/restore/{id}` re-focuses saved workspace |  Built |
| **SQLite Persistence** | Workspace metadata (ID, name, items, timestamp) stored locally |  Built |
| **Browser Tab Ingestion** | `POST /api/system/browser-tabs` for Chrome Extension data |  Built |
| **Open Window Detection** | `pywin32` reads all open window titles on Windows |  Built |
| **In-Memory Cache** | Last organize result cached in-process for instant `list` response |  Built |
| **Real-Time WebSocket Push** | Workspace updates pushed to Desktop App immediately |  Built |
| **Window Restore (pywin32)** | Actually focus/switch to saved windows |  Planned |

---

##  Analytics

| Feature | Description | Status |
|---|---|---|
| **Cognitive Focus Score** | Wolfram Language-computed 0-100 productivity score |  Built |
| **Focus Grade (A/B/C)** | Letter grade derived from score |  Built |
| **RAM Usage Monitoring** | Live used/available/total GB via `psutil` |  Built |
| **RAM Recovery Estimation** | Calculates GB "saved" vs idle |  Built |
| **Context Switch Logging** | Logs every workspace switch event to SQLite |  Built |
| **Peak Hour Computation** | Wolfram analyzes activity log for peak productivity hour |  Built |
| **Workflow Heatmap Data** | API returns activity-by-hour data |  Built |
| **Workflow Chart UI** | Renders chart data in `WorkflowChart.tsx` |  Built |
| **Focus Score Gauge UI** | Animated circular score display in `FocusScore.tsx` |  Built |
| **Wolfram Kernel Check** | Graceful fallback if Wolfram Engine not installed |  Built |
| **RAM Snapshots in SQLite** | Periodic RAM readings stored for historical analysis |  Built |
| **Next-Workspace Prediction** | ML prediction of what workspace user will switch to next |  Planned |
| **Cognitive Heatmap (Visual)** | Visual grid showing productive hours per day |  Planned |

---

##  Real-Time System

| Feature | Description | Status |
|---|---|---|
| **WebSocket Server** | `ws://127.0.0.1:8765/ws` for push-based updates |  Built |
| **Multi-Client Support** | `ConnectionManager` handles multiple connected Desktop App instances |  Built |
| **Dead Connection Cleanup** | Auto-removes broken WebSocket connections on broadcast |  Built |
| **Ping/Pong Keepalive** | Responds to `"ping"` text frames with `{"type": "pong"}` |  Built |
| **Auto-Reconnect (Frontend)** | `useWebSocket` retries after 3s on connection close |  Built |
| **Event Bus Architecture** | `event_manager.py` decouples services from WebSocket manager |  Built |
| **APScheduler Background Jobs** | All tasks run asynchronously without blocking request handling |  Built |

---

##  Desktop App UI

| Feature | Description | Status |
|---|---|---|
| **Tauri v2 Shell** | Frameless native window (1300x840, min 900x600) |  Built |
| **Custom Title Bar** | Draggable title bar with min/max/close controls |  Built |
| **Dark Mode Design System** | Full `@theme` token system in TailwindCSS v4 |  Built |
| **Glassmorphism Cards** | `.glass-card` utility for translucent panel surfaces |  Built |
| **Sidebar Navigation** | Workspace cluster list with active highlighting |  Built |
| **Workspace Dashboard** | Grid of `WorkspaceCard` components with AI names |  Built |
| **Memory Lane Panel** | Search bar + results grid |  Built |
| **Analytics Dashboard** | Focus score + workflow chart + RAM stats |  Built |
| **Deep Work Mode** | Full-screen blur overlay with workspace dimming |  Built |
| **Framer Motion Transitions** | Smooth panel/card transitions on data updates |  Built |
| **Loading Skeletons** | Shimmer placeholders during data fetch |  Partial |
| **Connection Status Indicator** | Live dot in TitleBar showing backend connectivity |  Built |
| **Toast Notifications** | `react-hot-toast` for screenshot indexing events |  Built |
| **Responsive Layout** | Minimum 900px width enforced by Tauri |  Built |
| **Theme Toggle (Light/Dark)** | Manual theme switching |  Planned |

---

##  Security & Privacy

| Feature | Description | Status |
|---|---|---|
| **Local-First Architecture** | All AI processing runs entirely on `127.0.0.1` |  Built |
| **Tauri CSP** | Hard-locked to only allow `127.0.0.1:8765` connections from UI |  Built |
| **No External Telemetry** | Zero analytics, tracking, or error reporting to external servers |  Built |
| **CORS Allowlist** | Backend only accepts from `localhost:1420`, `tauri://localhost`, extension |  Built |
| **Supabase Auth Integration** | Deep-link handoff from Website to Desktop App |  Planned |
| **JWT Validation Endpoint** | Backend validates Supabase tokens from Website |  Planned |

---

##  API Surface

| Feature | Description | Status |
|---|---|---|
| `GET /api/system/health` | Backend health check with version info |  Built |
| `GET /api/system/ram` | Live RAM stats |  Built |
| `GET /api/system/windows` | List of open windows |  Built |
| `POST /api/system/browser-tabs` | Receive tab data from Chrome Extension |  Built |
| `POST /api/workspace/organize` | Trigger semantic clustering pipeline |  Built |
| `GET /api/workspace/list` | Cached workspace list |  Built |
| `POST /api/workspace/restore/{id}` | Restore a saved workspace |  Built |
| `POST /api/memory/search` | Vector search over screenshot memory |  Built |
| `GET /api/memory/screenshots` | List of indexed screenshots |  Built |
| `POST /api/memory/capture` | Force a screenshot capture now |  Built |
| `GET /api/analytics/focus-score` | Wolfram-computed focus score |  Built |
| `GET /api/analytics/heatmap` | Hourly activity heatmap data |  Built |
| `GET /api/analytics/predictions` | Workspace prediction (future) |  Planned |

---

##  Cross-Team Integration

| Feature | Description | Status |
|---|---|---|
| **Chrome Extension Endpoint** | `/api/system/browser-tabs` ready to receive tab data |  Built |
| **Deep Link Protocol** | `knemos://` protocol for Website  Desktop handoff |  Planned |
| **Supabase Token Validation** | Backend validates auth tokens from Website |  Planned |
| **CORS for Website Domain** | `knemos.vercel.app` and `knemos.dev` allowed in CORS |  Built |
| **Website Download Page** | Links to compiled `.exe` installer |  Planned |

---

##  Future / Planned

| Feature | Description |
|---|---|
| **macOS Support** | `pyobjc` integration for window titles on macOS |
| **Linux Support** | `xdotool` / `wnck` for window management |
| **Cloud Sync (Optional)** | Encrypted backup of workspace history to Supabase Storage |
| **Team Workspaces** | Shared semantic workspaces across an organization |
| **Voice Recall** | "Hey KnemOS, what was I working on at 3pm?" |
| **Context Export** | Export any workspace as structured Markdown |
| **Plugin API** | Third-party apps can register as workspace sources |
| **Firefox Extension** | WebExtension port of the Chrome MV3 extension |
| **Multi-Monitor Support** | Separate workspace clustering per monitor |
| **AI Work Summaries** | Daily Markdown summary of what you worked on, generated by LLM |
