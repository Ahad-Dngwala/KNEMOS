// background.js — KNEMOS Extension Service Worker

let activeBackend = 'http://127.0.0.1:8765'
const SYNC_ALARM = 'knemos-sync'

async function getBackendUrl() {
  try {
    const res = await fetch(`${activeBackend}/api/system/health`, { signal: AbortSignal.timeout(1000) })
    if (res.ok) return activeBackend
  } catch(e) {}

  for (let p = 8765; p <= 8775; p++) {
    try {
      const res = await fetch(`http://127.0.0.1:${p}/api/system/health`, { signal: AbortSignal.timeout(300) })
      if (res.ok) {
         activeBackend = `http://127.0.0.1:${p}`
         return activeBackend
      }
    } catch(e) {}
  }
  return activeBackend
}

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
let syncTimeout = null;

async function syncTabs() {
  // Debounce to prevent infinite event loops
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
      await performSync();
  }, 1000);
}

async function performSync() {
  let tabs
  try {
    tabs = await chrome.tabs.query({})
  } catch (err) {
    console.warn('[KNEMOS] Could not query tabs:', err)
    return
  }

  const payload = prepareTabs(tabs)

  // ── Always store local tab count + sync time ──────────────────────
  const now = Date.now()
  await chrome.storage.local.set({
    lastCount: payload.length,
    lastSync:  now
  })

  if (payload.length === 0) return

  try {
    const { knemosToken } = await chrome.storage.local.get(['knemosToken'])
    const headers = { 'Content-Type': 'application/json' }
    if (knemosToken) {
      headers['Authorization'] = `Bearer ${knemosToken}`
    }

    const backendUrl = await getBackendUrl()
    const response = await fetch(`${backendUrl}/api/system/browser-tabs`, {
      method: 'POST',
      headers,
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
    await chrome.storage.local.set({ status: 'disconnected' })
  }
  
  await syncWorkspaceTabGroups()
}

// ─────────────────────────────────────────
// Check if backend is running (for popup)
// ─────────────────────────────────────────
async function checkBackendHealth() {
  try {
    const backendUrl = await getBackendUrl()
    const r = await fetch(`${backendUrl}/api/system/health`, {
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

// Tab Group events
chrome.tabGroups.onRemoved.addListener((group) => {
    chrome.storage.local.get(['tabGroupMap', 'manualUngrouped'], (data) => {
        const map = data.tabGroupMap || {}
        const wsId = Object.keys(map).find(k => map[k] === group.id)
        if (wsId) {
            const arr = data.manualUngrouped || []
            if (!arr.includes(wsId)) {
                arr.push(wsId)
                chrome.storage.local.set({ manualUngrouped: arr })
            }
        }
    })
})

// ─────────────────────────────────────────
// Alarm: periodic backup sync every 30 seconds
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
    chrome.storage.local.set({ manualUngrouped: [] }, () => {
      syncTabs().then(() => {
        chrome.storage.local.get(['lastSync', 'lastCount', 'status'], sendResponse)
      })
    })
    return true
  }

  if (message.type === 'CHECK_HEALTH') {
    checkBackendHealth().then(isHealthy => sendResponse({ healthy: isHealthy }))
    return true
  }
})

// ─────────────────────────────────────────
// Tab Group Synchronization (Phase 2-9)
// ─────────────────────────────────────────
let isSyncingGroups = false

function mapColor(c) {
    const valid = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange']
    return valid.includes(c) ? c : 'grey'
}

async function syncWorkspaceTabGroups() {
  if (isSyncingGroups) return
  isSyncingGroups = true
  try {
    const { knemosToken } = await chrome.storage.local.get(['knemosToken'])
    const headers = { 'Content-Type': 'application/json' }
    if (knemosToken) headers['Authorization'] = `Bearer ${knemosToken}`
    
    const backendUrl = await getBackendUrl()
    const res = await fetch(`${backendUrl}/api/workspace/user-workspaces`, {
      signal: AbortSignal.timeout(5000), headers
    })
    if (!res.ok) throw new Error('Backend unreachable')
    
    const data = await res.json()
    const workspaces = data.workspaces || []
    const ungroupRequests = data.ungroup_requests || []
    
    const { tabGroupMap = {}, manualUngrouped = [] } = await chrome.storage.local.get(['tabGroupMap', 'manualUngrouped'])
    const tabs = await chrome.tabs.query({})
    let updatedMap = { ...tabGroupMap }
    
    const existingGroups = await chrome.tabGroups.query({})
    const existingGroupIds = existingGroups.map(g => g.id)

    // Handle Safe Ungrouping requests
    for (const wsId of ungroupRequests) {
        const groupId = updatedMap[wsId]
        if (groupId && existingGroupIds.includes(groupId)) {
            const groupTabs = await chrome.tabs.query({ groupId })
            if (groupTabs.length > 0) {
                await chrome.tabs.ungroup(groupTabs.map(t => t.id))
            }
        }
        delete updatedMap[wsId]
    }

    // Cleanup stale mappings
    for (const [wsId, groupId] of Object.entries(updatedMap)) {
      if (!existingGroupIds.includes(groupId)) delete updatedMap[wsId]
    }

    for (const ws of workspaces) {
        if (ws.auto_sync_tabs === false) continue
        
        let tabIds = []
        if (ws.items && Array.isArray(ws.items)) {
            for (const item of ws.items) {
                if (item.categoryType === 'tabs' && item.url) {
                    try {
                        const urlObj = new URL(item.url)
                        const domain = urlObj.hostname
                        const path = urlObj.pathname
                        const matchedTabs = tabs.filter(t => t.url && t.url.includes(domain) && t.url.includes(path))
                        tabIds.push(...matchedTabs.map(t => t.id))
                    } catch(e) {}
                }
            }
        }
        
        tabIds = [...new Set(tabIds)]
        if (tabIds.length > 0) {
            let groupId = updatedMap[ws.id]
            if (!groupId || !existingGroupIds.includes(groupId)) {
                if (manualUngrouped.includes(ws.id)) continue
                groupId = await chrome.tabs.group({ tabIds })
                updatedMap[ws.id] = groupId
                await chrome.tabGroups.update(groupId, {
                    title: ws.name,
                    color: mapColor(ws.color)
                })
            } else {
                const currentGroupTabs = await chrome.tabs.query({ groupId })
                const currentGroupTabIds = currentGroupTabs.map(t => t.id)
                
                const needsAdd = tabIds.some(id => !currentGroupTabIds.includes(id))
                if (needsAdd) {
                    await chrome.tabs.group({ groupId, tabIds })
                }
                
                const groupInfo = existingGroups.find(g => g.id === groupId)
                if (groupInfo && (groupInfo.title !== ws.name || groupInfo.color !== mapColor(ws.color))) {
                    await chrome.tabGroups.update(groupId, {
                        title: ws.name,
                        color: mapColor(ws.color)
                    })
                }
            }
        }
    }
    await chrome.storage.local.set({ tabGroupMap: updatedMap })
  } catch (e) {
  } finally {
    isSyncingGroups = false
  }
}

// ─────────────────────────────────────────
// Initial sync on service worker start
// ─────────────────────────────────────────
syncTabs()