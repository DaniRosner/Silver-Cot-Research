import { useState, useRef } from 'react'
import { COT_FIELDS, FRED_SERIES } from '../lib/dataSources'
import { CHART_TYPES, COT_GROUP_COLORS, getDefaultColor } from '../lib/chartConfig'
import { newSeriesId } from '../lib/workspace'

const SOURCE_TYPES = [
  { value: 'cot',   label: 'CFTC COT Data' },
  { value: 'yahoo', label: 'Yahoo Finance' },
  { value: 'fred',  label: 'FRED (Fed Data)' },
  { value: 'local', label: 'Local CSV/Excel' },
]

// Group COT fields for the select dropdown
const COT_FIELD_GROUPS = COT_FIELDS.reduce((acc, f) => {
  if (!acc[f.group]) acc[f.group] = []
  acc[f.group].push(f)
  return acc
}, {})

export default function SeriesBuilder({ series, onAdd, onUpdate, onRemove, onRegisterFile, seriesCount }) {
  const [expanded, setExpanded] = useState(null) // seriesId of expanded editor
  const [adding, setAdding] = useState(false)
  const fileInputRef = useRef()
  const [pendingFileSeriesId, setPendingFileSeriesId] = useState(null)
  const [localFields, setLocalFields] = useState({}) // seriesId -> [field names]

  function handleAdd() {
    const id = newSeriesId()
    const newSeries = {
      id,
      label: 'New Series',
      sourceType: 'cot',
      cotField: 'spec_net',
      chartType: 'line',
      color: getDefaultColor(seriesCount),
      visible: true,
      strokeWidth: 1.5,
      dotSize: 0,
    }
    onAdd(newSeries)
    setExpanded(id)
    setAdding(false)
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file || !pendingFileSeriesId) return
    try {
      const fields = await onRegisterFile(pendingFileSeriesId, file)
      setLocalFields(prev => ({ ...prev, [pendingFileSeriesId]: fields }))
      onUpdate(pendingFileSeriesId, { localFileName: file.name })
    } catch (err) {
      alert('File error: ' + err.message)
    }
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {series.map((s, idx) => (
        <SeriesRow
          key={s.id}
          series={s}
          isExpanded={expanded === s.id}
          onToggleExpand={() => setExpanded(expanded === s.id ? null : s.id)}
          onUpdate={(changes) => onUpdate(s.id, changes)}
          onRemove={() => onRemove(s.id)}
          localFields={localFields[s.id] || []}
          onRequestFile={() => {
            setPendingFileSeriesId(s.id)
            fileInputRef.current?.click()
          }}
        />
      ))}

      <button className="btn" style={{ marginTop: 4, justifyContent: 'center' }} onClick={handleAdd}>
        + Add series
      </button>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
      />
    </div>
  )
}

