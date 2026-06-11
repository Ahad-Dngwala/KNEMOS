import { create } from 'zustand'

export interface RAMStats {
  total_gb: number;
  used_gb: number;
  available_gb: number;
  percent: number;
  saved_gb: number;
}

export interface FocusScore {
  score: number;
  grade: 'A' | 'B' | 'C';
  focus_minutes: number;
  context_switches: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface SystemStore {
  ramStats: RAMStats | null
  focusScore: FocusScore | null
  deepWorkActive: boolean
  setRAMStats: (s: RAMStats | null) => void
  setFocusScore: (s: FocusScore | null) => void
  setDeepWork: (v: boolean) => void
}

export const useSystemStore = create<SystemStore>(set => ({
  ramStats: null,
  focusScore: null,
  deepWorkActive: false,
  setRAMStats: (ramStats) => set({ ramStats }),
  setFocusScore: (focusScore) => set({ focusScore }),
  setDeepWork: (deepWorkActive) => set({ deepWorkActive }),
}))
