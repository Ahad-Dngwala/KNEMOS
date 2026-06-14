# KnemOS

KnemOS is a local-first productivity system that adds an AI-powered cognitive layer to your desktop. It brings together a Tauri desktop application, a FastAPI backend, and a Chrome extension to organize active work into semantic workspaces, index screen history, and surface productivity insights.

## Vision

Traditional operating systems organize work around files, folders, and app windows. Modern knowledge work happens across browser tabs, terminal sessions, editors, chats, dashboards, and documents at the same time. KnemOS is designed to sit between the user and that fragmented environment, then:

- understand what is currently open
- group related resources into meaningful workspaces
- remember what was on screen earlier
- make those memories searchable with natural language
- help reduce distraction and context-switching overhead

The project is currently Windows-first and local-first.

## Repository Overview

This repository contains three main product surfaces:

| Area | Path | Purpose |
|---|---|---|
| Desktop application | `DESKTOP_APP/` | Main user interface built with Tauri, React, and TypeScript |
| Local AI backend | `WEBSITE/BACKEND/` | FastAPI service that handles clustering, memory indexing, analytics, scheduling, and WebSocket updates |
| Chrome extension | `EXTENSION/` | Browser integration layer that sends tab context to the local backend |

There are also supporting planning documents at the repo root:

- `features.md`
- `issues.md`

## What KnemOS Does

### 1. Semantic workspace clustering

KnemOS collects signals from your active environment, such as:

- running processes
- window titles
- browser tabs
- local file activity

It then converts the available text metadata into embeddings and groups related resources into named workspaces.

Example outcome:

- development tabs, editor windows, and terminal sessions become one workspace
- research articles and notes become another workspace
- communication tools get separated from focused project work

### 2. Memory Lane

KnemOS periodically captures screenshots, extracts text with OCR, and stores searchable context in a vector database. This allows users to ask for something like:

`that auth bug I was looking at this morning`

and retrieve relevant historical context from past workspace states.

### 3. Deep Work support

The desktop app includes focus-oriented UI surfaces and automation hooks intended to reduce interference from off-context tools and background clutter.

### 4. RAM and system awareness

The platform is designed to reason about active and inactive workspaces, with the long-term goal of hibernation, recovery metrics, and reduced overhead from stale context.

### 5. Productivity analytics

The backend includes Wolfram-based analytics plumbing for features such as:

- focus scoring
- workflow heatmaps
- context-switch analysis
- next-workspace prediction

## Current Architecture

At a high level, the system looks like this:

1. The Chrome extension sends browser tab metadata to the local backend.
2. The backend collects system and workspace context, then runs indexing, clustering, and analytics workflows.
3. The desktop app connects to the backend over REST and WebSocket for real-time UI updates.

Core local endpoint:

- HTTP API: `http://127.0.0.1:8765`
- WebSocket: `ws://127.0.0.1:8765/ws`

## Tech Stack

### Desktop application

- Tauri v2
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- TanStack Query
- Framer Motion

### Backend

- FastAPI
- Uvicorn
- APScheduler
- WebSockets
- ChromaDB
- pytesseract
- Pillow
- mss
- psutil
- pywin32
- watchdog
- sentence-transformers ecosystem dependencies
- HDBSCAN
- scikit-learn
- NumPy
- Wolfram Client

### Browser integration

- Chrome Extension Manifest V3

### AI / ML components referenced in the project

- Ollama-hosted local models
- Qwen-based naming / reasoning flow
- embedding-based semantic clustering

## Project Structure

```text
KnemOS/
|-- README.md
|-- features.md
|-- issues.md
|-- DESKTOP_APP/
|   |-- package.json
|   |-- src/
|   |-- src-tauri/
|   `-- README.md
|-- EXTENSION/
|   |-- manifest.json
|   |-- background.js
|   |-- popup/
|   `-- README.md
`-- WEBSITE/
    `-- BACKEND/
        |-- main.py
        |-- routers/
        |-- services/
        |-- models/
        |-- scheduler.py
        `-- requirements.txt
