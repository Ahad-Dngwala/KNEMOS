// popup.js — KnemOS Extension Popup
// Features: offline mode, live tab list, theme customization (light/dark + accent color)

'use strict'

// ── DOM refs ──────────────────────────────
const statusDot      = document.getElementById('statusDot')
const statusCard     = document.getElementById('statusCard')
const statusText     = document.getElementById('statusText')
const statusBadge    = document.getElementById('statusBadge')
const tabCount       = document.getElementById('tabCount')
const lastSyncText   = document.getElementById('lastSyncText')
const syncBtn        = document.getElementById('syncBtn')
const syncBtnText    = document.getElementById('syncBtnText')
const syncIcon       = document.getElementById('syncIcon')
const offlineNotice  = document.getElementById('offlineNotice')
const connectedInfo  = document.getElementById('connectedInfo')
const installCta     = document.getElementById('installCta')

// Nav
const tabsBtn        = document.getElementById('tabsBtn')
const settingsBtn    = document.getElementById('settingsBtn')
const tabsBackBtn    = document.getElementById('tabsBackBtn')
const settingsBackBtn = document.getElementById('settingsBackBtn')

// Views
const viewStatus     = document.getElementById('viewStatus')
const viewTabs       = document.getElementById('viewTabs')
const viewSettings   = document.getElementById('viewSettings')

// Tabs view
const tabsList       = document.getElementById('tabsList')
const tabsTotal      = document.getElementById('tabsTotal')
const tabsEmpty      = document.getElementById('tabsEmpty')

// Settings
const modeLight      = document.getElementById('modeLight')
const modeDark       = document.getElementById('modeDark')
const colorPresets   = document.getElementById('colorPresets')
const customColor    = document.getElementById('customColor')
const previewBadge   = document.getElementById('previewBadge')
const saveThemeBtn   = document.getElementById('saveThemeBtn')

// ── State ────────────────────────────────
let currentView = 'status'   // 'status' | 'tabs' | 'settings'
let currentTheme = {
  mode:   'light',
  accent: '#000000'
}

// ── Helpers ───────────────────────────────
function timeAgo(timestamp) {
  if (!timestamp) return 'Never'
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 5)    return 'Just now'
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return { r, g, b }
}

function luminance({ r, g, b }) {
  // Relative luminance to determine contrasting text color
  const toLinear = c => { c /= 255; return c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4 }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastText(hex) {
  // Returns #FFFFFF or #000000 based on luminance of accent color
  const rgb = hexToRgb(hex)
  return luminance(rgb) > 0.35 ? '#000000' : '#FFFFFF'
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch { return url }
}

// ── Theme system ──────────────────────────
function applyTheme(theme, save = false) {
  const { mode, accent } = theme
  const root = document.documentElement

  // Apply mode
  root.setAttribute('data-theme', mode)

  // Apply accent color via CSS custom properties
  const accentText = contrastText(accent)
  const rgb = hexToRgb(accent)
  const softAlpha = mode === 'dark' ? '0.12' : '0.08'

  root.style.setProperty('--accent', accent)
  root.style.setProperty('--accent-text', accentText)
  root.style.setProperty('--accent-soft', `rgba(${rgb.r},${rgb.g},${rgb.b},${softAlpha})`)

  // Update preview badge
  previewBadge.style.background = accent
  previewBadge.style.color = accentText

  // Update mode buttons
  modeLight.classList.toggle('active', mode === 'light')
  modeDark.classList.toggle('active', mode === 'dark')

  // Update active color swatch
  document.querySelectorAll('.color-swatch[data-color]').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color === accent)
  })

  currentTheme = { mode, accent }

  if (save) {
    chrome.storage.local.set({ knemosTheme: theme })
  }
}

async function loadTheme() {
  return new Promise(resolve => {
    chrome.storage.local.get(['knemosTheme'], data => {
      const theme = data.knemosTheme || { mode: 'light', accent: '#000000' }
      applyTheme(theme)
      resolve(theme)
    })
  })
}

// ── View navigation ───────────────────────
function showView(view) {
  viewStatus.classList.toggle('hidden', view !== 'status')
  viewTabs.classList.toggle('hidden', view !== 'tabs')
  viewSettings.classList.toggle('hidden', view !== 'settings')

  tabsBtn.classList.toggle('active', view === 'tabs')
  settingsBtn.classList.toggle('active', view === 'settings')

  currentView = view

  if (view === 'tabs') renderTabsList()
}

// ── Status UI update ──────────────────────
function updateStatusUI(data) {
  const connected = data.status === 'connected'

  // Header dot
  statusDot.className = `status-dot ${connected ? 'connected' : 'disconnected'}`

  // Status card
  statusCard.className = `status-card ${connected ? 'connected' : 'disconnected'}`

  // Status text
  statusText.textContent = connected ? 'Desktop Connected' : 'Desktop Offline'

  // Badge
  statusBadge.textContent = connected
    ? `${data.lastCount ?? 0} tabs`
    : 'offline'

  // Stats
  tabCount.textContent = data.lastCount ?? '0'
  lastSyncText.textContent = timeAgo(data.lastSync)

  // Contextual blocks
  if (connected) {
    offlineNotice.classList.add('hidden')
    installCta.classList.add('hidden')
    connectedInfo.classList.remove('hidden')
  } else {
    connectedInfo.classList.add('hidden')
    offlineNotice.classList.remove('hidden')
    installCta.classList.remove('hidden')
  }
}

