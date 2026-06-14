import { create } from 'zustand'

export interface WorkspaceItem {
  title: string;
  source: 'browser_tab' | 'window' | 'file' | 'process';
  url?: string;
  path?: string;
}

export interface Workspace {
  id: string;
  name: string;
  item_count: number;
  items: WorkspaceItem[];
  created_at: number;
}

interface WorkspaceStore {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  setWorkspaces: (ws: Workspace[]) => void
  setActive: (id: string) => void
}

export const useWorkspaceStore = create<WorkspaceStore>(set => ({
  workspaces: [],
  activeWorkspaceId: null,
  // Replacing the full workspace list keeps the store aligned with the
  // backend's latest clustering snapshot.
  setWorkspaces: (workspaces) => set({ workspaces }),
  // The selected workspace is tracked separately so UI panels can switch
  // focus without mutating the underlying workspace data.
  setActive: (id) => set({ activeWorkspaceId: id }),
}))
