import { useEffect, useRef, useCallback } from 'react'
import { useWorkspaceStore } from '../store/workspace.store'
import { useSystemStore } from '../store/system.store'
import { useCategoriesStore } from '../store/categories.store'
import { useAuthStore } from '../store/auth.store'
import { useWSStore } from '../store/ws.store'


export const useStableWebSocket = (isEnabled: boolean = true, port: number = 8765) => {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isConnectingRef = useRef(false)
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { fetchToken } = useAuthStore(s => s)
  const { setWs, setIsConnected, flushOutbox } = useWSStore(s => s)

  const setWorkspaces = useWorkspaceStore(s => s.setWorkspaces)
  const { setRAMStats, setFocusScore } = useSystemStore(s => s)
  const { handleIncomingCategories } = useCategoriesStore(s => s)

  const connect = useCallback(async () => {
    if (!isEnabled) return
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) return
    
    // Ensure we have a token before connecting
    let currentToken = useAuthStore.getState().token
    if (!currentToken) {
      await fetchToken()
      currentToken = useAuthStore.getState().token
    }

    isConnectingRef.current = true
    const wsBaseUrl = `ws://127.0.0.1:${port}/ws`
    const url = currentToken ? `${wsBaseUrl}?token=${currentToken}` : wsBaseUrl
    const ws = new WebSocket(url)
    wsRef.current = ws
    setWs(ws)

    ws.onopen = () => {
      console.log('[WS] Connected to KNEMOS backend')
      isConnectingRef.current = false
      setIsConnected(true)
      
      // Flush outbox queue
      flushOutbox()
      
      // Keep-alive pings
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping')
        }
      }, 30000)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        switch (msg.type) {
          case 'workspace_update':
            if (msg.workspaces) setWorkspaces(msg.workspaces)
            break
          case 'ram_update':
            if (msg.stats) setRAMStats(msg.stats)
            break
          case 'focus_score_update':
            if (msg.score !== undefined) setFocusScore(msg.score)
            break
          case 'categories_update':
            if (msg.categories) {
              handleIncomingCategories(msg.categories)
            }
            break
          case 'pong':
            break
        }
      } catch (e) {
        console.error('[WS] Message parsing error:', e)
      }
    }

    ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting...')
      isConnectingRef.current = false
      setIsConnected(false)
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      
      // Exponential backoff or simple delay
      if (isEnabled) {
        reconnectTimerRef.current = setTimeout(connect, 5000)
      }
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [isEnabled, port, setWorkspaces, setRAMStats, setFocusScore, handleIncomingCategories, setWs, setIsConnected, flushOutbox, fetchToken])

  useEffect(() => {
    if (isEnabled) connect()

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current)
      
      isConnectingRef.current = false // CRITICAL: Reset connecting state on unmount for StrictMode compatibility
      
      if (wsRef.current) {
        wsRef.current.onclose = null // prevent reconnect logic on unmount
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect, isEnabled])
}