```

## Checked-In Backend Capabilities

Based on the current codebase, the backend exposes router groups for:

- `workspace`
- `memory`
- `analytics`
- `system`
- `chat`

It also starts a background scheduler during application startup and manages live WebSocket client connections for UI updates.

## Desktop App Notes

The desktop app is the primary user-facing interface. The checked-in app uses:

- `React 19.1.0`
- `@tauri-apps/api` v2
- `zustand`
- `@tanstack/react-query`
- `framer-motion`

The Tauri window configuration currently targets a dark themed, frameless desktop window with a default size of `1300x840`.

## Extension Notes

The Chrome extension is the browser intelligence layer for KnemOS. In the current repository state it:

- uses Manifest V3
- requests `tabs`, `storage`, and `alarms` permissions
- sends data to `http://127.0.0.1:8765/*`
- includes a popup UI and background service worker

Without the extension, the local backend has much less visibility into browser context.

## Why Local-First Matters

KnemOS is built around the idea that workspace understanding should not require sending sensitive user context to a remote service by default. The repository and docs consistently point toward a local loop where:

- processing runs on the user's machine
- browser state is posted to `127.0.0.1`
- the desktop app talks to the same local backend
- memory indexing stays close to the source context

That local-first direction is one of the most important product qualities in the project.

## Quick Start

The repo does not currently provide a single top-level bootstrap script, so setup is done per component.

### 1. Backend

Prerequisites:

- Python 3.11 or newer recommended
- Tesseract OCR installed and available on the system
- Windows environment for the `pywin32`-dependent parts

Install dependencies:

```powershell
cd WEBSITE\BACKEND
pip install -r requirements.txt
```

Run the backend:

```powershell
uvicorn main:app --host 127.0.0.1 --port 8765 --reload
```

### 2. Desktop app

Prerequisites:

- Node.js
- npm
- Rust toolchain
- Tauri prerequisites for Windows

Install dependencies:

```powershell
cd DESKTOP_APP
npm install
```

Run in development:

```powershell
npm run tauri dev
```

Useful scripts from `DESKTOP_APP/package.json`:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run tauri`

### 3. Chrome extension

Load the extension manually in Chrome:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Choose Load unpacked
4. Select the `EXTENSION/` folder

## Recommended Startup Order

For local development, this order is the safest:

1. Start the backend
2. Start the desktop app
3. Load the Chrome extension
4. Confirm the backend is reachable at `127.0.0.1:8765`

## Development Status

This repository looks like an active prototype / MVP rather than a fully packaged end-user product. A few important observations from the current checkout:

- the desktop app is present and substantial
- the backend is present and includes real routers and services
- the extension is present and wired to the local backend
- some docs mention a broader website product surface, but this checkout mainly contains the backend portion under `WEBSITE/BACKEND/`
- local runtime data is present inside `WEBSITE/BACKEND/data/`, which suggests the project has been exercised in a real environment

## Strengths Of The Project

- Clear product thesis around cognitive organization instead of file management
- Strong local-first privacy direction
- Good architectural separation between UI, backend intelligence, and browser ingestion
- Practical stack choices for a Windows desktop MVP
- Real-time desktop + backend integration path via WebSocket

## Known Setup Complexity

Anyone onboarding to the project should expect some integration overhead because the full experience depends on several moving parts:

- local backend services
- OCR tooling
- browser extension installation
- desktop shell tooling
- model availability for local AI flows

That complexity is normal for a project at this stage, but it is worth calling out early.

## Suggested Documentation Map

If you want deeper area-specific details, start here:

- root overview: `README.md`
- desktop implementation: `DESKTOP_APP/README.md`
- browser integration: `EXTENSION/README.md`

## Roadmap Themes

The current code and documentation point toward these product themes:

- smarter workspace organization
- richer memory retrieval
- deeper productivity analytics
- better focus automation
- tighter desktop-browser coordination

## Contribution Notes

If you are extending the project, it helps to treat the repository as three coordinated applications rather than one monolith:

- UI changes usually live in `DESKTOP_APP/`
- system intelligence changes usually live in `WEBSITE/BACKEND/`
- browser capture changes usually live in `EXTENSION/`

Keeping those boundaries clean will make the project easier to evolve.

## License

The existing project badges reference the MIT license. If that is intentional, adding a root `LICENSE` file would make the licensing status explicit for contributors and users.

## Summary

KnemOS is an ambitious local-first desktop intelligence project centered on semantic workspace organization, searchable memory, and productivity-aware workflows. The repository already includes the three most important building blocks needed for that vision: a desktop interface, a local AI backend, and a browser context bridge.
