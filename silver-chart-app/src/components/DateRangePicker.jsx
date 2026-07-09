import { useState } from 'react'

const PRESETS = [
  { label: '3M',  value: '3' },
  { label: '6M',  value: '6' },
  { label: '1Y',  value: '12' },
  { label: '2Y',  value: '24' },
  { label: '5Y',  value: '60' },
  { label: 'All', value: 'all' },
  { label: 'Custom', value: 'custom' },
]

export default function DateRangePicker({ dateRange, onChange }) {
  const current = dateRange || { preset: 'all', start: '', end: '' }
  const [showCustom, setShowCustom] = useState(current.preset === 'custom')

  function setPreset(value) {
    setShowCustom(value === 'custom')
    onChange({ ...current, preset: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <button
            key={p.value}
            className="btn"
            style={{
              padding: '4px 10px', fontSize: 12,
              background: current.preset === p.value ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: current.preset === p.value ? '#fff' : 'var(--text-secondary)',
              borderColor: current.preset === p.value ? 'var(--accent)' : 'var(--border)',
            }}
            onClick={() => setPreset(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Start date</label>
            <input
              type="date"
              value={current.start || ''}
              onChange={e => onChange({ ...current, start: e.target.value, preset: 'custom' })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>End date</label>
            <input
              type="date"
              value={current.end || ''}
              onChange={e => onChange({ ...current, end: e.target.value, preset: 'custom' })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
