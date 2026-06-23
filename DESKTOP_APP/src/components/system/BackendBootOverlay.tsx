import { useEffect, useState, useRef } from 'react'
import { open } from '@tauri-apps/plugin-shell'

const LOG_STEPS: Record<string, string[]> = {
  checking: [
    '[ OK ] Booting KNEMOS runtime...',
    '[ .. ] Scanning for existing backend on port 8765...',
  ],
  starting: [
    '[ OK ] Sidecar located, spawning process...',
    '[ .. ] Initializing FastAPI server...',
    '[ .. ] Loading SQLite activity ledger...',
    '[ .. ] Warming up ChromaDB vector index...',
    '[ .. ] Starting APScheduler background workers...',
    '[ .. ] Waiting for backend to become healthy...',
  ],
  reconnecting: [
    '[ .. ] Lost connection to backend engine.',
    '[ .. ] Attempting to reconnect...',
  ],
}

export const BackendBootOverlay = ({
  status,
}: {
  status: 'checking' | 'starting' | 'error' | 'reconnecting' | 'mismatch'
}) => {
  const [logLines, setLogLines] = useState<string[]>(['[ .. ] Initializing KNEMOS...'])
  const [logIndex, setLogIndex] = useState(0)
  const [restarting, setRestarting] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  // Drip-feed the log lines for the current status
  useEffect(() => {
    const steps = LOG_STEPS[status] ?? []
    setLogIndex(0)
    if (steps.length === 0) return
    const iv = setInterval(() => {
      setLogIndex(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(iv)
          return prev
        }
        return prev + 1
      })
    }, 900)
    return () => clearInterval(iv)
  }, [status])

  useEffect(() => {
    const steps = LOG_STEPS[status] ?? []
    setLogLines(prev => {
      const next = steps.slice(0, logIndex + 1)
      const combined = [...prev.filter(l => !steps.includes(l)), ...next]
      return combined.slice(-12) // keep last 12 lines
    })
  }, [logIndex, status])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logLines])

  const handleOpenLogs = async () => {
    try {
      // Open the log file with the default text editor
      await open('%TEMP%\\knemos_backend.log')
    } catch {
      // Fallback: open the temp folder
      try { await open('%TEMP%') } catch {}
    }
  }

  const handleRestartBackend = async () => {
    if (restarting) return
    setRestarting(true)
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('start_backend')
      window.location.reload()
    } catch (e) {
      console.error('Restart failed', e)
      setRestarting(false)
    }
  }

  const handleOpenUrl = async (url: string) => {
    try { await open(url) } catch {}
  }

  const isError = status === 'error'
  const isMismatch = status === 'mismatch'

  const title = {
    checking: 'Detecting Local Systems',
    starting: 'Starting Intelligence Engine',
    error: 'Engine Initialization Failed',
    reconnecting: 'Reconnecting to Engine',
    mismatch: 'Version Mismatch Detected',
  }[status]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)', zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      gap: 0,
      animation: 'fadeIn 0.3s ease-out',
      fontFamily: 'var(--font-mono, monospace)',
    }}>
      {/* Spinner or X icon */}
      <div style={{
        width: 40, height: 40,
        border: `2px solid var(--border)`,
        borderTopColor: isError ? '#ff4444' : 'var(--accent)',
        borderRadius: '50%',
        animation: isError || isMismatch ? 'none' : 'spin 1s linear infinite',
        marginBottom: 24,
        opacity: isError || isMismatch ? 0.3 : 1,
      }} />

      <h2 style={{
        fontSize: 15, fontWeight: 600, color: isError ? '#ff4444' : 'var(--ink)',
        letterSpacing: '-0.4px', marginBottom: 6,
      }}>
        {title}
      </h2>

      {/* Real-time log terminal */}
      {!isError && !isMismatch && (
        <div
          ref={logRef}
          style={{
            marginTop: 20, width: 480, maxHeight: 180,
            overflowY: 'auto', background: 'rgba(0,0,0,0.04)',
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '12px 16px', fontSize: 11,
            color: 'var(--ink-3)', lineHeight: 1.9,
            fontFamily: 'Consolas, monospace',
            scrollbarWidth: 'none',
          }}
        >
          {logLines.map((line, i) => (
            <div key={i} style={{
              color: line.startsWith('[ OK ]') ? '#22c55e' : line.startsWith('[ERR]') ? '#ff4444' : 'var(--ink-3)',
              opacity: i < logLines.length - 1 ? 0.6 : 1,
            }}>
              {line}
            </div>
          ))}
          <div style={{ color: 'var(--accent)', display: 'inline' }}>▌</div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 460, textAlign: 'center', marginTop: 16 }}>
          {/* Help box */}
          <div style={{
            background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.2)',
            borderRadius: 8, padding: '14px 18px', fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.9, width: '100%',
          }}>
            <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 8, fontSize: 13 }}>
              Most Common Fix
            </strong>
            The AI engine requires <strong>Microsoft Visual C++ Redistributable</strong>.{' '}
            <span
              onClick={() => handleOpenUrl('https://aka.ms/vs/17/release/vc_redist.x64.exe')}
              style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}
            >
              Download VC++ Redist →
            </span>
            <br />
            Install it, then click <strong>Retry Boot</strong>.
            <br /><br />
            <strong style={{ color: 'var(--ink)' }}>Need more detail?</strong> Click <strong>Open Logs</strong> to see the exact error.
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="organize-btn"
              onClick={() => window.location.reload()}
              style={{ fontSize: 12, padding: '8px 18px' }}
            >
              Retry Boot
            </button>
            <button
              className="organize-btn"
              onClick={handleRestartBackend}
              disabled={restarting}
              style={{ fontSize: 12, padding: '8px 18px', opacity: restarting ? 0.6 : 1 }}
            >
              {restarting ? 'Restarting...' : 'Restart Backend'}
            </button>
            <button
              onClick={handleOpenLogs}
              style={{
                background: 'none', border: '1px solid var(--border)',
                color: 'var(--ink)', borderRadius: 'var(--r-md)',
                padding: '8px 18px', fontSize: 12, cursor: 'pointer',
              }}
            >
              Open Logs
            </button>
          </div>
        </div>
      )}

      {/* Mismatch state */}
      {isMismatch && (
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', maxWidth: 380, lineHeight: 1.8 }}>
          Your desktop app and backend are on incompatible versions.
          <br />Please reinstall KNEMOS from the{' '}
          <span
            onClick={() => handleOpenUrl('https://knemos.vercel.app/download')}
            style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}
          >
            downloads page
          </span>.
          <div style={{ marginTop: 16 }}>
            <button className="organize-btn" onClick={() => window.location.reload()} style={{ fontSize: 12 }}>
              Retry Anyway
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
