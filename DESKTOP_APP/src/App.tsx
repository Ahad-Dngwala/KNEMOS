/*
 * App.tsx
 *
 * Top-level application shell for the KNEMOS desktop client.
 * Responsibilities:
 * - Orchestrates backend boot & health checks (via Tauri `start_backend`).
 * - Instantiates a single, stable WebSocket connection when the backend is ready.
 * - Applies user settings and schedules low-frequency polling fallbacks.
 *
 * NOTE: This file contains runtime orchestration only. Do not change logic here
 * unless you're modifying runtime behavior. The edits below are comments only.
 */

import { useEffect, useState } from 'react'
import { authenticatedFetch } from './store/auth.store'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { MainArea } from './components/layout/MainArea'
import { OnboardingModal } from './components/onboarding/OnboardingModal'
import { useSettingsStore } from './store/settings.store'
import { useSystemStore } from './store/system.store'

import { StartupOverlay } from './components/system/StartupOverlay'
import { BackendBootOverlay } from './components/system/BackendBootOverlay'
import { DependencySetupOverlay } from './components/system/DependencySetupOverlay'

import { useWorkspaceStore } from './store/workspace.store'
import { useActivityStore } from './store/activity.store'
import { useStableWebSocket } from './hooks/useStableWebSocket'
import { useAuthStore } from './store/auth.store'
import { onOpenUrl } from '@tauri-apps/plugin-deep-link'

const DEFAULT_API = 'http://127.0.0.1'

