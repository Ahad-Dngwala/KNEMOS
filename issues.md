# KnemOS Issues & Vulnerabilities Tracker

This document outlines known flaws, technical debt, bugs, and potential vulnerabilities across the KnemOS codebase.

## 🐛 Known Bugs

1. **Tauri Export Native Limitation**:
   - **Issue**: Attempting to use `a.download` and `URL.createObjectURL` to export Analytics JSON fails silently or is blocked by strict webview policies in Tauri v2.
   - **Current Workaround**: We detect the `window.__TAURI_INTERNALS__` flag and fallback to copying the JSON string to the clipboard.
   - **Proper Fix**: Implement `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` to trigger native OS save dialogs.

2. **Drag-and-Drop Interference (Tauri)**:
   - **Issue**: Overusing `-webkit-app-region: drag` globally causes the OS to steal mouse click events, rendering the entire UI unclickable.
   - **Status**: Fixed in UI by migrating exclusively to HTML attribute `data-tauri-drag-region` on specific titlebar elements.

3. **Incremental Compilation OS Error (Windows)**:
   - **Issue**: Rust's `cargo` occasionally fails with `os error 183 (Cannot create a file when that file already exists)` when building `knemos_lib` incrementally.
   - **Workaround**: Run `cargo clean` inside `src-tauri` occasionally.

## 🕳️ Flaws & Loopholes

1. **State Hydration Desync**:
   - The UI assumes the FastAPI backend dictates the source of truth for `workspaces` and `categories`. However, because the drag-and-drop feature has a **Deferred Commitment** (pending changes overlay), if the backend pushes an update via WebSocket *while* the user has pending local moves, the UI might violently snap back or create duplicate category entries.

2. **Backend Mocks**:
   - The `chat.py` and `workspace` routing are currently heavily mocked. They rely on string-matching rather than true RAG (Retrieval-Augmented Generation) against ChromaDB.

3. **Incomplete Theme Inversion**:
   - While the "Dark Mode / Inverted" toggle was stubbed out in UI requirements, the Minimal White design system relies heavily on absolute color variables. We need a proper CSS inversion map (`white + red -> red + white`) built into `settings.store.ts` to flip the CSS custom properties safely.

## 🔒 Security Vulnerabilities

1. **CORS & CSP Configuration**:
   - **Issue**: We had to temporarily remove strict Content Security Policy (`csp`) from `tauri.conf.json` because it was aggressively blocking Tauri's own internal IPC schema (`ipc: http://ipc.localhost`). 
   - **Risk**: A relaxed CSP makes the frontend webview vulnerable to XSS if we ever load unverified third-party content.
   - **Fix Required**: Write a granular CSP that explicitly permits `ipc:`, `tauri:`, and `http://127.0.0.1:8765`, blocking everything else.

2. **Local Port Binding**:
   - The FastAPI backend binds to `127.0.0.1:8765`. If another malicious local process is running, it could theoretically poll `/api/memory/screenshots` to exfiltrate user data.
   - **Fix Required**: Implement a local auth token handshake (e.g., Tauri generates a JWT on launch and passes it to the backend via CLI args).

3. **Local Vector DB Unencrypted**:
   - ChromaDB stores embeddings and OCR strings in plain text on the local disk (`./data/chromadb`). Anyone with physical access or malware can read this semantic history.

## 📈 Technical Debt

- **Monolithic App.tsx**: The backend polling loops (`fetchHealth`, `fetchRam`, `fetchFocus`) are clustered inside a massive `useEffect` inside `App.tsx`. These should be broken out into a dedicated `useBackendSync` custom hook.
- **Store Bloat**: `ui.store.ts` and `categories.store.ts` have tightly coupled concerns (e.g., `ui.store` tracking pending counts, while `categories.store` manages the actual pending objects).
