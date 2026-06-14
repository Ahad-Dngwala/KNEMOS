import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authenticatedFetch } from './auth.store'

export interface WorkspaceItem {
  id: string
  title: string
  source: string
  url?: string
  path?: string
  categoryType: string
  memoryMb?: number
  isActive?: boolean
}

export interface UserWorkspace {
  id: string
  name: string
  items: WorkspaceItem[]
  isPinned: boolean
  isActive: boolean
  createdAt: number
  color?: string
}

interface WorkspaceState {
  workspaces: UserWorkspace[]
  focusWorkspaceId: string | null
  isLoading: boolean

  setWorkspaces: (ws: UserWorkspace[]) => void
  createWorkspace: (name: string) => Promise<string>
  renameWorkspace: (id: string, name: string) => void
  deleteWorkspace: (id: string) => void
  addItemToWorkspace: (workspaceId: string, item: WorkspaceItem) => void
  removeItemFromWorkspace: (workspaceId: string, itemId: string) => void
  pinWorkspace: (id: string) => void
  unpinWorkspace: (id: string) => void
  setFocusWorkspace: (id: string | null) => void
  fetchWorkspaces: () => Promise<void>
  syncToBackend: (ws: UserWorkspace) => Promise<void>
}

const API = 'http://127.0.0.1:8765'

/**
 * workspace.store.ts
 *
 * Manages user workspaces and synchronizes local state with the backend.
 * - Uses `persist` middleware to keep a local copy (`knemos-workspaces`).
 * - Exposes optimistic updates (e.g., `createWorkspace` returns a temp id and
 *   later reconciles with the server-provided id when available).
 *
 * Note: Network errors are intentionally swallowed in many places to keep
 * the UI responsive; callers should account for possible divergence.
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      focusWorkspaceId: null,
      isLoading: false,

      setWorkspaces: (workspaces) => set({ workspaces }),

      fetchWorkspaces: async () => {
        try {
          const res = await authenticatedFetch(`${API}/api/workspace/user-workspaces`)
          if (!res.ok) return
          const data = await res.json()
          const mapped: UserWorkspace[] = (data.workspaces || []).map((w: any) => ({
            id: w.id,
            name: w.name,
            items: w.items || [],
            isPinned: w.is_pinned || false,
            isActive: false,
            createdAt: w.created_at || Date.now(),
          }))
          set({ workspaces: mapped })
        } catch {}
      },

      createWorkspace: async (name) => {
        const tempId = `ws-${Date.now()}`
        const newWs: UserWorkspace = {
          id: tempId,
          name,
          items: [],
          isPinned: false,
          isActive: false,
          createdAt: Date.now(),
        }
        set((state) => ({ workspaces: [...state.workspaces, newWs] }))

        try {
          const res = await authenticatedFetch(`${API}/api/workspace/user-workspaces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, items: [] })
          })
          if (res.ok) {
            const data = await res.json()
            // Update with real ID from backend
            set((state) => ({
              workspaces: state.workspaces.map(w =>
                w.id === tempId ? { ...w, id: data.id } : w
              )
            }))
            return data.id
          }
        } catch {}
        return tempId
      },

      renameWorkspace: (id, name) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === id ? { ...w, name } : w)
        }))
        const ws = get().workspaces.find(w => w.id === id)
        if (ws) get().syncToBackend({ ...ws, name })
      },

      deleteWorkspace: (id) => {
        set((state) => ({
          workspaces: state.workspaces.filter(w => w.id !== id),
          focusWorkspaceId: state.focusWorkspaceId === id ? null : state.focusWorkspaceId
        }))
        authenticatedFetch(`${API}/api/workspace/user-workspaces/${id}`, { method: 'DELETE' }).catch(() => {})
      },

      addItemToWorkspace: (workspaceId, item) => {
        set((state) => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === workspaceId
              ? { ...ws, items: [...ws.items.filter(i => i.id !== item.id), item] }
              : ws
          )
        }))
        const ws = get().workspaces.find(w => w.id === workspaceId)
        if (ws) get().syncToBackend(ws)
      },

      removeItemFromWorkspace: (workspaceId, itemId) => {
        set((state) => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === workspaceId
              ? { ...ws, items: ws.items.filter(i => i.id !== itemId) }
              : ws
          )
        }))
        const ws = get().workspaces.find(w => w.id === workspaceId)
        if (ws) get().syncToBackend(ws)
      },

      pinWorkspace: (id) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === id ? { ...w, isPinned: true } : w)
        }))
      },

      unpinWorkspace: (id) => {
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === id ? { ...w, isPinned: false } : w)
        }))
      },

      setFocusWorkspace: (id) => set({ focusWorkspaceId: id }),

      syncToBackend: async (ws) => {
        try {
          await authenticatedFetch(`${API}/api/workspace/user-workspaces/${ws.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: ws.name, items: ws.items })
          })
        } catch {}
      },
    }),
    { name: 'knemos-workspaces' }
  )
)
