
import { useCategoriesStore } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'

export const PendingChangesOverlay = () => {
  const { confirmPendingMoves, discardPendingMoves } = useCategoriesStore()
  const { setPendingChanges, pendingChangeCount } = useUIStore()

  const handleConfirm = () => {
    confirmPendingMoves()
    setPendingChanges(false, 0)
  }

  const handleDiscard = () => {
    discardPendingMoves()
    setPendingChanges(false, 0)
  }

  return (
    <div className="pending-overlay">
      <div className="pending-card">
        {/* Corner diamond decoration — Minimal White */}
        <div style={{
          position: 'absolute', top: -10, left: 20,
          width: 16, height: 16, border: '2px solid var(--ink)',
          transform: 'rotate(45deg)', background: 'var(--bg-panel)',
        }} />

        <div className="pending-card-title">Apply Workspace Changes?</div>
        <div className="pending-card-desc">
          {pendingChangeCount} item{pendingChangeCount !== 1 ? 's' : ''} moved.
          Confirm to save and update AI memory, or discard to revert.
        </div>

        <div className="pending-card-actions">
          <button className="pending-btn-confirm" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="pending-btn-discard" onClick={handleDiscard}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
