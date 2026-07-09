import { useState } from 'react'
import { loadSettings, saveSettings } from '../lib/workspace'

export default function SettingsPanel({ theme, onThemeChange }) {
  const [settings, setSettings] = useState(loadSettings)
  const [saved, setSaved] = useState(false)

  function update(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label>Theme</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {['dark', 'light'].map(t => (
            <button key={t} className="btn" style={{
              flex: 1, justifyContent: 'center', textTransform: 'capitalize',
              background: theme === t ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: theme === t ? '#fff' : 'var(--text-secondary)',
              borderColor: theme === t ? 'var(--accent)' : 'var(--border)',
            }} onClick={() => onThemeChange(t)}>
              {t === 'dark' ? '🌙 Dark' : '☀ Light'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label>FRED API key</label>
        <input
          type="password"
          value={settings.fredApiKey || ''}
          placeholder="Get a free key at fred.stlouisfed.org"
          onChange={e => update('fredApiKey', e.target.value)}
        />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Required for FRED data (Fed funds rate, CPI, yield curve, etc.)
          Free at <span style={{ color: 'var(--accent)' }}>fred.stlouisfed.org/docs/api/api_key.html</span>
        </p>
      </div>

      <div>
        <label>COT data start year</label>
        <input
          type="number"
          value={settings.cotStartYear || 2020}
          min="2010"
          max={new Date().getFullYear()}
          onChange={e => update('cotStartYear', parseInt(e.target.value))}
        />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Earlier years = more data but slower load. Data goes back to 2010.
        </p>
      </div>

      <button
        className="btn btn-primary"
        style={{ justifyContent: 'center' }}
        onClick={handleSave}
      >
        {saved ? '✓ Saved' : 'Save settings'}
      </button>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Data sources:</strong><br />
          CFTC COT — cftc.gov (public)<br />
          Yahoo Finance — via CORS proxy<br />
          FRED — requires free API key<br />
          Local CSV/Excel — stays in your browser
        </p>
      </div>
    </div>
  )
}
