import { useEffect, useRef } from 'react'
import { useWorkspaceStore } from '../store/workspace.store'
import { useSystemStore } from '../store/system.store'

const WS_URL = 'ws://127.0.0.1:8765/ws'

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const setWorkspaces = useWorkspaceStore(s => s.setWorkspaces)
  const { setRAMStats, setFocusScore } = useSystemStore()

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WS] Connected to KnemOS backend')
    }

    ws.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data)
        switch (msg.type) {
          case 'workspace_update':
            setWorkspaces(msg.workspaces)
            break
          case 'ram_update':
            setRAMStats(msg.stats)
            break
          case 'focus_score_update':
            setFocusScore(msg.score)
            break
          case 'pong':
            // keepalive response
            break
        }
      } catch (e) {
        console.error('[WS] Error parsing message:', e)
      }
    }

    ws.onclose = () => {
      console.log('[WS] Disconnected  reconnecting in 3s')
      setTimeout(connect, 3000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }

  useEffect(() => {
    connect()
    
    // Setup ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping')
      }
    }, 30000)

    return () => {
      clearInterval(pingInterval)
      wsRef.current?.close()
    }
  }, [])
}
