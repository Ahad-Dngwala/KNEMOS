import { useUIStore } from '../../store/ui.store'
import { useCategoriesStore } from '../../store/categories.store'
import { CategoryGrid } from '../categories/CategoryGrid'
import { ChatPanel } from '../chat/ChatPanel'
import { AnalyticsPanel } from '../analytics/AnalyticsDashboard'
import { SettingsPanel } from '../settings/SettingsPanel'
import { PendingChangesOverlay } from '../dnd/PendingChangesOverlay'
import { DeepWorkOverlay } from '../system/DeepWorkOverlay'
import { useFocusAutomation } from '../../hooks/useFocusAutomation'

export const MainArea = () => {
  const { activePanel, pendingChanges, deepWorkActive } = useUIStore()
  const { hasPendingChanges } = useCategoriesStore()

  // Initialize focus automation hook
  useFocusAutomation()

  const renderPanel = () => {
    switch (activePanel) {
      case 'categories': return <CategoryGrid />
      case 'chat':       return <ChatPanel />
      case 'analytics':  return <AnalyticsPanel />
      case 'settings':   return <SettingsPanel />
      default:           return <CategoryGrid />
    }
  }

  return (
    <div className="main-content relative">
      {/* Dynamic Header for Categories panel only (others have their own) */}
      {activePanel === 'categories' && (
        <div className="section-header fade-in-section visible">
          <div className="section-title">Workspace</div>
          <div className="section-line" />
          <div className="section-subtitle">□ — semantic organization</div>
        </div>
      )}

      {/* Main panel content with simple fade */}
      <div key={activePanel} className="fade-in-section visible" style={{ height: activePanel === 'chat' ? '100%' : 'auto' }}>
        {renderPanel()}
      </div>

      {/* Overlays */}
      {(pendingChanges || hasPendingChanges()) && <PendingChangesOverlay />}
      {deepWorkActive && <DeepWorkOverlay />}
    </div>
  )
}
