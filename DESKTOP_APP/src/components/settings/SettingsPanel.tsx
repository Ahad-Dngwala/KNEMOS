import { useSettingsStore, ACCENTS, AccentColor, OllamaModel } from '../../store/settings.store'

export const SettingsPanel = () => {
  const { accent, model, setAccent, setModel } = useSettingsStore()

  const handleTestBackend = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8765/api/system/health')
      if (res.ok) alert('Backend connected successfully!')
      else alert('Backend returned an error.')
    } catch {
      alert('Could not connect to backend. Is it running?')
    }
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Title */}
      <div className="section-header">
        <div className="section-title">Settings</div>
        <div className="section-line" />
        <div className="section-subtitle">— Configuration</div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-section-header">Appearance</div>
        
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Accent Color</div>
            <div className="settings-row-desc">Used for active states, highlights, and buttons.</div>
          </div>
          <div className="accent-swatches">
            {(Object.keys(ACCENTS) as AccentColor[]).map((c) => (
              <div
                key={c}
                className={`accent-swatch ${accent === c ? 'active' : ''}`}
                style={{ backgroundColor: ACCENTS[c].value }}
                onClick={() => setAccent(c)}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Dark Mode</div>
            <div className="settings-row-desc">Currently disabled. KnemOS uses a warm-white design language.</div>
          </div>
          <button className="toggle" disabled />
        </div>
      </div>

      {/* AI & Memory */}
      <div className="settings-section">
        <div className="settings-section-header">Local AI Engine</div>
        
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Language Model</div>
            <div className="settings-row-desc">Select the local model used for chat and clustering.</div>
          </div>
          <select 
            className="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value as OllamaModel)}
          >
            <option value="qwen2.5:7b">Qwen 2.5 (7B) — Recommended</option>
            <option value="qwen2.5:3b">Qwen 2.5 (3B) — Faster/Low End</option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Semantic Memory</div>
            <div className="settings-row-desc">Clear local embeddings and workspace memory.</div>
          </div>
          <button className="test-btn" onClick={() => alert('Memory cleared (Simulated)')}>
            Clear Memory
          </button>
        </div>
      </div>

      {/* System & Connectivity */}
      <div className="settings-section">
        <div className="settings-section-header">System & Connectivity</div>
        
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Backend Connection</div>
            <div className="settings-row-desc">Check if the Python backend is running.</div>
          </div>
          <button className="test-btn" onClick={handleTestBackend}>
            Test Connection
          </button>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-row-label">Browser Extension</div>
            <div className="settings-row-desc">Connects to Chrome for tab clustering.</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: 1 }}>
            DISCONNECTED
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-4)', fontSize: 11 }}>
        KnemOS Desktop v1.0.0
        <br />
        Minimal White Theme Engine
      </div>
    </div>
  )
}
