import { useState, useEffect } from 'react'
import { authenticatedFetch } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import { useWorkspaceStore } from '../../store/workspace.store'
import { useSettingsStore } from '../../store/settings.store'

const API = 'http://127.0.0.1:8765'

export const DeepWorkOverlay = () => {
  const { toggleDeepWork } = useUIStore()
  const { workspaces, focusWorkspaceId, setFocusWorkspace } = useWorkspaceStore()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(focusWorkspaceId || '')
  const [minimizedCount, setMinimizedCount] = useState(0)
  const [isActivating, setIsActivating] = useState(false)
  const [status, setStatus] = useState<'idle' | 'active' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId)

  const { deepFocusTimerSeconds } = useSettingsStore()
  const [timeLeft, setTimeLeft] = useState(deepFocusTimerSeconds)

  const handleActivate = async () => {
    setIsActivating(true)
    setErrorMsg('')

    const protectedTitles = selectedWorkspace
      ? selectedWorkspace.items.map(i => i.title)
      : []

    try {
      const res = await authenticatedFetch(`${API}/api/focus/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: selectedWorkspaceId || null,
          workspace_name: selectedWorkspace?.name || 'Deep Focus',
          protected_titles: protectedTitles,
        }),
      })
      const data = await res.json()

      if (data.status === 'activated' || data.status === 'ok') {
        setMinimizedCount(data.minimized_count || 0)
        setStatus('active')
        setTimeLeft(deepFocusTimerSeconds) // Reset timer
        if (selectedWorkspaceId) {
          setFocusWorkspace(selectedWorkspaceId)
        }
      } else {
        setStatus('error')
        setErrorMsg(data.message || 'Failed to activate focus mode')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Backend not reachable. Make sure KNEMOS backend is running.')
    } finally {
      setIsActivating(false)
    }
  }

  const handleExit = async () => {
    try {
      await authenticatedFetch(`${API}/api/focus/deactivate`, { method: 'POST' })
    } catch {}
    setFocusWorkspace(null)
    setStatus('idle')
    setMinimizedCount(0)
    toggleDeepWork()
  }

  // Timer countdown logic
  useEffect(() => {
    let timer: any;
    if (status === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            handleExit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [status, timeLeft])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      {/* Geometric decoration */}
      <div style={{
        width: 80,
        height: 80,
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        animation: 'focus-pulse 3s ease-in-out infinite',
      }}>
        <div style={{
          width: 32,
          height: 32,
          background: status === 'active' ? 'rgba(255,255,255,0.3)' : 'transparent',
          border: '2px solid rgba(255,255,255,0.6)',
          transform: 'rotate(45deg)',
          transition: 'all 0.5s',
        }} />
      </div>

      <div style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 4,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 12,
      }}>
        Focus Mode {status === 'active' ? 'Active' : 'Setup'}
      </div>

      <div style={{
        fontSize: 28,
        fontWeight: 100,
        color: '#fff',
        letterSpacing: -0.5,
        marginBottom: 8,
        textAlign: 'center',
      }}>
        {status === 'active'
          ? 'Background Distractions Minimized'
          : 'Select Your Focus Workspace'}
      </div>

      {status === 'idle' && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            Choose a workspace to protect. All other windows will be minimized.
          </div>

          {/* Workspace selector */}
          <select
            value={selectedWorkspaceId}
            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ color: '#000' }}>No specific workspace (custom)</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id} style={{ color: '#000' }}>
                {ws.name} ({ws.items.length} items)
              </option>
            ))}
          </select>

          {selectedWorkspace && selectedWorkspace.items.length > 0 && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              Protecting: {selectedWorkspace.items.slice(0, 3).map(i => i.title).join(', ')}
              {selectedWorkspace.items.length > 3 && ` +${selectedWorkspace.items.length - 3} more`}
            </div>
          )}

          {errorMsg && (
            <div style={{ fontSize: 11, color: '#ff6b6b', textAlign: 'center' }}>{errorMsg}</div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleActivate}
              disabled={isActivating}
              style={{
                flex: 1,
                padding: '12px 0',
                background: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: 24,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: isActivating ? 'wait' : 'pointer',
                opacity: isActivating ? 0.7 : 1,
              }}
            >
              {isActivating ? 'Activating...' : 'Activate Focus'}
            </button>
            <button
              onClick={toggleDeepWork}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 24,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === 'active' && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
                Time Left
              </div>
              <div style={{ fontSize: 28, fontWeight: 100, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
                Focus Grade
              </div>
              <div style={{ fontSize: 28, fontWeight: 100, color: '#fff' }}>—</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
                Minimized
              </div>
              <div style={{ fontSize: 28, fontWeight: 100, color: '#fff' }}>{minimizedCount}</div>
            </div>
            {selectedWorkspace && (
              <>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Protected
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.8)' }}>{selectedWorkspace.name}</div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleExit}
            style={{
              marginTop: 8,
              padding: '12px 40px',
              background: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: 24,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Exit Deep Focus
          </button>
        </div>
      )}

      {status === 'error' && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#ff6b6b', marginBottom: 16 }}>{errorMsg}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStatus('idle')} style={{
              padding: '10px 24px',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Try Again
            </button>
            <button onClick={toggleDeepWork} style={{
              padding: '10px 24px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20,
              fontSize: 11,
              cursor: 'pointer',
            }}>
              Exit
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes focus-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 0 20px rgba(255,255,255,0.0); }
        }
      `}</style>
    </div>
  )
}
