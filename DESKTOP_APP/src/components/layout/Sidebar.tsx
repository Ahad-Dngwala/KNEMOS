import { useUIStore, ActivePanel } from '../../store/ui.store'
import { useCategoriesStore } from '../../store/categories.store'
import { useSystemStore } from '../../store/system.store'

interface NavItem {
  id: ActivePanel
  label: string
  symbol: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'categories', label: 'Categories',  symbol: '□' },
  { id: 'chat',       label: 'AI Chat',     symbol: '○' },
  { id: 'analytics',  label: 'Analytics',   symbol: '+' },
  { id: 'settings',   label: 'Settings',    symbol: '—' },
]

export const Sidebar = () => {
  const { activePanel, setActivePanel, toggleDeepWork, deepWorkActive } = useUIStore()
  const { categories } = useCategoriesStore()
  const { ramStats } = useSystemStore()

  const totalItems = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="sidebar">
      {/* Section label */}
      <div className="sidebar-header">
        <span className="sidebar-section-title">Navigation</span>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activePanel === item.id ? 'active' : ''}`}
            onClick={() => setActivePanel(item.id)}
          >
            <span className="sidebar-nav-symbol">{item.symbol}</span>
            <span className="sidebar-nav-label">{item.label}</span>
            {item.id === 'categories' && totalItems > 0 && (
              <span className="sidebar-nav-badge">{totalItems}</span>
            )}
          </button>
        ))}

        <div className="sidebar-divider" />

        {/* Deep Work Mode */}
        <button
          className={`sidebar-nav-item ${deepWorkActive ? 'active' : ''}`}
          onClick={toggleDeepWork}
          style={deepWorkActive ? { background: '#000', color: '#fff' } : {}}
        >
          <span className="sidebar-nav-symbol">◇</span>
          <span className="sidebar-nav-label">Deep Work</span>
          {deepWorkActive && (
            <span className="sidebar-nav-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              ON
            </span>
          )}
        </button>
      </nav>

      {/* Geometric decoration */}
      <div className="sidebar-decoration" />

      {/* Footer with RAM */}
      <div className="sidebar-footer">
        {ramStats ? (
          <div>
            <div className="sidebar-backend-status">
              RAM: {ramStats.used_gb?.toFixed(1) ?? '?'} / {ramStats.total_gb?.toFixed(1) ?? '?'} GB
            </div>
            <div className="sidebar-backend-status" style={{ marginTop: 4, color: 'var(--accent)' }}>
              {ramStats.percent?.toFixed(0) ?? 0}% used
            </div>
          </div>
        ) : (
          <div className="sidebar-backend-status">Backend offline</div>
        )}
      </div>
    </div>
  )
}
