import { useUIStore } from '../../store/ui.store'
import { useSystemStore } from '../../store/system.store'

export const DeepWorkOverlay = () => {
  const { toggleDeepWork } = useUIStore()
  const { focusScore } = useSystemStore()

  const grade = focusScore?.grade || '—'

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      {/* Absolute fullscreen blocking layer */}
      <div 
        style={{
          position: 'absolute', inset: 0, 
          background: 'var(--ink)', 
          color: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.4s ease'
        }}
      >
        {/* Geometric focus animation */}
        <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 60 }}>
          <div style={{ position: 'absolute', width: 100, height: 100, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', animation: 'expandContract 10s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 150, height: 150, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', animation: 'expandContract 14s ease-in-out infinite reverse' }} />
          <div style={{ fontSize: 64, fontWeight: 100 }}>◇</div>
        </div>

        <div style={{ fontSize: 14, letterSpacing: 6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
          Focus Mode Active
        </div>
        
        <div style={{ fontSize: 32, fontWeight: 300, marginBottom: 40 }}>
          Background Distractions Minimized
        </div>

        <div style={{ display: 'flex', gap: 40, marginBottom: 60, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 40, fontWeight: 100 }}>{grade}</div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Focus Grade</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: 40, fontWeight: 100, color: 'var(--accent)' }}>Active</div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Auto-Minimize</div>
          </div>
        </div>

        <button 
          onClick={toggleDeepWork}
          style={{
            padding: '12px 32px',
            background: '#fff', color: 'var(--ink)',
            border: 'none', borderRadius: 99,
            fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Exit Deep Work
        </button>
      </div>
    </div>
  )
}