function SeriesRow({ series, isExpanded, onToggleExpand, onUpdate, onRemove, localFields, onRequestFile }) {
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', cursor: 'pointer',
      }} onClick={onToggleExpand}>
        {/* Color dot + visibility toggle */}
        <button
          className="btn-ghost btn-icon"
          style={{ padding: 2 }}
          onClick={e => { e.stopPropagation(); onUpdate({ visible: !series.visible }) }}
          title={series.visible ? 'Hide series' : 'Show series'}
        >
          <span style={{
            width: 12, height: 12, borderRadius: '50%',
            background: series.visible ? series.color : 'var(--border)',
            display: 'block', flexShrink: 0,
            border: '2px solid ' + (series.visible ? series.color : 'var(--border-strong)'),
          }} />
        </button>

        <span style={{
          flex: 1, fontSize: 13, fontWeight: 500,
          color: series.visible ? 'var(--text-primary)' : 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {series.label}
        </span>

        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>
          {series.chartType} · {getSourceTag(series)}
        </span>

        <button className="btn-ghost btn-icon" onClick={e => { e.stopPropagation(); onRemove() }} title="Remove series">
          <span style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1 }}>×</span>
        </button>

        <span style={{ fontSize: 11, color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.15s' }}>▾</span>
      </div>

      {/* Expanded editor */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px 10px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {/* Label */}
          <Field label="Label">
            <input value={series.label} onChange={e => onUpdate({ label: e.target.value })} />
          </Field>

          {/* Source type */}
          <Field label="Data source">
            <select value={series.sourceType} onChange={e => onUpdate({ sourceType: e.target.value })}>
              {SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          {/* Source-specific fields */}
          {series.sourceType === 'cot' && (
            <Field label="COT field">
              <select value={series.cotField} onChange={e => onUpdate({ cotField: e.target.value })}>
                {Object.entries(COT_FIELD_GROUPS).map(([group, fields]) => (
                  <optgroup key={group} label={group}>
                    {fields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
          )}

          {series.sourceType === 'yahoo' && (
            <Field label="Ticker symbol">
              <input
                value={series.ticker || ''}
                placeholder="e.g. SI=F, GLD, AAPL"
                onChange={e => onUpdate({ ticker: e.target.value.toUpperCase() })}
              />
            </Field>
          )}

          {series.sourceType === 'fred' && (
            <>
              <Field label="FRED series">
                <select value={series.fredSeriesId || ''} onChange={e => onUpdate({ fredSeriesId: e.target.value })}>
                  <option value="">— select —</option>
                  {FRED_SERIES.map(s => <option key={s.id} value={s.id}>{s.label} ({s.id})</option>)}
                </select>
              </Field>
              <Field label="Custom series ID (optional)">
                <input
                  value={series.fredCustomId || ''}
                  placeholder="e.g. T10Y3M"
                  onChange={e => onUpdate({ fredSeriesId: e.target.value || series.fredSeriesId })}
                />
              </Field>
            </>
          )}

          {series.sourceType === 'local' && (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn" onClick={onRequestFile} style={{ flex: 1, justifyContent: 'center' }}>
                  {series.localFileName ? `📄 ${series.localFileName}` : 'Upload CSV / Excel'}
                </button>
              </div>
              {localFields.length > 0 && (
                <>
                  <Field label="Date column">
                    <select value={series.localDateField || ''} onChange={e => onUpdate({ localDateField: e.target.value })}>
                      <option value="">— select —</option>
                      {localFields.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="Value column">
                    <select value={series.localValueField || ''} onChange={e => onUpdate({ localValueField: e.target.value })}>
                      <option value="">— select —</option>
                      {localFields.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </Field>
                </>
              )}
            </>
          )}

          {/* Chart type */}
          <Field label="Chart type">
            <div style={{ display: 'flex', gap: 6 }}>
              {CHART_TYPES.map(ct => (
                <button
                  key={ct.value}
                  className="btn"
                  style={{
                    flex: 1, justifyContent: 'center', fontSize: 12,
                    background: series.chartType === ct.value ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: series.chartType === ct.value ? '#fff' : 'var(--text-secondary)',
                    borderColor: series.chartType === ct.value ? 'var(--accent)' : 'var(--border)',
                  }}
                  onClick={() => onUpdate({ chartType: ct.value })}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Color */}
          <Field label="Color">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="color"
                value={series.color}
                onChange={e => onUpdate({ color: e.target.value })}
                style={{ width: 36, height: 32, padding: 2, cursor: 'pointer', flex: 'none' }}
              />
              <input value={series.color} onChange={e => onUpdate({ color: e.target.value })} style={{ flex: 1 }} />
            </div>
          </Field>

          {/* Advanced: stroke width, dot size */}
          <details style={{ fontSize: 12 }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', userSelect: 'none', marginBottom: 8 }}>
              Advanced options
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              <Field label={`Stroke width: ${series.strokeWidth ?? 1.5}`}>
                <input type="range" min="0.5" max="5" step="0.5"
                  value={series.strokeWidth ?? 1.5}
                  onChange={e => onUpdate({ strokeWidth: parseFloat(e.target.value) })} />
              </Field>
              <Field label={`Dot size: ${series.dotSize ?? 0}`}>
                <input type="range" min="0" max="8" step="1"
                  value={series.dotSize ?? 0}
                  onChange={e => onUpdate({ dotSize: parseInt(e.target.value) })} />
              </Field>
              <Field label="Fill opacity (area)">
                <input type="range" min="0" max="1" step="0.05"
                  value={series.fillOpacity ?? 0.1}
                  onChange={e => onUpdate({ fillOpacity: parseFloat(e.target.value) })} />
              </Field>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  )
}

function getSourceTag(series) {
  if (series.sourceType === 'cot') return 'COT'
  if (series.sourceType === 'yahoo') return series.ticker || 'Yahoo'
  if (series.sourceType === 'fred') return series.fredSeriesId || 'FRED'
  if (series.sourceType === 'local') return series.localFileName || 'Local'
  return series.sourceType
}
