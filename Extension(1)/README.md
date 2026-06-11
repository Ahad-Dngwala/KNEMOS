# KnemOS Chrome Extension

> Browser intelligence layer for KnemOS — sends tab context to the local AI workspace engine.

---

## What This Does

This Chrome Extension reads all your open browser tabs (titles + URLs) and sends them to the KnemOS desktop backend running locally at `http://127.0.0.1:8765`.

Without this extension, KnemOS sees Chrome as just one window. With it, KnemOS can distinguish every individual tab — enabling the AI to cluster "GitHub + FastAPI Docs + Stack Overflow" into a "Development Workspace".

---

## Project Structure

```
extension/
├── manifest.json           ← MV3 config
├── background.js           ← Service worker: tab sync logic
├── content.js              ← Minimal content script (for future use)
├── generate-icons.js       ← Icon generator (canvas, optional)
├── make-icons.ps1          ← Icon generator (Windows PowerShell, preferred)
├── mock-server.js          ← Test server (run to test without real backend)
├── popup/
│   ├── popup.html          ← Popup UI
│   ├── popup.js            ← Popup logic
│   └── popup.css           ← Popup styles
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## Load in Chrome

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this `extension/` folder
5. KnemOS icon appears in toolbar ✓

---

## Testing Without Backend

Run the mock server to receive tab POSTs:

```bash
node mock-server.js
```

Then click the extension icon → **Sync Now** — you should see tab data logged in the terminal.

---

## API Contract

```
POST http://127.0.0.1:8765/api/system/browser-tabs
{ "tabs": [{ "id": 123, "title": "...", "url": "...", "favIconUrl": "...", "active": false }] }
→ { "status": "ok", "received": 5 }

GET http://127.0.0.1:8765/api/system/health
→ { "status": "ok", "version": "1.0.0" }
```

---

## Sync Behavior

| Trigger | Action |
|---|---|
| Tab created | Immediate sync |
| Tab URL changed (complete) | Immediate sync |
| Tab closed | Immediate sync |
| Tab focused | Immediate sync |
| Tab moved | Immediate sync |
| Every 30 seconds | Alarm-based sync |
| Popup "Sync Now" | Force sync |

Filtered out: `chrome://`, `chrome-extension://`, `about:`, `edge://`, `devtools://`, New Tab pages.

---

## Packaging for Submission

```bash
# Windows
Compress-Archive -Path . -DestinationPath KnemOS-Extension.zip -Force
# Exclude make-icons.ps1, generate-icons.js, mock-server.js, *.md from the ZIP before submitting to Chrome Web Store
```

---

*KnemOS — OSC AI Build 1.0 | Person 3: Chrome Extension*
