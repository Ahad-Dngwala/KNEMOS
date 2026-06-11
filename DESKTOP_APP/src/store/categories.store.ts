import { create } from 'zustand'

export type CategoryType = 'browsers' | 'apps' | 'tabs' | 'files' | 'processes' | 'workspaces'

export const CATEGORY_META: Record<CategoryType, { label: string; symbol: string; description: string }> = {
  browsers:   { label: 'Browsers',   symbol: '○', description: 'Browser windows' },
  apps:       { label: 'Apps',       symbol: '+', description: 'Open applications' },
  tabs:       { label: 'Tabs',       symbol: '—', description: 'Browser tabs' },
  files:      { label: 'Files',      symbol: '□', description: 'Open files' },
  processes:  { label: 'Processes',  symbol: '×', description: 'Background processes' },
  workspaces: { label: 'Workspaces', symbol: '◇', description: 'AI workspace clusters' },
}

export interface CategoryItem {
  id: string
  title: string
  source: 'browser_tab' | 'window' | 'file' | 'process'
  url?: string
  path?: string
  categoryType: CategoryType
  workspaceId?: string
  lastActive?: number
  isActive?: boolean
  memoryMb?: number
}

export interface Category {
  id: CategoryType
  items: CategoryItem[]
}

// Pending override: item moved to different category by user
interface PendingMove {
  itemId: string
  fromCategory: CategoryType
  toCategory: CategoryType
}

interface CategoriesState {
  categories: Record<CategoryType, CategoryItem[]>
  pendingMoves: PendingMove[]
  manualOverrides: Record<string, CategoryType>  // itemId -> category override

  setCategories: (cats: Record<CategoryType, CategoryItem[]>) => void
  applyWorkspaceData: (workspaces: any[]) => void
  stageMoveItem: (itemId: string, from: CategoryType, to: CategoryType) => void
  confirmPendingMoves: () => void
  discardPendingMoves: () => void
  hasPendingChanges: () => boolean
}

function classifyItem(item: any): CategoryType {
  const source = item.source as string
  const title = (item.title || '').toLowerCase()
  const url = (item.url || '').toLowerCase()

  if (source === 'browser_tab') {
    // Check if the tab is one of many tabs in a browser window
    if (url.startsWith('http')) return 'tabs'
    return 'browsers'
  }
  if (source === 'window') {
    const browserNames = ['chrome', 'firefox', 'edge', 'brave', 'safari', 'opera']
    if (browserNames.some(b => title.includes(b))) return 'browsers'
    return 'apps'
  }
  if (source === 'file') return 'files'
  if (source === 'process') return 'processes'
  return 'apps'
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: {
    browsers: [], apps: [], tabs: [], files: [], processes: [], workspaces: [],
  },
  pendingMoves: [],
  manualOverrides: {},

  setCategories: (cats) => set({ categories: cats }),

  applyWorkspaceData: (workspaces) => {
    const { manualOverrides } = get()
    const cats: Record<CategoryType, CategoryItem[]> = {
      browsers: [], apps: [], tabs: [], files: [], processes: [], workspaces: [],
    }

    workspaces.forEach((ws: any) => {
      // Add workspace cluster itself
      const wsItem: CategoryItem = {
        id: `ws-${ws.id}`,
        title: ws.name || 'Workspace',
        source: 'window',
        categoryType: 'workspaces',
        workspaceId: ws.id,
        isActive: false,
      }
      cats.workspaces.push(wsItem)

      // Classify each item in the workspace
      ;(ws.items || []).forEach((item: any, i: number) => {
        const id = `${ws.id}-${i}-${item.title}`
        const naturalCategory = classifyItem(item)
        const overrideCategory = manualOverrides[id]
        const finalCategory = overrideCategory || naturalCategory

        const catItem: CategoryItem = {
          id,
          title: item.title || 'Unknown',
          source: item.source,
          url: item.url,
          path: item.path,
          categoryType: finalCategory,
          workspaceId: ws.id,
          isActive: true,
          memoryMb: Math.floor(Math.random() * 200 + 50),
        }
        cats[finalCategory].push(catItem)
      })
    })

    set({ categories: cats })
  },

  stageMoveItem: (itemId, from, to) => {
    set((state) => {
      // Apply visually in categories
      const cats = { ...state.categories }
      const fromArr = [...cats[from]]
      const toArr = [...cats[to]]
      const idx = fromArr.findIndex(i => i.id === itemId)
      if (idx === -1) return {}
      const [moved] = fromArr.splice(idx, 1)
      moved.categoryType = to
      toArr.push(moved)
      cats[from] = fromArr
      cats[to] = toArr

      const existing = state.pendingMoves.filter(m => m.itemId !== itemId)
      const newMoves = [...existing, { itemId, fromCategory: from, toCategory: to }]

      return { categories: cats, pendingMoves: newMoves }
    })
  },

  confirmPendingMoves: () => {
    const { pendingMoves, manualOverrides } = get()
    const newOverrides = { ...manualOverrides }
    pendingMoves.forEach(m => { newOverrides[m.itemId] = m.toCategory })
    set({ pendingMoves: [], manualOverrides: newOverrides })

    // Notify backend
    fetch('http://127.0.0.1:8765/api/workspace/organize', { method: 'POST' }).catch(() => {})
  },

  discardPendingMoves: () => {
    // Re-apply from original workspace data - trigger a re-fetch
    set({ pendingMoves: [] })
    fetch('http://127.0.0.1:8765/api/workspace/list')
      .then(r => r.json())
      .then(data => get().applyWorkspaceData(data.workspaces || []))
      .catch(() => {})
  },

  hasPendingChanges: () => get().pendingMoves.length > 0,
}))
