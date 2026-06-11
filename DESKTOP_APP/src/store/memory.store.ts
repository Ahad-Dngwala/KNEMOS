import { create } from 'zustand'

export interface MemoryResultData {
  id: string;
  text_preview: string;
  timestamp: number;
  screenshot_path: string;
  similarity: number;
}

interface MemoryStore {
  query: string
  setQuery: (q: string) => void
}

export const useMemoryStore = create<MemoryStore>(set => ({
  query: '',
  setQuery: (query) => set({ query }),
}))
