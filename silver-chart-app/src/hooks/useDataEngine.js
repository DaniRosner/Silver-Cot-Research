import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCOT, fetchYahooFinance, fetchFRED, parseLocalFile, mergeCOTWithPrice } from '../lib/dataSources'
import { loadSettings } from '../lib/workspace'

const cache = { // cleared on each page reload — no persistence
  cot: null,
  yahoo: new Map(),
  fred: new Map(),
}

export function useDataEngine(workspace) {
  const [cotData, setCotData] = useState(null)
  const [seriesData, setSeriesData] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState(null)
  const localFilesRef = useRef({})

  const onProgress = useCallback(msg => setLoadingMsg(msg), [])

  const ensureCOT = useCallback(async () => {
    if (cache.cot) return cache.cot
    onProgress('Loading CFTC COT data…')
    const rows = await fetchCOT({ onProgress })
    cache.cot = rows
    return rows
  }, [onProgress])

  const resolveSeries = useCallback(async (series, cotRows) => {
    if (series.sourceType === 'cot') {
      if (!cotRows) return []
      return cotRows
        .filter(r => r[series.cotField] != null)
        .map(r => ({ date: r.date, value: r[series.cotField] }))
    }

    if (series.sourceType === 'yahoo') {
      const cacheKey = series.ticker
      if (cache.yahoo.has(cacheKey)) return cache.yahoo.get(cacheKey)
      const { rows } = await fetchYahooFinance(series.ticker, '2015-01-01', null, onProgress)
      cache.yahoo.set(cacheKey, rows)
      return rows
    }

    if (series.sourceType === 'fred') {
      const settings = loadSettings()
      const apiKey = settings.fredApiKey
      const cacheKey = series.fredSeriesId
      if (cache.fred.has(cacheKey)) return cache.fred.get(cacheKey)
      const { rows } = await fetchFRED(series.fredSeriesId, apiKey, '2015-01-01', null, onProgress)
      cache.fred.set(cacheKey, rows)
      return rows
    }

    if (series.sourceType === 'local') {
      const rows = localFilesRef.current[series.id]
      if (!rows) return []
      const dateField  = series.localDateField
      const valueField = series.localValueField
      return rows
        .map(r => ({ date: String(r[dateField]).slice(0, 10), value: Number(r[valueField]) }))
        .filter(r => r.date && !isNaN(r.value))
    }

    return []
  }, [onProgress])

  const loadAll = useCallback(async () => {
    if (!workspace?.series?.length) return
    setLoading(true)
    setError(null)

    try {
      const needsCOT   = workspace.series.some(s => s.sourceType === 'cot')
      const needsPrice = workspace.series.some(s =>
        s.sourceType === 'cot' && s.cotField?.includes('exposure')
      )
      let cotRows = null

      if (needsCOT) {
        const rawCot = await ensureCOT()
        if (needsPrice) {
          const priceKey = 'SI=F'
          let priceRows
          if (cache.yahoo.has(priceKey)) {
            priceRows = cache.yahoo.get(priceKey)
          } else {
            const r = await fetchYahooFinance('SI=F', '2015-01-01', null, onProgress)
            priceRows = r.rows
            cache.yahoo.set(priceKey, priceRows)
          }
          cotRows = mergeCOTWithPrice(rawCot, priceRows)
        } else {
          cotRows = rawCot
        }
      }

      const results = {}
      for (const s of workspace.series) {
        if (!s.visible) continue
        try {
          results[s.id] = await resolveSeries(s, cotRows)
        } catch (e) {
          console.warn(`Series ${s.label} failed:`, e.message)
          results[s.id] = []
        }
      }
      setSeriesData(results)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }, [workspace, ensureCOT, resolveSeries, onProgress])

  useEffect(() => { loadAll() }, [loadAll])

  const registerLocalFile = useCallback(async (seriesId, file) => {
    const { rows, fields } = await parseLocalFile(file)
    localFilesRef.current[seriesId] = rows
    return fields
  }, [])

  const invalidateSeries = useCallback((seriesId) => {
    setSeriesData(prev => {
      const next = { ...prev }
      delete next[seriesId]
      return next
    })
  }, [])

  const mergedData = buildMergedData(workspace?.series || [], seriesData, workspace?.dateRange)

  return {
    mergedData,
    seriesData,
    loading,
    loadingMsg,
    error,
    reload: loadAll,
    registerLocalFile,
    invalidateSeries,
  }
}

// ── BUILD MERGED DATA ─────────────────────────────────────────────────────────
function buildMergedData(series, seriesData, dateRange) {
  const dateMap = new Map()
  const visibleSeries = series.filter(s => s.visible && seriesData[s.id]?.length)

  // Populate date map with all data points from all series
  for (const s of visibleSeries) {
    const rows = seriesData[s.id] || []
    for (const row of rows) {
      if (!dateMap.has(row.date)) dateMap.set(row.date, { date: row.date })
      dateMap.get(row.date)[s.id] = row.value
    }
  }

  let data = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // ── FORWARD-FILL ──────────────────────────────────────────────────────────
  // COT data is weekly (Tuesdays only). Price data is daily.
  // Carry each weekly COT reading forward across the 6 intervening days
  // until the next report — exactly what merge_asof does in the Python pipeline.
  const cotSeriesIds = visibleSeries
    .filter(s => s.sourceType === 'cot')
    .map(s => s.id)

  if (cotSeriesIds.length > 0) {
    const lastSeen = {}
    for (const row of data) {
      for (const sid of cotSeriesIds) {
        if (row[sid] != null) {
          lastSeen[sid] = row[sid]       // new weekly reading
        } else if (lastSeen[sid] != null) {
          row[sid] = lastSeen[sid]       // carry last known value forward
        }
      }
    }
  }

  // ── DATE RANGE FILTER ─────────────────────────────────────────────────────
  if (dateRange) {
    const { start, end, preset } = dateRange
    if (preset !== 'all' && preset !== 'custom') {
      const months = parseInt(preset)
      if (!isNaN(months)) {
        const cutoff = new Date()
        cutoff.setMonth(cutoff.getMonth() - months)
        const cutoffStr = cutoff.toISOString().split('T')[0]
        data = data.filter(r => r.date >= cutoffStr)
      }
    } else {
      if (start) data = data.filter(r => r.date >= start)
      if (end)   data = data.filter(r => r.date <= end)
    }
  }

  return data
}
