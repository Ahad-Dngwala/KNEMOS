/**
 * DependencySetupOverlay.tsx
 *
 * First-run overlay that guides the user through checking and installing
 * the required dependencies for KNEMOS. Shows once, then saves to localStorage.
 * Does NOT touch any backend logic. Purely informational + download links.
 */

import { useState } from 'react'
import { open } from '@tauri-apps/plugin-shell'

interface Dependency {
  id: string
  name: string
  description: string
  required: boolean
  checkLabel: string
  downloadUrl: string
  installNote: string
}

const DEPS: Dependency[] = [
  {
    id: 'vcpp',
    name: 'Microsoft Visual C++ Redistributable',
    description: 'Required for the KNEMOS AI engine (backend.exe) to run on Windows.',
    required: true,
    checkLabel: 'VC++ Redistributable is already installed',
    downloadUrl: 'https://aka.ms/vs/17/release/vc_redist.x64.exe',
    installNote: 'Run the downloaded .exe and follow the installer. Restart KNEMOS after.',
  },
  {
    id: 'python',
    name: 'Python 3.10+',
    description: 'Only needed if you want to run the backend in developer mode (not required for normal users).',
    required: false,
    checkLabel: 'Python is already installed (or I am not a developer)',
    downloadUrl: 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe',
    installNote: 'Run the installer and check "Add Python to PATH" before installing.',
  },
  {
    id: 'ollama',
    name: 'Ollama (Local LLM)',
    description: 'Powers the AI Memory Assistant chat feature. Without it, the chat will be disabled.',
    required: false,
    checkLabel: 'Ollama is already installed',
    downloadUrl: 'https://ollama.com/download/windows',
    installNote: 'After installing Ollama, open a terminal and run: ollama pull qwen2.5:3b',
  },
  {
    id: 'wolfram',
    name: 'Wolfram Engine (Free License)',
    description: 'Powers the Focus Score analytics. Without it, analytics fall back to Python mode.',
    required: false,
    checkLabel: 'Wolfram Engine is already installed',
    downloadUrl: 'https://www.wolfram.com/engine/',
    installNote: 'Download the free license, install it, and follow the activation steps.',
  },
  {
    id: 'tesseract',
    name: 'Tesseract OCR',
    description: 'Enables "Memory Lane" — reading text from your screenshots. Without it, screenshots are taken but not indexed.',
    required: false,
    checkLabel: 'Tesseract is already installed',
    downloadUrl: 'https://github.com/UB-Mannheim/tesseract/wiki',
    installNote: 'Download and install the Windows binary. Ensure it is added to your PATH.',
  },
]

