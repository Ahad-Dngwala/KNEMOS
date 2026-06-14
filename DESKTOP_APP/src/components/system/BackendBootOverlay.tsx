import { useEffect, useState } from 'react'

export const BackendBootOverlay = ({ status }: { status: 'checking' | 'starting' | 'error' | 'reconnecting' | 'mismatch' }) => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  let title = 'Starting KNEMOS Intelligence Engine'
  let sub = 'Initializing local modules...'

  if (status === 'checking') {
    title = 'Detecting local systems'
    sub = 'Checking for existing engine instance...'
  } else if (status === 'error') {
    title = 'Engine Initialization Failed'
    sub = 'Could not start the local backend. Please check logs.'
  } else if (status === 'reconnecting') {
    title = 'Reconnecting to Engine'
    sub = 'Attempting to restore local IPC connection...'
  } else if (status === 'mismatch') {
    title = 'Backend version mismatch detected.'
    sub = 'Your desktop app and backend engine are on incompatible versions.'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)', zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        width: 40, height: 40, border: '2px solid var(--border)',
        borderTopColor: status === 'error' ? 'var(--negative)' : 'var(--accent)',
        borderRadius: '50%',
        animation: status === 'error' ? 'none' : 'spin 1s linear infinite',
        marginBottom: 24
      }} />
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 8 }}>
        {title}{status !== 'error' && dots}
      </h2>
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: status === 'error' ? 24 : 0 }}>
        {sub}
      </p>

      {status === 'error' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="organize-btn" onClick={() => window.location.reload()} style={{ fontSize: 12, padding: '8px 16px' }}>
            Retry Boot
          </button>
          <button className="organize-btn" onClick={() => import('@tauri-apps/api/core').then(t => t.invoke('start_backend'))} style={{ fontSize: 12, padding: '8px 16px' }}>
            Restart Backend
          </button>
          <button onClick={() => {
            import('@tauri-apps/plugin-shell').then(({ Command }) => {
              Command.create('powershell', ['-c', 'notepad logs/backend.log']).execute();
            })
          }} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--ink)', borderRadius: 'var(--r-md)', padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}>
            Open Logs
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
