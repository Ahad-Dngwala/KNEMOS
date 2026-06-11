import { useState, useRef } from 'react'
import { CategoryCard } from './CategoryCard'
import { useCategoriesStore, CategoryType, CategoryItem } from '../../store/categories.store'
import { useUIStore } from '../../store/ui.store'
import { CategoryDetailModal } from './CategoryDetailModal'

const CATEGORY_ORDER: CategoryType[] = ['browsers', 'apps', 'tabs', 'files', 'processes', 'workspaces']

export const CategoryGrid = () => {
  const { categories, stageMoveItem } = useCategoriesStore()
  const { setPendingChanges, activeCategoryModal } = useUIStore()

  const [dragItem, setDragItem] = useState<CategoryItem | null>(null)
  const [dragOverCategory, setDragOverCategory] = useState<CategoryType | null>(null)
  const pendingCount = useRef(0)

  const handleDragStart = (item: CategoryItem) => {
    setDragItem(item)
  }

  const handleDragOver = (e: React.DragEvent, to: CategoryType) => {
    e.preventDefault()
    setDragOverCategory(to)
  }

  const handleDragLeave = () => {
    setDragOverCategory(null)
  }

  const handleDrop = (to: CategoryType) => {
    setDragOverCategory(null)
    if (!dragItem) return
    if (dragItem.categoryType === to) {
      setDragItem(null)
      return
    }

    stageMoveItem(dragItem.id, dragItem.categoryType, to)
    pendingCount.current += 1
    setPendingChanges(true, pendingCount.current)
    setDragItem(null)
  }

  const totalItems = Object.values(categories).reduce((s, a) => s + a.length, 0)

  if (totalItems === 0) {
    return (
      <div className="empty-state fade-in-section visible">
        <div className="empty-state-symbol">□</div>
        <div className="empty-state-title">No active items</div>
        <div className="empty-state-desc">
          Click "Auto Organize" to scan your open windows and tabs.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="category-grid">
        {CATEGORY_ORDER.map((cat) => (
          <CategoryCard
            key={cat}
            categoryType={cat}
            items={categories[cat]}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            isDragOver={dragOverCategory === cat}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          />
        ))}
      </div>

      {/* Category detail modal */}
      {activeCategoryModal && (
        <CategoryDetailModal categoryType={activeCategoryModal as CategoryType} />
      )}
    </>
  )
}
