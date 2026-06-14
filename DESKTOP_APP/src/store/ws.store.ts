import { create } from 'zustand'

interface WSState {
  ws: WebSocket | null
  isConnected: boolean
  outbox: any[]
  setWs: (ws: WebSocket | null) => void
  setIsConnected: (connected: boolean) => void
  send: (payload: any) => void
  flushOutbox: () => void
}

/**
 * ws.store.ts
 *
 * Centralized WebSocket state store using `zustand`.
 * - Holds the active `WebSocket` instance (if any), a connectivity flag, and
 *   an `outbox` for messages queued while disconnected.
 * - `send` will queue messages when the connection is not open; `flushOutbox`
 *   will attempt to transmit queued messages when connectivity is restored.
 *
 * Only comments were added to clarify behavior — the runtime logic is unchanged.
 */
export const useWSStore = create<WSState>((set, get) => ({
  ws: null,
  isConnected: false,
  outbox: [],
  
  setWs: (ws) => set({ ws }),
  setIsConnected: (isConnected) => set({ isConnected }),
  
  send: (payload) => {
    const { ws, isConnected, outbox } = get()
    
    if (ws && isConnected && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload))
    } else {
      // Queue it: when the socket is not open we preserve the payload in
      // `outbox` so it can be flushed later. This is a simple at-most-once
      // local queue; duplicate-detection and persistence are intentionally
      // out of scope for this store.
      set({ outbox: [...outbox, payload] })
      console.log('[WS] Disconnected. Queued message:', payload)
    }
  },
  
  flushOutbox: () => {
    const { ws, isConnected, outbox } = get()
    if (ws && isConnected && ws.readyState === WebSocket.OPEN && outbox.length > 0) {
      // Attempt to send all queued messages in FIFO order. This is a best-effort
      // flush — failures during send will not re-queue messages in the current
      // implementation (keeps logic simple and predictable).
      console.log(`[WS] Flushing ${outbox.length} queued messages...`)
      outbox.forEach(payload => {
        ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload))
      })
      set({ outbox: [] })
    }
  }
}))