function App() {
  const { applyAccentToDOM } = useSettingsStore()
  const { setRAMStats, setFocusScore } = useSystemStore()

  const { fetchWorkspaces } = useWorkspaceStore()
  const { fetchTimeline, fetchCurrentSession } = useActivityStore()
  const { setToken } = useAuthStore()

  const [onboardingDone, setOnboardingDone] = useState(
    () => localStorage.getItem('knemos-onboarded') === 'true'
  )

  const [depSetupDone, setDepSetupDone] = useState(
    () => localStorage.getItem('knemos-dep-setup-done') === 'true'
  )

  const [bootStatus, setBootStatus] = useState<'checking' | 'starting' | 'ready' | 'error' | 'reconnecting' | 'mismatch'>('checking')
  const [activePort, setActivePort] = useState<number>(8765)

  // 1. WebSocket singleton connection
  // Establish a single shared WebSocket connection once the backend reports
  // readiness. `useStableWebSocket` encapsulates the connection lifecycle,
  // reconnect/backoff behavior, and message dispatch to stores.
  useStableWebSocket(bootStatus === 'ready', activePort)

  // Deep link parsing
  useEffect(() => {
    const unlisten = onOpenUrl((urls) => {
      for (const url of urls) {
        if (url.includes('knemos://auth')) {
          try {
            const urlObj = new URL(url)
            const token = urlObj.searchParams.get('token')
            if (token) {
              setToken(token)
            }
          } catch (e) {
            console.error('Failed to parse deep link', e)
          }
        }
      }
    })
    return () => {
      unlisten.then(fn => fn())
    }
  }, [setToken])


  // 0. Backend Boot Orchestrator
  useEffect(() => {
    let active = true
    let attempts = 0
    const maxAttempts = 20

    // Check the local HTTP health endpoint to determine whether the backend
    // is up and fully ready. Returns `true` when the backend reports
    // `fully_ready` and the expected `backend_version`.
    const checkHealth = async (port: number) => {
      try {
        const res = await fetch(`${DEFAULT_API}:${port}/api/system/health`)
        if (res.ok) {
           const data = await res.json()
           if (data.backend_version !== '2.4.0') {
              setBootStatus('mismatch' as any)
              return false
           }
           if (data.fully_ready) return true
        }
      } catch (e) { }
      return false
    }

    // If the local backend is not yet running, ask the Tauri side to start
    // it via the `start_backend` command. Once a port is returned, this
    // function polls the health endpoint until the backend becomes ready or
    // until attempts are exhausted.
    const bootBackend = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const port = await invoke<number>('start_backend')
        if (!active) return
        setActivePort(port)
        setBootStatus('starting')
        
        // Polling loop: periodically probe the HTTP health endpoint until
        // the backend indicates readiness. Uses `setInterval` to avoid
        // blocking other UI tasks.
        const poll = setInterval(async () => {
          if (!active) {
            clearInterval(poll)
            return
          }
          if (bootStatus === 'mismatch' as any) {
             clearInterval(poll)
             return
          }
          if (await checkHealth(port)) {
            clearInterval(poll)
            setBootStatus('ready')
          } else {
            attempts++
            if (attempts > maxAttempts) {
              clearInterval(poll)
              // Only set to error if not already set to mismatch
              setBootStatus(prev => prev === 'mismatch' as any ? prev : 'error')
            }
          }
        }, 500)
      } catch (e) {
        console.error("Failed to invoke start_backend", e)
        if (active) setBootStatus('error')
      }
    }

    checkHealth(8765).then(isHealthy => {
      if (!active) return
      if (isHealthy) {
        setBootStatus('ready')
      } else {
        bootBackend()
      }
    })

    return () => { active = false }
  }, [])

  // 1. Apply user accent on load
  useEffect(() => {
    applyAccentToDOM()
  }, [applyAccentToDOM])

  // 2. Load workspaces once backend is ready
  useEffect(() => {
    if (bootStatus === 'ready') fetchWorkspaces()
  }, [fetchWorkspaces, bootStatus])

  // 4. Start low-frequency polling for non-WS fallbacks
  useEffect(() => {
    if (bootStatus !== 'ready') return
    let active = true

    const fetchRam = async () => {
      try {
        const res = await authenticatedFetch(`${DEFAULT_API}:${activePort}/api/system/ram`)
        const data = await res.json()
        if (active) setRAMStats(data)
      } catch {
        if (active) setRAMStats(null)
      }
    }

    const fetchFocus = async () => {
      try {
        const res = await authenticatedFetch(`${DEFAULT_API}:${activePort}/api/system/focus`)
        const data = await res.json()
        if (active) setFocusScore(data)
      } catch {}
    }

    fetchRam()
    fetchFocus()
    fetchTimeline(8)
    fetchCurrentSession()

    // Polling using recursive setTimeout
    let idSession: ReturnType<typeof setTimeout>
    let idTimeline: ReturnType<typeof setTimeout>

    const pollSession = async () => {
      if (!active) return
      await fetchCurrentSession()
      if (active) idSession = setTimeout(pollSession, 60000)
    }

    const pollTimeline = async () => {
      if (!active) return
      await fetchTimeline(8)
      if (active) idTimeline = setTimeout(pollTimeline, 90000)
    }

    idSession = setTimeout(pollSession, 60000)
    idTimeline = setTimeout(pollTimeline, 90000)

    return () => {
      active = false
      clearTimeout(idSession)
      clearTimeout(idTimeline)
    }
  }, [bootStatus, activePort])

  const handleOnboardingComplete = () => {
    localStorage.setItem('knemos-onboarded', 'true')
    setOnboardingDone(true)
  }

  // Show dependency setup on very first launch
  if (!depSetupDone) {
    return <DependencySetupOverlay onDone={() => setDepSetupDone(true)} />
  }

  if (bootStatus !== 'ready') {
    return <BackendBootOverlay status={bootStatus} />
  }

  return (
    <div className="app-shell">
      {/* Background decorations */}
      <div className="floating-objects">
        <div className="floating-circle" style={{ width: 300, height: 300, left: '10%', top: '20%' }} />
        <div className="floating-circle" style={{ width: 500, height: 500, right: '-10%', bottom: '-10%', animationDelay: '-5s' }} />
        <div className="floating-square" style={{ width: 8, height: 8, left: '50%', top: '80%' }} />
      </div>

      <TitleBar />

      <div className="app-body">
        <Sidebar />
        <MainArea />
      </div>

      {/* One-time onboarding */}
      {!onboardingDone && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
      {onboardingDone && <StartupOverlay />}
    </div>
  )
}

export default App
