// background.js — KnemOS Extension Service Worker

const BACKEND = 'http://127.0.0.1:8765'
const SYNC_ALARM = 'knemos-sync'

// ─────────────────────────────────────────
// Utility: Filter and prepare tab data
// ─────────────────────────────────────────
function prepareTabs(rawTabs) {
  const SKIP_PROTOCOLS = ['chrome://', 'chrome-extension://', 'about:', 'edge://', 'devtools://']

  return rawTabs
    .filter(tab => {
      if (!tab.url) return false
      if (!tab.title || tab.title.trim() === '') return false
      if (tab.title === 'New Tab' || tab.title === 'newtab') return false
      return !SKIP_PROTOCOLS.some(p => tab.url.startsWith(p))
    })
    .slice(0, 100)  // hard cap at 100 tabs
    .map(tab => ({
      id:         tab.id || 0,
      title:      tab.title.trim(),
      url:        tab.url,
      favIconUrl: tab.favIconUrl || null,
      active:     tab.active || false
    }))
}

// ─────────────────────────────────────────
// Core: Collect all tabs and POST to backend
// ─────────────────────────────────────────
async function syncTabs() {
  let tabs
  try {
    tabs = await chrome.tabs.query({})
  } catch (err) {
    console.warn('[KnemOS] Could not query tabs:', err)
    return
  }

  const payload = prepareTabs(tabs)

  // ── Always store local tab count + sync time ──────────────────────
  // This runs regardless of backend status so the popup always shows
  // real data even when the desktop app is not running.
  const now = Date.now()
  await chrome.storage.local.set({
    lastCount: payload.length,
    lastSync:  now
  })

  if (payload.length === 0) return

  try {
    const response = await fetch(`${BACKEND}/api/system/browser-tabs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabs: payload }),
      signal: AbortSignal.timeout(5000)  // 5 second timeout
    })

    if (response.ok) {
      const result = await response.json()
      // Overwrite with server-confirmed count
      await chrome.storage.local.set({
        lastSync:  now,
        lastCount: result.received ?? payload.length,
        status:    'connected'
      })
    }
  } catch (err) {
    // Backend not running — silent fail, mark disconnected
    // lastCount and lastSync already written above, so popup shows data
    await chrome.storage.local.set({ status: 'disconnected' })
  }
}

// ─────────────────────────────────────────
// Check if backend is running (for popup)
// ─────────────────────────────────────────
async function checkBackendHealth() {
  try {
    const r = await fetch(`${BACKEND}/api/system/health`, {
      signal: AbortSignal.timeout(2000)
    })
    return r.ok
  } catch {
    return false
  }
}

// ─────────────────────────────────────────
// Event listeners — trigger sync on tab changes
// ─────────────────────────────────────────

// Tab created
chrome.tabs.onCreated.addListener(() => syncTabs())

// Tab updated (page loaded)
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') syncTabs()
})

// Tab removed
chrome.tabs.onRemoved.addListener(() => syncTabs())

// Tab activated (focus switched)
chrome.tabs.onActivated.addListener(() => syncTabs())

// Tab moved (between windows)
chrome.tabs.onMoved.addListener(() => syncTabs())

// ─────────────────────────────────────────
// Alarm: periodic backup sync every 30 seconds
// This handles the case where no tab events fire for a while
// ─────────────────────────────────────────
chrome.alarms.create(SYNC_ALARM, { periodInMinutes: 0.5 })  // every 30s

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM) syncTabs()
})

// ─────────────────────────────────────────
// Message handler — popup asks for status
// ─────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATUS') {
    chrome.storage.local.get(['lastSync', 'lastCount', 'status'], (data) => {
      sendResponse({
        status:    data.status ?? 'unknown',
        lastSync:  data.lastSync ?? null,
        lastCount: data.lastCount ?? 0
      })
    })
    return true  // ← IMPORTANT: return true for async sendResponse
  }

  if (message.type === 'FORCE_SYNC') {
    syncTabs().then(() => {
      chrome.storage.local.get(['lastSync', 'lastCount', 'status'], sendResponse)
    })
    return true
  }

  if (message.type === 'CHECK_HEALTH') {
    checkBackendHealth().then(isHealthy => sendResponse({ healthy: isHealthy }))
    return true
  }
})

// ─────────────────────────────────────────
// Initial sync on service worker start
// ─────────────────────────────────────────
syncTabs()