export const DependencySetupOverlay = ({ onDone }: { onDone: () => void }) => {
  // Track which deps the user has confirmed are already installed
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [downloading, setDownloading] = useState<string | null>(null)
  const [step, setStep] = useState<'intro' | 'checklist' | 'done'>('intro')

  const handleToggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleDownload = async (dep: Dependency) => {
    setDownloading(dep.id)
    try {
      await open(dep.downloadUrl)
    } catch {}
    setTimeout(() => setDownloading(null), 2000)
  }

  const handleFinish = () => {
    localStorage.setItem('knemos-dep-setup-done', 'true')
    onDone()
  }

  const requiredUnchecked = DEPS.filter(d => d.required && !checked[d.id])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999999,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease-out',
      fontFamily: 'var(--font-sans, system-ui)',
    }}>
      <div style={{
        background: 'var(--bg-panel, #fff)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        width: '100%', maxWidth: 580,
        maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 0',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 20,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
            KNEMOS · First Run Setup
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-0.5px' }}>
            {step === 'intro' ? 'Welcome to KNEMOS 👋' : 'Check Your Dependencies'}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.6, marginBottom: 0 }}>
            {step === 'intro'
              ? 'Before we begin, let\'s make sure your system has everything KNEMOS needs to work perfectly. This takes about 2 minutes.'
              : 'Check the box if something is already installed, or click Download to get it. Required items must be installed — optional ones unlock extra features.'}
          </p>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 28px', flex: 1, scrollbarWidth: 'thin' }}>
          {step === 'intro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '🧠', label: 'AI Memory Lane', desc: 'Screenshots + OCR to search your past work' },
                { icon: '🔒', label: '100% Local & Private', desc: 'Nothing leaves your computer — ever' },
                { icon: '🎯', label: 'Deep Focus Mode', desc: 'Force-close distractions while you work' },
                { icon: '📊', label: 'Focus Analytics', desc: 'Wolfram-powered cognitive scoring' },
              ].map(f => (
                <div key={f.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--bg-secondary, rgba(0,0,0,0.03))',
                  border: '1px solid var(--border)',
                  borderRadius: 10, padding: '12px 16px',
                }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 'checklist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DEPS.map(dep => (
                <div key={dep.id} style={{
                  border: `1px solid ${dep.required ? 'rgba(var(--accent-rgb, 99,102,241), 0.3)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '14px 16px',
                  background: checked[dep.id] ? 'rgba(34,197,94,0.05)' : 'var(--bg-panel)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{dep.name}</span>
                        {dep.required && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, background: 'var(--accent)', color: '#fff',
                            padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5,
                          }}>REQUIRED</span>
                        )}
                        {!dep.required && (
                          <span style={{
                            fontSize: 9, fontWeight: 600, border: '1px solid var(--border)', color: 'var(--ink-3)',
                            padding: '2px 6px', borderRadius: 4, letterSpacing: 0.5,
                          }}>OPTIONAL</span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>{dep.description}</p>

                      {!checked[dep.id] && (
                        <div style={{
                          marginTop: 10, fontSize: 10, color: 'var(--ink-4)',
                          background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)',
                          borderRadius: 6, padding: '6px 10px', lineHeight: 1.6,
                        }}>
                          📌 {dep.installNote}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                      {!checked[dep.id] && (
                        <button
                          onClick={() => handleDownload(dep)}
                          disabled={downloading === dep.id}
                          style={{
                            background: 'var(--accent)', color: '#fff', border: 'none',
                            borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', whiteSpace: 'nowrap', opacity: downloading === dep.id ? 0.7 : 1,
                          }}
                        >
                          {downloading === dep.id ? 'Opening...' : '↓ Download'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Already installed checkbox */}
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
                    cursor: 'pointer', fontSize: 11, color: 'var(--ink-3)',
                  }}>
                    <input
                      type="checkbox"
                      checked={!!checked[dep.id]}
                      onChange={() => handleToggle(dep.id)}
                      style={{ width: 14, height: 14, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    {dep.checkLabel}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {step === 'intro' ? (
            <>
              <button
                onClick={handleFinish}
                style={{
                  background: 'none', border: 'none', color: 'var(--ink-4)',
                  fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Skip setup
              </button>
              <button
                className="organize-btn"
                onClick={() => setStep('checklist')}
                style={{ fontSize: 13, padding: '10px 24px' }}
              >
                Get Started →
              </button>
            </>
          ) : (
            <>
              {requiredUnchecked.length > 0 ? (
                <p style={{ fontSize: 11, color: '#f59e0b', margin: 0, maxWidth: 280 }}>
                  ⚠️ <strong>{requiredUnchecked.map(d => d.name.split(' ')[0]).join(', ')}</strong> must be installed for KNEMOS to work.
                </p>
              ) : (
                <p style={{ fontSize: 11, color: '#22c55e', margin: 0 }}>
                  ✓ All required dependencies are ready!
                </p>
              )}
              <button
                className="organize-btn"
                onClick={handleFinish}
                style={{ fontSize: 13, padding: '10px 24px' }}
              >
                {requiredUnchecked.length > 0 ? 'Continue Anyway' : 'Launch KNEMOS →'}
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}
