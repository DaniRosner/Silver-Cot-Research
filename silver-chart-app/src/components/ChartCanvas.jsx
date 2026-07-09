import { useRef, useMemo, useState } from 'react'
import {
  ComposedChart,
  Line, Bar, Area, Scatter,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { downloadChartAsPNG } from '../lib/download'

const CHART_ID = 'cot-chart-canvas'

export default function ChartCanvas({ mergedData, series, layoutMode, workspaceName }) {
  const visibleSeries = series.filter(s => s.visible)

  if (!mergedData?.length) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', fontSize: 14, flexDirection: 'column', gap: 12,
      }}>
        <span style={{ fontSize: 32, opacity: 0.3 }}>📊</span>
        <span>No data to display — add a series from the sidebar</span>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} id={CHART_ID}>
      <div style={{ padding: '10px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{workspaceName}</span>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => downloadChartAsPNG(CHART_ID, `${workspaceName.replace(/\s+/g, '_')}.png`)}
        >
          ⬇ Download PNG
        </button>
      </div>

      {layoutMode === 'overlay'
        ? <OverlayChart data={mergedData} series={visibleSeries} />
        : <StackedChart data={mergedData} series={visibleSeries} />
      }
    </div>
  )
}

// ── AXIS ASSIGNMENT ───────────────────────────────────────────────────────────
// Assigns each series to left or right axis based on its data magnitude.
// Price-like series (small numbers, always positive) go right.
// COT contract series (large numbers, can be negative) go left.
function assignAxes(series, data) {
  // Compute the median absolute value for each series
  function medianAbs(sid) {
    const vals = data.map(r => r[sid]).filter(v => v != null && !isNaN(v))
    if (!vals.length) return 0
    const sorted = vals.map(Math.abs).sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
  }

  // Heuristic: if median abs value < 1000 AND all values positive → likely a price → right axis
  // Everything else → left axis
  return series.map(s => {
    const med = medianAbs(s.id)
    const vals = data.map(r => r[s.id]).filter(v => v != null)
    const allPositive = vals.every(v => v >= 0)
    const isPrice = med < 5000 && allPositive && s.sourceType !== "cot"
    return { ...s, yAxisId: isPrice ? 'right' : 'left' }
  })
}

// ── OVERLAY CHART ─────────────────────────────────────────────────────────────
function OverlayChart({ data, series }) {
  const assignedSeries = useMemo(() => assignAxes(series, data), [series, data])

  const hasLeft  = assignedSeries.some(s => s.yAxisId === 'left')
  const hasRight = assignedSeries.some(s => s.yAxisId === 'right')

  return (
    <div style={{ flex: 1, padding: '8px 0', minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: hasRight ? 70 : 20, bottom: 50, left: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            interval="preserveStartEnd"
            tickFormatter={formatDate}
            angle={-35}
            textAnchor="end"
            height={55}
          />

          {/* Left axis — COT contracts, dollar exposure, etc. */}
          {hasLeft && (
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              tickFormatter={formatNum}
              width={68}
            />
          )}

          {/* Right axis — price series */}
          {hasRight && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              tickFormatter={formatNum}
              width={68}
            />
          )}

          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend series={assignedSeries} />} />
          <ReferenceLine yAxisId={hasLeft ? 'left' : 'right'} y={0} stroke="var(--border-strong)" strokeDasharray="4 4" />

          {assignedSeries.map(s => renderSeries(s))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── STACKED CHART ─────────────────────────────────────────────────────────────
function StackedChart({ data, series }) {
  const panelHeight = Math.max(200, Math.floor(680 / Math.max(series.length, 1)))

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
      {series.map(s => (
        <div key={s.id} style={{ height: panelHeight, paddingBottom: 16 }}>
          <div style={{ padding: '0 16px 4px', fontSize: 12, fontWeight: 500, color: s.color }}>
            {s.label}
          </div>
          <ResponsiveContainer width="100%" height={panelHeight - 28}>
            <ComposedChart data={data} margin={{ top: 4, right: 20, bottom: 44, left: 68 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                interval="preserveStartEnd"
                tickFormatter={formatDate}
                angle={-30}
                textAnchor="end"
                height={48}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                tickFormatter={formatNum}
                width={64}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="var(--border-strong)" strokeDasharray="4 4" />
              {renderSeries({ ...s, yAxisId: undefined })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}

// ── SERIES RENDERER ───────────────────────────────────────────────────────────
function renderSeries(s) {
  const base = {
    key: s.id,
    dataKey: s.id,
    name: s.label,
    stroke: s.color,
    fill: s.color,
    strokeWidth: s.strokeWidth ?? 1.5,
    connectNulls: true,
    isAnimationActive: false,
    yAxisId: s.yAxisId,
  }

  const dotProps = s.dotSize > 0
    ? { dot: { r: s.dotSize, fill: s.color, strokeWidth: 0 }, activeDot: { r: s.dotSize + 2 } }
    : { dot: false, activeDot: { r: 4 } }

  if (s.chartType === 'bar') {
    return <Bar key={s.id} dataKey={s.id} name={s.label} fill={s.color}
      yAxisId={s.yAxisId} opacity={0.75} isAnimationActive={false} />
  }
  if (s.chartType === 'area') {
    return <Area {...base} {...dotProps} type="monotone" fillOpacity={s.fillOpacity ?? 0.12} />
  }
  if (s.chartType === 'scatter') {
    return <Line {...base} type="monotone" strokeWidth={0}
      dot={{ r: s.dotSize || 4, fill: s.color, strokeWidth: 0 }}
      activeDot={{ r: (s.dotSize || 4) + 2 }}
    />
  }
  // default: line
  return <Line {...base} {...dotProps} type="monotone" />
}

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="tooltip">
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
        {label}
      </div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{p.name}</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500, color: p.color }}>
            {formatNum(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── CUSTOM LEGEND ─────────────────────────────────────────────────────────────
function CustomLegend({ series }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'center', padding: '8px 0 0' }}>
      {series.map(s => (
        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <span style={{
            width: s.chartType === 'scatter' ? 8 : 16,
            height: s.chartType === 'scatter' ? 8 : 3,
            borderRadius: s.chartType === 'scatter' ? '50%' : 2,
            background: s.color, flexShrink: 0,
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            {s.label}
            {s.yAxisId === 'right' && <span style={{ color: 'var(--text-muted)', fontSize: 10 }}> (right)</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return ''
  return d.slice(0, 7)
}

function formatNum(v) {
  if (v == null || isNaN(v)) return ''
  const abs = Math.abs(v)
  if (abs >= 1e9) return (v / 1e9).toFixed(1) + 'B'
  if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  if (abs < 10)   return v.toFixed(2)
  return Math.round(v).toLocaleString()
}