// ── Tab list rendering ────────────────────
async function renderTabsList() {
  tabsList.innerHTML = ''

  let tabs = []
  try {
    tabs = await new Promise((resolve, reject) => {
      chrome.tabs.query({}, result => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError)
        else resolve(result)
      })
    })
  } catch (e) {
    tabsList.innerHTML = '<div class="tabs-empty">Could not read tabs</div>'
    return
  }

  const SKIP = ['chrome://', 'chrome-extension://', 'about:', 'edge://', 'devtools://']
  const filtered = tabs
    .filter(t => t.url && t.title && !SKIP.some(p => t.url.startsWith(p)) && t.title !== 'New Tab')
    .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))

  tabsTotal.textContent = filtered.length

  if (filtered.length === 0) {
    tabsList.innerHTML = '<div class="tabs-empty">No open tabs</div>'
    return
  }

  filtered.forEach(tab => {
    const item = document.createElement('div')
    item.className = `tab-item${tab.active ? ' is-active' : ''}`

    // Favicon
    let faviconEl
    if (tab.favIconUrl && !tab.favIconUrl.startsWith('chrome://')) {
      faviconEl = document.createElement('img')
      faviconEl.className = 'tab-favicon'
      faviconEl.src = tab.favIconUrl
      faviconEl.alt = ''
      faviconEl.onerror = () => {
        const fb = document.createElement('div')
        fb.className = 'tab-favicon-fallback'
        fb.textContent = getDomain(tab.url)[0].toUpperCase()
        faviconEl.replaceWith(fb)
      }
    } else {
      faviconEl = document.createElement('div')
      faviconEl.className = 'tab-favicon-fallback'
      faviconEl.textContent = getDomain(tab.url)[0]?.toUpperCase() || '?'
    }

    const info = document.createElement('div')
    info.className = 'tab-info'

    const title = document.createElement('div')
    title.className = 'tab-title'
    title.textContent = tab.title || 'Untitled'
    title.title = tab.title

    const url = document.createElement('div')
    url.className = 'tab-url'
    url.textContent = getDomain(tab.url)

    info.appendChild(title)
    info.appendChild(url)
    item.appendChild(faviconEl)
    item.appendChild(info)

    if (tab.active) {
      const pip = document.createElement('div')
      pip.className = 'tab-active-pip'
      item.appendChild(pip)
    }

    tabsList.appendChild(item)
  })
}

// ── Load status from background ──────────
function loadStatus() {
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, response => {
    if (chrome.runtime.lastError) return
    if (response) updateStatusUI(response)
  })
}

// ── Sync button ───────────────────────────
syncBtn.addEventListener('click', () => {
  if (syncBtn.disabled) return
  syncBtn.classList.add('syncing')
  syncBtnText.textContent = 'Syncing...'
  syncBtn.disabled = true

  chrome.runtime.sendMessage({ type: 'FORCE_SYNC' }, response => {
    syncBtn.classList.remove('syncing')
    syncBtnText.textContent = 'Sync Now'
    syncBtn.disabled = false
    if (chrome.runtime.lastError) return
    if (response) updateStatusUI(response)
  })
})

// ── Nav buttons ───────────────────────────
tabsBtn.addEventListener('click', () => {
  showView(currentView === 'tabs' ? 'status' : 'tabs')
})

settingsBtn.addEventListener('click', () => {
  showView(currentView === 'settings' ? 'status' : 'settings')
})

// Back buttons inside each view
tabsBackBtn.addEventListener('click', () => showView('status'))
settingsBackBtn.addEventListener('click', () => showView('status'))

// ── Settings: mode toggle ─────────────────
modeLight.addEventListener('click', () => {
  applyTheme({ ...currentTheme, mode: 'light' })
})

modeDark.addEventListener('click', () => {
  applyTheme({ ...currentTheme, mode: 'dark' })
})

// ── Settings: color presets ───────────────
colorPresets.addEventListener('click', e => {
  const swatch = e.target.closest('.color-swatch[data-color]')
  if (!swatch) return
  customColor.value = swatch.dataset.color
  applyTheme({ ...currentTheme, accent: swatch.dataset.color })
})

// Custom color picker
customColor.addEventListener('input', e => {
  const hex = e.target.value
  // Remove active from presets
  document.querySelectorAll('.color-swatch[data-color]').forEach(sw => sw.classList.remove('active'))
  applyTheme({ ...currentTheme, accent: hex })
})

// ── Settings: save button ─────────────────
saveThemeBtn.addEventListener('click', () => {
  applyTheme(currentTheme, true)  // save = true
  saveThemeBtn.textContent = 'Saved ✓'
  setTimeout(() => { saveThemeBtn.textContent = 'Apply Theme' }, 1500)
})

// ── Init ──────────────────────────────────
async function init() {
  await loadTheme()
  loadStatus()
  setInterval(loadStatus, 2000)
}

init()
