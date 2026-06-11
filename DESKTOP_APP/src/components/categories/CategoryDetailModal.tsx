import { useCategoriesStore, CategoryType, CATEGORY_META } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'

interface Props {
  categoryType: CategoryType
}

const SOURCE_SYMBOL: Record<string, string> = {
  browser_tab: '○',
  window: '+',
  file: '—',
  process: '×',
}

export const CategoryDetailModal = ({ categoryType }: Props) => {
  const { categories } = useCategoriesStore()
  const { setActiveCategoryModal } = useUIStore()
  const items = categories[categoryType] || []
  const meta = CATEGORY_META[categoryType]

  const activeCount = items.filter(i => i.isActive).length
  const totalMem = items.reduce((s, i) => s + (i.memoryMb || 0), 0)

  return (
    <div className="modal-backdrop" onClick={() => setActiveCategoryModal(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 600 }}>
              {meta.symbol} — Category
            </div>
            <div className="modal-title">{meta.label}</div>
          </div>
          <button className="modal-close" onClick={() => setActiveCategoryModal(null)}>
            +
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, background: 'var(--ink)', padding: 2 }}>
          {[
            { label: 'Total', value: items.length },
            { label: 'Active', value: activeCount },
            { label: 'Memory', value: `${(totalMem / 1024).toFixed(1)} GB` },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--bg-panel)', padding: '16px 18px' }}>
              <div style={{ fontSize: 28, fontWeight: 100, letterSpacing: -1 }}>{s.value}</div>
              <div className="label-caps">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Item list */}
        <div className="modal-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-symbol">{meta.symbol}</div>
              <div className="empty-state-title">No items in this category</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 24px',
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg)',
                  }}
                >
                  {/* Symbol */}
                  <span style={{ fontSize: 14, fontWeight: 100, color: 'var(--ink-3)', width: 14 }}>
                    {SOURCE_SYMBOL[item.source] || '+'}
                  </span>

                  {/* Title */}
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 400, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>

                  {/* Active badge */}
                  {item.isActive && (
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--accent)', padding: '2px 6px', background: 'var(--accent-light)', borderRadius: 99 }}>
                      Live
                    </span>
                  )}

                  {/* Memory */}
                  {item.memoryMb && (
                    <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                      {item.memoryMb} MB
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setActiveCategoryModal(null)}
            className="organize-btn"
            style={{ fontSize: 10, padding: '8px 20px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
