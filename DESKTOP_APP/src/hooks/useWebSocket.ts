/*
 * useWebSocket.ts
 *
 * Lightweight WebSocket hook used by the desktop app for real-time updates.
 * - Connects to a local backend WS endpoint and routes messages into stores.
 * - Implements reconnect-on-close semantics and a keepalive ping interval.
 *
 * This file contains only connection management; message handling delegates
 * to application stores (workspaces, system). The following comments clarify
 * lifecycle expectations without changing logic.
 */

import { useEffect, useRef } from 'react'
import { useWorkspaceStore } from '../store/workspace.store'
import { useSystemStore } from '../store/system.store'

const WS_URL = 'ws://127.0.0.1:8765/ws'

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const setWorkspaces = useWorkspaceStore(s => s.setWorkspaces)
  const { setRAMStats, setFocusScore } = useSystemStore()

  const connect = () => {
    // Avoid creating a second connection if one is already open.
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WS] Connected to KNEMOS backend')
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
            // keepalive response — used to verify connection health
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
