import { create } from 'zustand'

export type ActivePanel = 'categories' | 'chat' | 'analytics' | 'settings'

interface UIState {
  activePanel: ActivePanel
  deepWorkActive: boolean
  pendingChanges: boolean
  pendingChangeCount: number
  activeCategoryModal: string | null

  setActivePanel: (p: ActivePanel) => void
  toggleDeepWork: () => void
  setPendingChanges: (v: boolean, count?: number) => void
  setActiveCategoryModal: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: 'categories',
  deepWorkActive: false,
  pendingChanges: false,
  pendingChangeCount: 0,
  activeCategoryModal: null,

  setActivePanel: (activePanel) => set({ activePanel }),
  toggleDeepWork: () => set((s) => ({ deepWorkActive: !s.deepWorkActive })),
  setPendingChanges: (pendingChanges, count = 0) =>
    set({ pendingChanges, pendingChangeCount: count }),
  setActiveCategoryModal: (id) => set({ activeCategoryModal: id }),
}))
