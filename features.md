# KnemOS Features & Roadmap

This document outlines all current capabilities of the KnemOS ecosystem and tracks planned features.

## 🟢 Implemented Features (MVP Phase)

### 🖥️ Desktop Application (Tauri + React)
- [x] **Minimal White Design System**: A calming, warm-white interface that reduces cognitive fatigue.
- [x] **Dynamic Category Grouping**:
  - Automatically groups active applications, tabs, files, and processes.
  - Supports adaptive layouts (Compact 3x3 grids for ≤ 7 items, Expanded list for > 7 items).
- [x] **Semantic Drag-and-Drop**:
  - Drag items between workspaces and categories manually.
  - Features a **Deferred Commitment** workflow (Pending Changes Overlay) allowing users to experiment before confirming AI memory updates.
- [x] **Focus Automation Engine**:
  - Idle detection triggers a return-to-work optimization sequence.
  - **Deep Work Shield**: An unobtrusive visual overlay that masks background distractions and displays real-time Focus Scores.
- [x] **AI Chat Interface**:
  - Mocked endpoint ready to interface with Qwen 2.5 local instances.
  - Capable of answering contextual queries (e.g., "What was I working on this morning?").
- [x] **Analytics Dashboard**:
  - Live RAM savings visualization.
  - Cognitive focus scoring and workspace metrics.
- [x] **Settings & Preferences**:
  - Dynamic Accent Color switching (updates CSS Custom Properties in real-time).
  - Local AI Model Selector (7B vs 3B).

### 🧠 Backend (FastAPI + Local AI)
- [x] **System Telemetry**:
  - Live RAM polling and process tracking.
- [x] **Core Architecture Shell**:
  - Structured routing for `workspace`, `memory`, `analytics`, `system`, and `chat`.
- [x] **WebSocket Manager**:
  - Basic connection pool for real-time frontend syncing.

---

## 🟡 In Progress / Partial

- [ ] **Ollama Model Integration**:
  - Wiring the `/api/chat` and `/api/workspace` endpoints directly to local `qwen2.5:7b` instances for real semantic clustering.
- [ ] **ChromaDB Vector Store**:
  - Implementing the OCR + Embedding pipeline for screenshots.
- [ ] **File System Plugins**:
  - Adding `tauri-plugin-dialog` to natively export and import analytics JSON payloads rather than copying to the clipboard.

---

## 🔴 Planned Features (Future Roadmap)

### Native Window Management
- True OS-level window minimizing based on the Deep Work hook. 
- Auto-arrangement of windows based on semantic workspace clusters.

### Advanced Memory Lane
- Timeline slider in the UI to physically scroll back through historical screenshots and active tabs.
- Semantic natural language search over past work.

### Wolfram Analytics Integration
- Feeding app-usage data into Wolfram Engine for high-fidelity workflow heatmaps and predictive distraction alerts.

### Browser Extension Connectivity
- Finalizing the Chrome Extension (MV3) to sync precise tab states and URLs directly into the desktop app's `Categories` store via Native Messaging.
