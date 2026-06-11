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
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActive: (id) => set({ activeWorkspaceId: id }),
}))
