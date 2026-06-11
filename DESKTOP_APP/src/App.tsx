import { useEffect } from 'react'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { MainArea } from './components/layout/MainArea'
import { useSettingsStore } from './store/settings.store'
import { useSystemStore } from './store/system.store'
import { useCategoriesStore } from './store/categories.store'

function App() {
  const { applyAccentToDOM } = useSettingsStore()
  const { setRAMStats, setFocusScore } = useSystemStore()
  const { applyWorkspaceData } = useCategoriesStore()

  // 1. Apply user accent on load
  useEffect(() => {
    applyAccentToDOM()
  }, [applyAccentToDOM])

  // 2. Start polling backend
  useEffect(() => {
    let active = true

    const fetchHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8765/api/system/health')
        if (!res.ok) throw new Error('Backend offline')
      } catch (e) {
        if (active) {
          setRAMStats(null)
          setFocusScore(null)
        }
      }
    }

    const fetchRam = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8765/api/system/ram')
        const data = await res.json()
        if (active) setRAMStats(data)
      } catch {}
    }

    const fetchFocus = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8765/api/system/focus')
        const data = await res.json()
        if (active) setFocusScore(data)
      } catch {}
    }

    const fetchWorkspace = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8765/api/workspace/list')
        const data = await res.json()
        if (active && data.workspaces) {
          applyWorkspaceData(data.workspaces)
        }
      } catch {}
    }

    // Initial fetch
    fetchHealth()
    fetchRam()
    fetchFocus()
    fetchWorkspace()

    // Setup polling
    const idHealth = setInterval(fetchHealth, 10000)
    const idRam = setInterval(fetchRam, 5000)
    const idFocus = setInterval(fetchFocus, 30000)
    const idWorkspace = setInterval(fetchWorkspace, 15000)

    return () => {
      active = false
      clearInterval(idHealth)
      clearInterval(idRam)
      clearInterval(idFocus)
      clearInterval(idWorkspace)
    }
  }, [setRAMStats, setFocusScore, applyWorkspaceData])

  return (
    <div className="app-shell">
      {/* Background decorations */}
      <div className="floating-objects">
        <div className="floating-circle" style={{ width: 300, height: 300, left: '10%', top: '20%' }} />
        <div className="floating-circle" style={{ width: 500, height: 500, right: '-10%', bottom: '-10%', animationDelay: '-5s' }} />
        <div className="floating-square" style={{ width: 8, height: 8, left: '50%', top: '80%' }} />
        <div className="floating-line-h" style={{ width: '100%', top: '50%', left: 0 }} />
      </div>

      <TitleBar />
      
      <div className="app-body relative z-10">
        <Sidebar />
        <MainArea />
      </div>
    </div>
  )
}

export default App
