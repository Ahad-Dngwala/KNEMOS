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
  
  const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI_IPC__' in window || '__TAURI__' in window)
  const appWindow = isTauri ? getCurrentWindow() : null

  const isConnected = ramStats !== null

  const handleClose = () => appWindow?.close()
  const handleMin = () => appWindow?.minimize()
  const handleMax = () => appWindow?.toggleMaximize()

  return (
    <div className="titlebar" data-tauri-drag-region onPointerDown={() => appWindow?.startDragging()}>
      <div className="titlebar-left" data-tauri-drag-region>
        <div className="titlebar-logo flex items-center gap-2" data-tauri-drag-region>
          <img src="/KNEMOS.png" alt="KNEMOS Logo" style={{ width: 18, height: 18, objectFit: 'contain', pointerEvents: 'none', marginRight: 6 }} />
          <span className="titlebar-logo-text" data-tauri-drag-region>KNEMOS</span>
        </div>
        <span className="titlebar-section-label" data-tauri-drag-region>
          {PANEL_LABELS[activePanel] || 'KNEMOS'}
        </span>
      </div>
      
      {/* Draggable spacer to allow dragging the middle of the window */}
      <div className="flex-1 h-full" data-tauri-drag-region />

      <div className="titlebar-right" onPointerDown={(e) => e.stopPropagation()}>
        {/* Backend status */}
        <div className="titlebar-status">
          <div className={`titlebar-status-dot ${isConnected ? 'connected' : ''}`} />
          {isConnected ? 'Connected' : 'Reconnecting to local intelligence engine...'}
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
