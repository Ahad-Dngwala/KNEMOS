import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  context?: {
    screenshots?: string[]
    workspaceNames?: string[]
  }
}

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  sendMessage: (text: string) => Promise<void>
  clearChat: () => void
}

const API = 'http://127.0.0.1:8765'

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  addMessage: (msg) => {
    const full: ChatMessage = {
      ...msg,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }
    set((s) => ({ messages: [...s.messages, full] }))
  },

  sendMessage: async (text: string) => {
    const { addMessage } = get()

    // Add user message immediately
    addMessage({ role: 'user', content: text })
    set({ isLoading: true })

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: get().messages.slice(-6) }),
      })

      if (!res.ok) throw new Error('Backend error')
      const data = await res.json()

      addMessage({
        role: 'assistant',
        content: data.reply || 'I could not find an answer.',
        context: data.context,
      })
    } catch {
      addMessage({
        role: 'assistant',
        content: 'I could not connect to the AI backend. Make sure the KnemOS backend is running on port 8765.',
      })
    } finally {
      set({ isLoading: false })
    }
  },

  clearChat: () => set({ messages: [] }),
}))
