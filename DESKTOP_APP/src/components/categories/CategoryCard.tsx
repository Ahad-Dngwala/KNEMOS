import { CategoryItem, CategoryType, CATEGORY_META } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'

interface Props {
  categoryType: CategoryType
  items: CategoryItem[]
  onDragStart: (item: CategoryItem) => void
  onDrop: (to: CategoryType) => void
  isDragOver: boolean
  onDragOver: (e: React.DragEvent, to: CategoryType) => void
  onDragLeave: () => void
}

// Items threshold: compact = <=7, expanded = >7
const COMPACT_THRESHOLD = 7

// Symbol map for items
const SOURCE_SYMBOL: Record<string, string> = {
  browser_tab: '○',
  window: '+',
  file: '—',
  process: '×',
}

// Compact card (<=7 items) — iOS small folder style
const CompactCard = ({ categoryType, items, onDragStart, onDrop, isDragOver, onDragOver, onDragLeave }: Props) => {
  const { setActiveCategoryModal } = useUIStore()
  const meta = CATEGORY_META[categoryType]
  const displayItems = items.slice(0, 9)

  return (
    <div
      className={`category-card compact-card ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, categoryType) }}
      onDrop={() => onDrop(categoryType)}
      onDragLeave={onDragLeave}
    >
      {/* Header */}
      <div
        className="category-card-header"
        onClick={() => setActiveCategoryModal(categoryType)}
      >
        <div className="category-card-title-row">
          <span className="category-card-symbol">{meta.symbol}</span>
          <span className="category-card-title">{meta.label}</span>
        </div>
        <span className="category-card-count">{items.length}</span>
      </div>

      {/* Icon grid body */}
      <div className="category-card-body">
        {items.length === 0 ? (
          <div style={{ padding: '12px 10px 14px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 11 }}>
            Empty
          </div>
        ) : (
          <div className="compact-icon-grid">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="compact-icon-item"
                draggable
                onDragStart={() => onDragStart(item)}
                title={item.title}
              >
                <div className="compact-icon-bubble">
                  {SOURCE_SYMBOL[item.source] || '+'}
                </div>
                <span className="compact-icon-label">
                  {item.title.length > 10
                    ? item.title.slice(0, 9) + '...'
                    : item.title}
                </span>
              </div>
            ))}
            {items.length > 9 && (
              <div
                className="compact-icon-item"
                onClick={() => setActiveCategoryModal(categoryType)}
                style={{ cursor: 'pointer' }}
              >
                <div className="compact-icon-bubble" style={{ fontSize: 12, fontWeight: 400 }}>
                  +{items.length - 9}
                </div>
                <span className="compact-icon-label">more</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Expanded card (>7 items) — iOS large folder / dense list
const ExpandedCard = ({ categoryType, items, onDragStart, onDrop, isDragOver, onDragOver, onDragLeave }: Props) => {
  const { setActiveCategoryModal } = useUIStore()
  const meta = CATEGORY_META[categoryType]
  const displayItems = items.slice(0, 12)

  return (
    <div
      className={`category-card expanded-card ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, categoryType) }}
      onDrop={() => onDrop(categoryType)}
      onDragLeave={onDragLeave}
    >
      {/* Header */}
      <div
        className="category-card-header"
        onClick={() => setActiveCategoryModal(categoryType)}
      >
        <div className="category-card-title-row">
          <span className="category-card-symbol">{meta.symbol}</span>
          <span className="category-card-title">{meta.label}</span>
        </div>
        <span className="category-card-count">{items.length}</span>
      </div>

      {/* Dense list body */}
      <div className="category-card-body">
        <div className="expanded-item-list">
          {items.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 11 }}>
              Empty
            </div>
          ) : (
            displayItems.map((item) => (
              <div
                key={item.id}
                className="expanded-item-row"
                draggable
                onDragStart={() => onDragStart(item)}
                title={item.title}
              >
                <span className="expanded-item-symbol">
                  {SOURCE_SYMBOL[item.source] || '+'}
                </span>
                <span className="expanded-item-title">{item.title}</span>
                {item.isActive && (
                  <span className="expanded-item-meta" style={{ color: 'var(--accent)', fontSize: 9 }}>
                    live
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        {items.length > 12 && (
          <div
            className="card-show-more"
            onClick={() => setActiveCategoryModal(categoryType)}
          >
            + {items.length - 12} more items
          </div>
        )}
      </div>
    </div>
  )
}

// Unified export: picks compact vs expanded automatically
export const CategoryCard = (props: Props) => {
  if (props.items.length <= COMPACT_THRESHOLD) {
    return <CompactCard {...props} />
  }
  return <ExpandedCard {...props} />
}
