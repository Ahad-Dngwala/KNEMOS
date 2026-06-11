import { getCurrentWindow } from '@tauri-apps/api/window'
import { useUIStore } from '../../store/ui.store'
import { useSystemStore } from '../../store/system.store'

const PANEL_LABELS: Record<string, string> = {
  categories: 'Workspace Overview',
  chat: 'AI Assistant',
  analytics: 'Analytics',
  settings: 'Settings',
}

export const TitleBar = () => {
  const { activePanel } = useUIStore()
  const { ramStats } = useSystemStore()
  
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
  const appWindow = isTauri ? getCurrentWindow() : null

  const isConnected = ramStats !== null

  const handleClose = () => appWindow?.close()
  const handleMin = () => appWindow?.minimize()
  const handleMax = () => appWindow?.toggleMaximize()

  return (
    <div className="titlebar">
      <div className="titlebar-left">
        <div className="titlebar-logo">
          <span className="titlebar-logo-text">KNEMOS</span>
        </div>
        <span className="titlebar-section-label">
          {PANEL_LABELS[activePanel] || 'KnemOS'}
        </span>
      </div>

      <div className="titlebar-right" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* Backend status */}
        <div className="titlebar-status">
          <div className={`titlebar-status-dot ${isConnected ? 'connected' : ''}`} />
          {isConnected ? 'Connected' : 'Offline'}
        </div>

        {/* RAM saved indicator */}
        {ramStats && ramStats.saved_gb > 0 && (
          <div className="titlebar-status" style={{ color: 'var(--accent)', borderColor: 'var(--accent-light)' }}>
            +{ramStats.saved_gb.toFixed(1)} GB saved
          </div>
        )}

        {/* Window controls */}
        <div className="win-controls">
          <button className="win-btn min" onClick={handleMin} title="Minimize" />
          <button className="win-btn max" onClick={handleMax} title="Maximize" />
          <button className="win-btn close" onClick={handleClose} title="Close" />
        </div>
      </div>
    </div>
  )
}
