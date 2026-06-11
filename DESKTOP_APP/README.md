# KnemOS Desktop Application

> The native, AI-powered cognitive shell for your desktop. Built with Tauri v2, React 18, and TailwindCSS v4.

![Tauri](https://img.shields.io/badge/Tauri-v2-000000?style=for-the-badge&logo=tauri)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## What Is This?

The KnemOS Desktop App is the **visual and interactive layer** of the KnemOS system. It is not a standalone application  it acts as a reactive display shell that connects to the local FastAPI AI engine running on `127.0.0.1:8765`.

Think of it as the cockpit: the backend engine does all the thinking, and this app is the dashboard you steer with.

The key engineering decision was to choose **Tauri v2 over Electron**. This results in a ~10 MB binary instead of a ~150 MB one, a native Rust security layer, and RAM usage of ~30 MB vs ~200 MB. For a productivity tool that runs 24/7, this matters enormously.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Tech Stack Rationale](#2-tech-stack-rationale)
3. [Architecture Overview](#3-architecture-overview)
4. [Project Structure](#4-project-structure)
5. [Design System](#5-design-system)
6. [State Management (Zustand)](#6-state-management-zustand)
7. [Real-Time Engine (WebSocket)](#7-real-time-engine-websocket)
8. [Data Fetching (React Query)](#8-data-fetching-react-query)
9. [Component Deep Dives](#9-component-deep-dives)
10. [Animations (Framer Motion)](#10-animations-framer-motion)
11. [Deep Work Mode](#11-deep-work-mode)
12. [Memory Lane UI](#12-memory-lane-ui)
13. [Analytics Dashboard](#13-analytics-dashboard)
14. [Tauri Configuration](#14-tauri-configuration)
15. [Setup & Installation](#15-setup--installation)
16. [Available Scripts](#16-available-scripts)
17. [Environment & Configuration](#17-environment--configuration)
18. [Building for Production](#18-building-for-production)
19. [Development Guidelines](#19-development-guidelines)
20. [Troubleshooting](#20-troubleshooting)

---

## 1. Philosophy

Modern desktop software suffers from a paradox: the tools meant to increase productivity are themselves fragmenting attention. Every notification, every unrelated window, every tab  each carries a cognitive tax.

The KnemOS Desktop App is built around three principles:

**1. Zero Friction Awareness**  
The user should never have to manually organize their workspace. The AI backend continuously monitors running processes, open windows, and browser tabs, and the Desktop App simply *reflects* the resulting semantic groupings in real-time.

**2. Visual Calmness**  
The entire dark-mode design system, with its deep navy backgrounds, subtle glassmorphism panels, and a single standout mint-green brand color, is intentional. The UI should feel calming  like a quiet cockpit, not a noisy control room.

**3. Local-First Privacy**  
All sensitive data  screenshots, window titles, OCR text  stays on `127.0.0.1`. The desktop app's Content Security Policy (CSP) is hard-coded in `tauri.conf.json` to explicitly deny all external network connections from the UI layer.

---

## 2. Tech Stack Rationale

| Technology | Role | Why Chosen |
|---|---|---|
| **Tauri v2** | Desktop shell (Rust binary) | Tiny binary, Rust security model, native OS access |
| **React 18** | UI framework | Concurrent features, massive ecosystem |
| **TypeScript 5.8** | Type safety | Prevents entire classes of runtime bugs |
| **TailwindCSS v4** | Styling | New `@theme` API with zero runtime CSS overhead |
| **Zustand** | Global state | Zero-boilerplate, surgical re-renders |
| **TanStack Query v5** | Async data | Built-in caching, deduplication, background updates |
| **Framer Motion** | Animations | Layout-aware physics-based transitions |
| **Lucide React** | Icons | Clean, consistent, ~1KB per icon tree-shaking |
| **Vite 7** | Bundler | Sub-second HMR, native ESM |

### Why Zustand over Redux?

Redux requires 4-5 files to add a single piece of state (action, reducer, selector, provider, type). Zustand requires 1. For a real-time application receiving WebSocket events every few seconds, the less boilerplate code touching the state, the better.

More critically, Zustand's subscription model means that when the RAM stats update every 10 seconds, **only the RAM monitor component re-renders**, not the entire application tree. This is critical for maintaining 60fps animations on the workspace cards.

### Why TailwindCSS v4?

TailwindCSS v4 dropped the JavaScript config file entirely. The design tokens (`colors`, `fonts`, `spacing`) are now defined directly in CSS using the `@theme` block, which Lightning CSS compiles natively. This means:
- Zero JavaScript in the styling critical path
- Type-safe design tokens
- Smaller final CSS bundle (no unused utility classes)

---

## 3. Architecture Overview

```

                  KnemOS Desktop App                           
                                                              
     
     TitleBar                 MainArea                    
    (drag/min/                                            
     max/close)        
        Workspaces    Memory Lane      
                        Dashboard     Analytics        
         
     Sidebar       
    (workspace                                              
     cluster       
     list)               DeepWorkOverlay (modal)          
     
                                                              
  State Layer (Zustand):                                      
    WorkspaceStore    SystemStore    MemoryStore           
                                                              
  Data Layer:                                                 
    useWebSocket (push)  useWorkspaces / useMemorySearch    
                        (pull, React Query)                   

                               WebSocket + REST
                              
                    FastAPI Backend (127.0.0.1:8765)
```

The app follows a **unidirectional data flow**:

1. Backend emits events over WebSocket
2. `useWebSocket` hook receives payload  dispatches to Zustand store
3. Subscribed components re-render with new data
4. User interactions call REST endpoints via React Query mutations

---

## 4. Project Structure

```
DESKTOP_APP/

 src-tauri/                      # Native Rust shell
    src/
       main.rs                 # Entry point  minimal Rust
    icons/                      # App icons (all platforms)
    tauri.conf.json             # Window config, CSP, permissions
    capabilities/               # Tauri v2 permissions model
    Cargo.toml                  # Rust dependencies

 src/
    components/
       layout/
          TitleBar.tsx        # Custom frameless window chrome
          Sidebar.tsx         # Workspace cluster navigation
          MainArea.tsx        # Route-aware content container
      
       workspace/
          WorkspaceDashboard.tsx  # Grid of workspace cards
          WorkspaceCard.tsx       # Individual cluster card
      
       memory/
          MemoryLane.tsx          # Search bar + results container
          MemoryResult.tsx        # Individual memory card
      
       analytics/
          AnalyticsDashboard.tsx  # Main analytics panel
          FocusScore.tsx          # Cognitive score gauge
          WorkflowChart.tsx       # Context-switch frequency chart
      
       system/
           DeepWorkOverlay.tsx     # Full-screen focus enforcer
   
    hooks/
       useWebSocket.ts         # WebSocket lifecycle + event router
       useWorkspaces.ts        # React Query: fetch workspace list
       useMemorySearch.ts      # React Query: vector memory search
   
    store/
       workspace.store.ts      # Workspace clusters (Zustand)
       system.store.ts         # RAM, FocusScore, DeepWork (Zustand)
       memory.store.ts         # Search state (Zustand)
   
    App.tsx                     # Root layout + provider composition
    main.tsx                    # ReactDOM.render + global providers
    index.css                   # TailwindCSS v4 @theme design system
    vite-env.d.ts               # Vite type references

 index.html                      # HTML entry (Google Fonts, meta)
 vite.config.ts                  # Vite + Tailwind plugin config
 tsconfig.json                   # TypeScript strict config
 package.json                    # Dependencies and scripts
```

---

## 5. Design System

All design tokens are defined in `src/index.css` using TailwindCSS v4's `@theme` block. **Never use hardcoded hex values in components.**

### Color Tokens

```css
@theme {
  /* Brand */
  --color-mint:        #00C896;  /* Primary accent  active states, positive metrics */
  --color-mint-dark:   #00A87E;  /* Hover state for mint elements */
  
  /* Backgrounds (layered depth) */
  --color-surface:     #0D0D12;  /* Deepest  root background */
  --color-surface-2:   #1A1A24;  /* Raised panels, cards */
  --color-surface-3:   #2A2A35;  /* Hover states, subtle highlights */
  
  /* Text */
  --color-text-primary:   #F0F0F5;  /* Main content, headings */
  --color-text-secondary: #8888A4;  /* Metadata, URLs, timestamps */
  
  /* Functional */
  --color-border:      rgba(255,255,255,0.06);
  --color-danger:      #FF4D6A;  /* Errors, high CPU warnings */
  --color-warning:     #FFC107;  /* Medium focus score, moderate RAM */
}
```

### Typography

```css
@theme {
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

- `font-sans`  All UI text (Inter is optimized for screen readability)
- `font-mono`  Memory Lane paths, code snippets, technical readouts

### Glassmorphism Utility

```css
.glass-card {
  background: rgba(26, 26, 36, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

Applied to cards, overlays, and sidebar panels to create a sense of layered translucency.

### Animations

All custom keyframe animations are defined in `index.css`:

| Animation | Usage | Duration |
|---|---|---|
| `fadeIn` | Page transitions, modal entry | 200ms |
| `slideInLeft` | Sidebar workspace cards | 300ms |
| `pulseGlow` | Active workspace indicator | 2s loop |
| `shimmer` | Loading skeleton screens | 1.5s loop |

---

## 6. State Management (Zustand)

### WorkspaceStore (`workspace.store.ts`)

```typescript
interface WorkspaceItem {
  title: string;
  source: 'browser_tab' | 'window' | 'file' | 'process';
  url?: string;
  path?: string;
}

interface Workspace {
  id: string;
  name: string;
  item_count: number;
  items: WorkspaceItem[];
  created_at: number;
}

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setWorkspaces: (ws: Workspace[]) => void;
  setActiveWorkspace: (id: string | null) => void;
}
```

Updated every 30 seconds by the backend's auto-organize scheduler via WebSocket push.

### SystemStore (`system.store.ts`)

```typescript
interface RAMStats {
  total_gb: number;
  used_gb: number;
  available_gb: number;
  percent: number;
  saved_gb: number;
}

interface FocusScore {
  score: number;
  grade: 'A' | 'B' | 'C';
  context_switches: number;
  peak_hour: number;
}

interface SystemStore {
  ram: RAMStats | null;
  focusScore: FocusScore | null;
  deepWorkActive: boolean;
  setRAM: (stats: RAMStats) => void;
  setFocusScore: (score: FocusScore) => void;
  toggleDeepWork: () => void;
}
```

`ram` updates every 10s. `focusScore` updates every 5 minutes.

### MemoryStore (`memory.store.ts`)

```typescript
interface MemoryResultData {
  id: string;
  text_preview: string;
  timestamp: number;
  screenshot_path: string;
  similarity: number;
}

interface MemoryStore {
  query: string;
  results: MemoryResultData[];
  setQuery: (q: string) => void;
  setResults: (r: MemoryResultData[]) => void;
}
```

The `query` string is debounced before being passed to `useMemorySearch`.

---

## 7. Real-Time Engine (WebSocket)

The `useWebSocket.ts` hook manages the entire real-time data pipeline.

```typescript
// src/hooks/useWebSocket.ts
const WS_URL = 'ws://127.0.0.1:8765/ws'

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<number>()

  const connect = () => {
    const ws = new WebSocket(WS_URL)
    
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      
      switch (payload.type) {
        case 'workspace_update':
          useWorkspaceStore.getState().setWorkspaces(payload.workspaces)
          break
        case 'ram_update':
          useSystemStore.getState().setRAM(payload.stats)
          break
        case 'focus_score_update':
          useSystemStore.getState().setFocusScore(payload.score)
          break
        case 'capture_complete':
          // Toast notification  screenshot indexed
          break
      }
    }

    ws.onclose = () => {
      // Auto-reconnect after 3 seconds
      reconnectTimer.current = setTimeout(connect, 3000)
    }
  }
}
```

### WebSocket Event Types

| `type` | Payload | Frequency |
|---|---|---|
| `workspace_update` | `{ workspaces: Workspace[] }` | Every 30s (auto-organize) |
| `ram_update` | `{ stats: RAMStats, saved_gb: number }` | Every 10s |
| `focus_score_update` | `{ score: FocusScore }` | Every 5 min |
| `capture_complete` | `{ screenshot_id: string }` | Every 60s |
| `pong` | `{}` | On ping |

---

## 8. Data Fetching (React Query)

React Query is used for **user-initiated pull requests** and initial data hydration.

### `useWorkspaces.ts`  Initial Load

```typescript
export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await fetch('http://127.0.0.1:8765/api/workspace/list')
      return res.json()
    },
    staleTime: 30_000,  // Don't re-fetch for 30s  WebSocket handles it
    retry: 3,
  })
}
```

### `useMemorySearch.ts`  Vector Search

```typescript
export const useMemorySearch = (query: string) => {
  return useQuery({
    queryKey: ['memorySearch', query],
    queryFn: async () => {
      const res = await fetch(
        `http://127.0.0.1:8765/api/memory/search?q=${encodeURIComponent(query)}&limit=10`
      )
      return res.json()
    },
    enabled: query.length > 2,  // Don't search empty or very short strings
    staleTime: 60_000,
  })
}
```

---

## 9. Component Deep Dives

### `TitleBar.tsx`
Because Tauri is configured with a frameless window (`decorations: false`), we build a custom title bar. It must:
- Have `data-tauri-drag-region` on its container so Tauri makes it draggable
- Implement minimize/maximize/close via `@tauri-apps/api/window`
- Display the app name and a live connection status indicator

### `Sidebar.tsx`
The sidebar renders a list of `Workspace` objects from `WorkspaceStore`. For each workspace, it renders a clickable item with:
- A colored dot indicating activity level (based on `item_count`)
- The AI-generated workspace name (truncated to 24 chars)
- The item count badge

The active workspace is highlighted with a mint-green left border (`border-l-2 border-mint`).

### `WorkspaceCard.tsx`
Each card represents a single AI-clustered semantic workspace. The card layout:
- Header: workspace name + icon grid (browser icon for tabs, terminal icon for processes)
- Body: list of up to 5 `WorkspaceItem`s (scrollable if more)
- Footer: timestamp + item count + "Restore" button

### `MemoryResult.tsx`
A compact card for a ChromaDB vector search result. Displays:
- OCR text preview (truncated to ~120 chars)
- Relative timestamp (e.g., "2 hours ago")
- Screenshot thumbnail (loaded via backend's `/api/memory/image?path=...` endpoint)
- Similarity score (displayed as a colored progress bar)

---

## 10. Animations (Framer Motion)

All page transitions use Framer Motion's `AnimatePresence` for smooth mount/unmount cycles.

```typescript
// Pattern used for all panel transitions
<AnimatePresence mode="wait">
  <motion.div
    key={activePanel}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

For the workspace card list, we use the `layout` prop to make Framer Motion automatically handle re-ordering animations when AI clustering produces a new workspace sort order:

```typescript
<motion.div layout key={workspace.id}>
  <WorkspaceCard workspace={workspace} />
</motion.div>
```

---

## 11. Deep Work Mode

When `deepWorkActive` is `true` in `SystemStore`, `DeepWorkOverlay` mounts at `z-50` with a full-screen backdrop. The overlay uses Framer Motion to animate in from `opacity: 0`  `opacity: 1`.

Simultaneously, the Sidebar dims all non-active workspace items to `opacity-30`, and the Main Area blurs all non-active panels.

```typescript
// Sidebar item dimming logic
const isDimmed = deepWorkActive && workspace.id !== activeWorkspaceId
className={`... ${isDimmed ? 'opacity-30 blur-sm pointer-events-none' : ''}`}
```

To exit Deep Work Mode, the user clicks the overlay or presses `Escape` (handled via a `useEffect` keydown listener).

---

## 12. Memory Lane UI

The Memory Lane panel is a two-part UI:

**Search Bar**  
A prominent search input at the top. Input changes are debounced for 400ms before being written to `MemoryStore.query`. This prevents API calls on every keystroke.

**Results Grid**  
A 2-column responsive grid of `MemoryResult` cards. During loading, it renders skeleton placeholder cards to prevent layout shifts. An empty state ("Start typing to search your memory...") is shown when `query.length < 3`.

---

## 13. Analytics Dashboard

The Analytics Dashboard (`AnalyticsDashboard.tsx`) aggregates data from three sources:

1. **`FocusScore` from SystemStore**  Displayed in `FocusScore.tsx` as a circular gauge
2. **RAM data from SystemStore**  Displayed as a bar chart showing usage vs. recovered
3. **Wolfram API** (`/api/analytics/focus-score`)  Context switches, peak hour, workflow heatmap data  Displayed in `WorkflowChart.tsx`

The `FocusScore` gauge uses a CSS conic-gradient to render the score arc, avoiding a heavy charting library dependency.

---

## 14. Tauri Configuration

Key settings in `src-tauri/tauri.conf.json`:

```json
{
  "productName": "KnemOS",
  "identifier": "dev.knemos.app",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420"
  },
  "app": {
    "windows": [{
      "label": "main",
      "width": 1300,
      "height": 840,
      "minWidth": 900,
      "minHeight": 600,
      "decorations": false,
      "transparent": true,
      "theme": "Dark"
    }]
  },
  "security": {
    "csp": "default-src 'self'; connect-src http://127.0.0.1:8765 ws://127.0.0.1:8765; img-src 'self' data: http://127.0.0.1:8765"
  }
}
```

The CSP (`content-src-policy`) is the key security configuration. It hard-locks the React UI to only communicate with `127.0.0.1:8765`. Any attempt to send data to an external server will be blocked by the Tauri webview at the OS level.

---

## 15. Setup & Installation

### Prerequisites

1. **Node.js** v18+  
   Download: https://nodejs.org

2. **Rust** (for Tauri's native shell compilation)  
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup update
   ```
   On Windows, use: https://rustup.rs

3. **Visual Studio C++ Build Tools** (Windows only)  
   Required by Rust. Download via Visual Studio Installer, select "Desktop development with C++".

4. **KnemOS Backend Engine** (must be running)  
   ```bash
   cd WEBSITE/BACKEND
   uvicorn main:app --port 8765 --reload
   ```

### Install & Run

```bash
# Navigate into the desktop app directory
cd DESKTOP_APP

# Install all Node.js dependencies
npm install

# Start the Tauri development server
npm run tauri dev
```

>  **First Run**: Rust will compile the native binary from scratch. This takes 25 minutes. All subsequent runs use the compiled cache and start in under 5 seconds.

---

## 16. Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server only (browser-based, no Tauri) |
| `npm run tauri dev` | Start full Tauri app with hot-reload |
| `npm run build` | Build the Vite bundle for production |
| `npm run tauri build` | Build the complete Tauri installer |
| `npm run preview` | Preview the Vite production build |

---

## 17. Environment & Configuration

The app reads its configuration from `vite.config.ts` and hardcoded constants in `hooks/`.

Currently the backend URL is hardcoded as `http://127.0.0.1:8765` and `ws://127.0.0.1:8765/ws`. To change the port, update both values in:
- `src/hooks/useWebSocket.ts`  `WS_URL`
- `src/hooks/useWorkspaces.ts`  `API`
- `src/hooks/useMemorySearch.ts`  `API`

For a proper multi-environment setup, these should be extracted into a `src/config.ts` module reading from Vite environment variables (`import.meta.env.VITE_BACKEND_URL`).

---

## 18. Building for Production

```bash
npm run tauri build
```

Output locations:
- **Windows** (NSIS installer): `src-tauri/target/release/bundle/nsis/KnemOS_1.0.0_x64-setup.exe`
- **Windows** (MSI): `src-tauri/target/release/bundle/msi/KnemOS_1.0.0_x64_en-US.msi`
- **Raw binary**: `src-tauri/target/release/KnemOS.exe`

---

## 19. Development Guidelines

### Adding a New Feature

1. **Define the type** in the appropriate store (`workspace.store.ts`, `system.store.ts`, etc.)
2. **Add the WebSocket handler** in `useWebSocket.ts` if the data comes from the backend push
3. **Create the component** in the appropriate `src/components/` subdirectory
4. **Use Zustand hooks** with selector functions  subscribe only to the specific slice of state you need:
   ```typescript
   //  Good  only re-renders when focusScore changes
   const focusScore = useSystemStore(s => s.focusScore)
   
   //  Bad  re-renders on ANY store change
   const store = useSystemStore()
   ```

### Styling Rules

- Always use Tailwind utility classes; never inline styles
- Custom colors must be added to the `@theme` block in `index.css`  never hardcoded hex values in JSX
- Animations must use Framer Motion; never raw CSS transitions for complex interactions

### TypeScript Rules

- `tsconfig.json` enforces `strict: true`, `noUnusedLocals`, and `noUnusedParameters`
- All component props must have explicit TypeScript interfaces
- `any` is disallowed  use `unknown` and type narrowing instead

---

## 20. Troubleshooting

**The window is blank / shows a loading spinner forever**  
 The backend is not running. Open `WEBSITE/BACKEND` in a terminal and run `uvicorn main:app --port 8765 --reload`.

**Tailwind classes have no effect**  
 Restart the Vite dev server (`npm run tauri dev`). TailwindCSS v4 uses Lightning CSS which sometimes needs a full restart after `index.css` changes.

**`tauri dev` fails with a Rust compile error**  
 Run `rustup update` to ensure your Rust toolchain is current. On Windows, verify Visual Studio C++ Build Tools are installed.

**WebSocket shows "disconnected" in TitleBar**  
 The `useWebSocket` hook auto-reconnects every 3 seconds. If it stays disconnected, the backend process has crashed. Check the backend terminal for Python tracebacks.

**Framer Motion causes layout jank**  
 Ensure any `motion.div` with the `layout` prop has a stable, unique `key` prop. Without a stable `key`, Framer Motion cannot track which element is which between renders and recalculates the entire layout.

---

*End of Documentation.*  
*KnemOS Desktop App  Tauri v2 + React 18 + TailwindCSS v4*
