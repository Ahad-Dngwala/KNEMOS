import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../../store/chat.store'

const SUGGESTIONS = [
  'What was I working on this morning?',
  'Which tabs were open during my last session?',
  'Show me files I accessed today',
  'What workspace had the most activity?',
]

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export const ChatPanel = () => {
  const { messages, isLoading, sendMessage } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage(text)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="section-header" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            ○ — AI Assistant
          </span>
          <div className="section-line" />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>
          Ask about your workspace, screenshots, tabs, and files.
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {/* Welcome state */}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 40, fontWeight: 100, color: 'var(--ink-4)', marginBottom: 16 }}>○</div>
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--ink-2)', marginBottom: 8 }}>
              KnemOS AI Assistant
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Ask anything about your workspace history, open tabs, files, or screenshots.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="chat-message-avatar">
              {msg.role === 'user' ? 'U' : '○'}
            </div>
            <div>
              <div className="chat-bubble">
                {msg.content}
              </div>
              <div className="chat-bubble-time">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="chat-message assistant">
            <div className="chat-message-avatar">○</div>
            <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="spinner" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (shown when empty) */}
      {messages.length === 0 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="chat-suggestion-btn"
              onClick={() => { setInput(s); sendMessage(s) }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-context-chips">
          <span className="chat-chip">○ Screenshots</span>
          <span className="chat-chip">+ Tabs</span>
          <span className="chat-chip">— Files</span>
          <span className="chat-chip">□ Workspaces</span>
        </div>
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            placeholder="Ask about your workspace..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={isLoading}>
            +
          </button>
        </div>
      </div>
    </div>
  )
}
