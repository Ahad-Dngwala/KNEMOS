import { useSystemStore } from '../../store/system.store'
import { useCategoriesStore } from '../../store/categories.store'

export const AnalyticsPanel = () => {
  const { ramStats, focusScore } = useSystemStore()
  const { categories } = useCategoriesStore()

  const totalApps   = categories.apps.length
  const totalBrowsers = categories.browsers.length
  const totalTabs   = categories.tabs.length
  const totalFiles  = categories.files.length
  const totalProc   = categories.processes.length
  const totalWS     = categories.workspaces.length

  // Focus score display
  const score = focusScore?.score ?? 0
  const grade = focusScore?.grade ?? '—'
  const scoreWidth = `${score}%`

  const topApps = [...categories.apps, ...categories.browsers]
    .sort((a, b) => (b.memoryMb || 0) - (a.memoryMb || 0))
    .slice(0, 8)

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Title */}
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div className="section-title">Analytics</div>
        <div className="section-line" />
        <div className="section-subtitle">+ Live metrics</div>
      </div>

      {/* Top stats grid — Minimal White stats-grid pattern */}
      <div className="analytics-stats-grid">
        {[
          { label: 'Apps',       value: totalApps },
          { label: 'Browsers',   value: totalBrowsers },
          { label: 'Tabs',       value: totalTabs },
          { label: 'Files',      value: totalFiles },
          { label: 'Processes',  value: totalProc },
          { label: 'Workspaces', value: totalWS },
        ].map((s) => (
          <div key={s.label} className="analytics-stat-cell">
            <div className="analytics-stat-diamond" />
            <div className="analytics-stat-number">{s.value}</div>
            <div className="analytics-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* RAM + Focus row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* RAM */}
        <div className="focus-score-bar">
          <div className="focus-score-label">RAM Usage</div>
          {ramStats ? (
            <>
              <div className="focus-score-row">
                <div className="focus-score-track" style={{ flex: 1 }}>
                  <div className="focus-score-fill" style={{ width: `${ramStats.percent ?? 0}%` }} />
                </div>
                <div className="focus-score-grade" style={{ fontSize: 28 }}>
                  {(ramStats.used_gb ?? 0).toFixed(1)}
                  <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink-3)' }}>
                    /{(ramStats.total_gb ?? 0).toFixed(0)} GB
                  </span>
                </div>
              </div>
              {(ramStats.saved_gb ?? 0) > 0 && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: 0.5 }}>
                  + {ramStats.saved_gb?.toFixed(1)} GB recovered by AI
                </div>
              )}
            </>
          ) : (
            <div style={{ color: 'var(--ink-4)', fontSize: 13 }}>Backend offline</div>
          )}
        </div>

        {/* Focus Score */}
        <div className="focus-score-bar">
          <div className="focus-score-label">Cognitive Focus Score</div>
          <div className="focus-score-row">
            <div className="focus-score-track" style={{ flex: 1 }}>
              <div className="focus-score-fill" style={{ width: scoreWidth }} />
            </div>
            <div className="focus-score-grade">{grade}</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-3)' }}>
            {focusScore ? `${focusScore.context_switches ?? 0} context switches` : 'Calculating...'}
          </div>
        </div>
      </div>

      {/* App Table */}
      <div className="analytics-app-table">
        <div className="analytics-table-header">
          <div className="analytics-table-header-cell">Application</div>
          <div className="analytics-table-header-cell">Memory</div>
          <div className="analytics-table-header-cell">Status</div>
          <div className="analytics-table-header-cell">Type</div>
        </div>
        {topApps.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-4)', fontSize: 12 }}>
            No application data yet. Organize your workspace first.
          </div>
        ) : (
          topApps.map((item) => (
            <div key={item.id} className="analytics-table-row">
              <div className="analytics-table-cell">{item.title}</div>
              <div className="analytics-table-cell">{item.memoryMb ?? '—'} MB</div>
              <div className="analytics-table-cell">
                <span className={`analytics-status-dot ${item.isActive ? 'active' : 'idle'}`} />
                {item.isActive ? 'Active' : 'Idle'}
              </div>
              <div className="analytics-table-cell">{item.categoryType}</div>
            </div>
          ))
        )}
      </div>

      {/* Export button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="organize-btn"
          style={{ fontSize: 10, padding: '10px 24px' }}
          onClick={() => {
            const data = JSON.stringify({ categories, ramStats, focusScore }, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `knemos-analytics-${Date.now()}.json`
            a.click()
          }}
        >
          Export Data
        </button>
      </div>
    </div>
  )
}
