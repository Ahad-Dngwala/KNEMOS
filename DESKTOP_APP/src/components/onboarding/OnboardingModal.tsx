import { useState } from 'react'

interface Props {
  onComplete: () => void
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to KNEMOS',
    subtitle: 'A semantic operating layer for your work',
    content: `KNEMOS understands your workflow, organizes your open apps and tabs into meaningful categories, and lets you query your entire work history with a local AI.

Everything runs on your machine. No cloud. No data leaving your system.`,
    symbol: '○',
  },
  {
    id: 'prerequisites',
    title: 'System Prerequisites',
    subtitle: 'Python & Wolfram Engine',
    content: `KNEMOS runs locally, so you'll need the right engines installed on your machine to power the system:

1. **Python 3.10+**: Required to run the local intelligence server.
2. **Wolfram Engine**: Required for advanced semantic analytics and timeline graph resolution.

Make sure both are installed and added to your system PATH.`,
    symbol: '+',
  },
  {
    id: 'ai',
    title: 'Setup Local AI',
    subtitle: 'Qwen2.5 — fully offline',
    content: `KNEMOS uses Qwen2.5 running locally via Ollama for all AI features. No API keys needed, no cloud required.

Install Ollama from ollama.com, then run:`,
    code: 'ollama pull qwen2.5:7b',
    codeNote: 'For low-end systems: ollama pull qwen2.5:3b',
    symbol: '—',
  },
  {
    id: 'extension',
    title: 'Chrome Extension',
    subtitle: 'Tab intelligence',
    content: `The KNEMOS Chrome extension sends your open tabs to the backend in real time — powering tab detection, semantic search, and AI chat context.

To install:
1. Open Chrome and go to chrome://extensions/
2. Enable Developer Mode (top right)
3. Click "Load unpacked"
4. Select the EXTENSION/ folder`,
    symbol: '□',
  },
  {
    id: 'done',
    title: "You're ready",
    subtitle: 'KNEMOS is configured',
    content: `You can now:
- See open apps, tabs, and browsers organized automatically
- Create workspaces to group related items
- Use Deep Focus to minimize distractions
- Chat with your local AI about your work history

You can access this guide anytime from Settings.`,
    symbol: '◇',
  },
]

export const OnboardingModal = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
    }}>
      <div style={{
        background: 'var(--bg)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--r-lg)',
        padding: '48px',
        maxWidth: 520,
        width: '90%',
        position: 'relative',
      }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? 'var(--ink)' : 'var(--border)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Symbol */}
        <div style={{
          fontSize: 40,
          fontWeight: 100,
          color: 'var(--ink-4)',
          marginBottom: 16,
          fontFamily: 'var(--font)',
        }}>
          {current.symbol}
        </div>

        {/* Title */}
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 8 }}>
          {current.subtitle}
        </div>
        <div style={{ fontSize: 26, fontWeight: 100, letterSpacing: -0.5, marginBottom: 20 }}>
          {current.title}
        </div>

        {/* Content */}
        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: 20 }}>
          {current.content}
        </div>

        {/* Code block */}
        {current.code && (
          <div style={{ marginBottom: 8 }}>
            <div style={{
              background: 'var(--ink)',
              color: 'var(--bg)',
              padding: '12px 16px',
              borderRadius: 'var(--r-sm)',
              fontSize: 12,
              fontFamily: 'monospace',
              letterSpacing: 0.5,
            }}>
              {current.code}
            </div>
            {current.codeNote && (
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6 }}>
                {current.codeNote}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, alignItems: 'center' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                fontSize: 11,
                cursor: 'pointer',
                color: 'var(--ink-3)',
              }}
            >
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {isLast ? (
            <button
              onClick={onComplete}
              style={{
                padding: '12px 32px',
                background: 'var(--ink)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Start KNEMOS
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              style={{
                padding: '12px 32px',
                background: 'var(--ink)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          )}
        </div>

        {/* Skip */}
        {!isLast && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              onClick={onComplete}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 11,
                color: 'var(--ink-4)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Skip setup
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
