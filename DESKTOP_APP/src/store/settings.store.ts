import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AccentColor = 'mint' | 'red' | 'blue' | 'purple' | 'orange'
export type OllamaModel = 'qwen2.5:7b' | 'qwen2.5:3b'

interface AccentDef {
  value: string
  r: number
  g: number
  b: number
}

export const ACCENTS: Record<AccentColor, AccentDef> = {
  mint:   { value: '#00C896', r: 0,   g: 200, b: 150 },
  red:    { value: '#E53935', r: 229, g: 57,  b: 53  },
  blue:   { value: '#1E88E5', r: 30,  g: 136, b: 229 },
  purple: { value: '#8E24AA', r: 142, g: 36,  b: 170 },
  orange: { value: '#FB8C00', r: 251, g: 140, b: 0   },
}

interface SettingsState {
  accent: AccentColor
  model: OllamaModel
  extensionConnected: boolean
  setAccent: (a: AccentColor) => void
  setModel: (m: OllamaModel) => void
  setExtensionConnected: (v: boolean) => void
  applyAccentToDOM: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      accent: 'mint',
      model: 'qwen2.5:7b',
      extensionConnected: false,

      setAccent: (accent) => {
        set({ accent })
        get().applyAccentToDOM()
      },

      setModel: (model) => set({ model }),
      setExtensionConnected: (v) => set({ extensionConnected: v }),

      applyAccentToDOM: () => {
        const { accent } = get()
        const def = ACCENTS[accent]
        const root = document.documentElement
        root.style.setProperty('--accent', def.value)
        root.style.setProperty('--accent-r', String(def.r))
        root.style.setProperty('--accent-g', String(def.g))
        root.style.setProperty('--accent-b', String(def.b))
        root.style.setProperty('--accent-light', `rgba(${def.r},${def.g},${def.b},0.08)`)
        root.style.setProperty('--accent-mid',   `rgba(${def.r},${def.g},${def.b},0.18)`)
      },
    }),
    { name: 'knemos-settings' }
  )
)
