import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const SILVER_CODE = 84
const SILVER_MARKET = 'SILVER - COMMODITY EXCHANGE INC.'
const PROXY = 'http://localhost:3001'

export const COT_FIELDS = [
  { key: 'spec_net',    label: 'Managed Money — Net',        group: 'Managed Money' },
  { key: 'M_Money_Positions_Long_All',  label: 'Managed Money — Longs',  group: 'Managed Money' },
  { key: 'M_Money_Positions_Short_All', label: 'Managed Money — Shorts', group: 'Managed Money' },
  { key: 'hedger_net',  label: 'Hedgers (Prod/Merch) — Net', group: 'Hedgers' },
  { key: 'Prod_Merc_Positions_Long_All',  label: 'Hedgers — Longs',  group: 'Hedgers' },
  { key: 'Prod_Merc_Positions_Short_All', label: 'Hedgers — Shorts', group: 'Hedgers' },
  { key: 'swap_net',    label: 'Swap Dealers — Net',          group: 'Swap Dealers' },
  { key: 'Swap_Positions_Long_All',    label: 'Swap Dealers — Longs',  group: 'Swap Dealers' },
  { key: 'Swap__Positions_Short_All',  label: 'Swap Dealers — Shorts', group: 'Swap Dealers' },
  { key: 'other_net',   label: 'Other Reportable — Net',      group: 'Other Reportable' },
  { key: 'Other_Rept_Positions_Long_All',  label: 'Other Reportable — Longs',  group: 'Other Reportable' },
  { key: 'Other_Rept_Positions_Short_All', label: 'Other Reportable — Shorts', group: 'Other Reportable' },
  { key: 'nonrept_net', label: 'Non-Reportable — Net',        group: 'Non-Reportable' },
  { key: 'NonRept_Positions_Long_All',  label: 'Non-Reportable — Longs',  group: 'Non-Reportable' },
  { key: 'NonRept_Positions_Short_All', label: 'Non-Reportable — Shorts', group: 'Non-Reportable' },
  { key: 'Open_Interest_All', label: 'Total Open Interest', group: 'Market' },
  { key: 'spec_long_exposure',   label: 'Managed Money — Long Exposure ($B)',  group: 'Dollar Exposure' },
  { key: 'spec_short_exposure',  label: 'Managed Money — Short Exposure ($B)', group: 'Dollar Exposure' },
  { key: 'spec_net_exposure',    label: 'Managed Money — Net Exposure ($B)',   group: 'Dollar Exposure' },
  { key: 'hedge_long_exposure',  label: 'Hedgers — Long Exposure ($B)',        group: 'Dollar Exposure' },
  { key: 'hedge_short_exposure', label: 'Hedgers — Short Exposure ($B)',       group: 'Dollar Exposure' },
  { key: 'hedge_net_exposure',   label: 'Hedgers — Net Exposure ($B)',         group: 'Dollar Exposure' },
  { key: 'swap_long_exposure',   label: 'Swap Dealers — Long Exposure ($B)',   group: 'Dollar Exposure' },
  { key: 'swap_short_exposure',  label: 'Swap Dealers — Short Exposure ($B)',  group: 'Dollar Exposure' },
  { key: 'swap_net_exposure',    label: 'Swap Dealers — Net Exposure ($B)',    group: 'Dollar Exposure' },
  { key: 'other_long_exposure',  label: 'Other Reportable — Long Exposure ($B)',  group: 'Dollar Exposure' },
  { key: 'other_short_exposure', label: 'Other Reportable — Short Exposure ($B)', group: 'Dollar Exposure' },
  { key: 'other_net_exposure',   label: 'Other Reportable — Net Exposure ($B)',   group: 'Dollar Exposure' },
  { key: 'nonrept_long_exposure',  label: 'Non-Reportable — Long Exposure ($B)',  group: 'Dollar Exposure' },
  { key: 'nonrept_short_exposure', label: 'Non-Reportable — Short Exposure ($B)', group: 'Dollar Exposure' },
  { key: 'nonrept_net_exposure',   label: 'Non-Reportable — Net Exposure ($B)',   group: 'Dollar Exposure' },
  { key: 'price', label: 'Silver Price (USD)', group: 'Price' },
]

export async function checkProxy() {
  try {
    const res = await fetch(`${PROXY}/health`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch { return false }
}

async function fetchCotYear(year, commodity, marketName, onProgress) {
  onProgress?.(`Downloading ${year} COT data…`)
  const url = `${PROXY}/cot?year=${year}&commodity=${commodity}&market=${encodeURIComponent(marketName)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`COT ${year}: ${res.status}`)
  const text = await res.text()
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true, skipEmptyLines: true,
      complete: ({ data }) => resolve(data),
      error: reject,
    })
  })
}

export async function fetchCOT({ commodity = SILVER_CODE, marketName = SILVER_MARKET, startYear, endYear, onProgress } = {}) {
  const currentYear = new Date().getFullYear()
  const start = startYear ?? 2020
  const end   = endYear   ?? currentYear

  const frames = []
  for (let yr = start; yr <= end; yr++) {
    try {
      const rows = await fetchCotYear(yr, commodity, marketName, onProgress)
      frames.push(...rows)
    } catch (e) { console.warn(`COT ${yr} failed:`, e.message) }
  }

  if (frames.length === 0) throw new Error('No COT data loaded — is the proxy running? (python3 proxy.py)')

  const rows = frames.map(r => {
    const date = r['Report_Date_as_YYYY-MM-DD']
    const sl = Number(r['M_Money_Positions_Long_All'])
    const ss = Number(r['M_Money_Positions_Short_All'])
    const hl = Number(r['Prod_Merc_Positions_Long_All'])
    const hs = Number(r['Prod_Merc_Positions_Short_All'])
    const wl = Number(r['Swap_Positions_Long_All'])
    const ws = Number(r['Swap__Positions_Short_All'])
    const ol = Number(r['Other_Rept_Positions_Long_All'])
    const os = Number(r['Other_Rept_Positions_Short_All'])
    const nl = Number(r['NonRept_Positions_Long_All'])
    const ns = Number(r['NonRept_Positions_Short_All'])
    return {
      date,
      spec_net: sl - ss, hedger_net: hl - hs, swap_net: wl - ws,
      other_net: ol - os, nonrept_net: nl - ns,
      M_Money_Positions_Long_All: sl, M_Money_Positions_Short_All: ss,
      Prod_Merc_Positions_Long_All: hl, Prod_Merc_Positions_Short_All: hs,
      Swap_Positions_Long_All: wl, Swap__Positions_Short_All: ws,
      Other_Rept_Positions_Long_All: ol, Other_Rept_Positions_Short_All: os,
      NonRept_Positions_Long_All: nl, NonRept_Positions_Short_All: ns,
      Open_Interest_All: Number(r['Open_Interest_All']),
    }
  }).filter(r => r.date).sort((a, b) => a.date.localeCompare(b.date))

  const seen = new Set()
  const deduped = rows.filter(r => { if (seen.has(r.date)) return false; seen.add(r.date); return true })
  onProgress?.('COT data ready')
  return deduped
}

// Yahoo Finance — fetch full history going back to 2000
export async function fetchYahooFinance(ticker, startDate, endDate, onProgress) {
  onProgress?.(`Fetching ${ticker} from Yahoo Finance…`)
  const start = Math.floor(new Date(startDate || '2000-01-01').getTime() / 1000)
  const end   = Math.floor(new Date(endDate   || new Date()).getTime()   / 1000)
  const url   = `${PROXY}/yahoo?ticker=${encodeURIComponent(ticker)}&start=${start}&end=${end}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Yahoo Finance failed for ${ticker}: ${res.status}`)
  const json = await res.json()

  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`No Yahoo Finance data for ${ticker}`)

  const timestamps = result.timestamp
  const closes     = result.indicators.quote[0].close

  const rows = timestamps
    .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().split('T')[0], value: closes[i] }))
    .filter(r => r.value != null)

  onProgress?.(`${ticker} loaded`)
  return { rows, field: 'value', label: ticker }
}

export const FRED_SERIES = [
  { id: 'DFF',      label: 'Fed Funds Rate (daily)' },
  { id: 'GS10',     label: '10-Year Treasury Yield' },
  { id: 'GS2',      label: '2-Year Treasury Yield' },
  { id: 'T10Y2Y',   label: '10Y-2Y Yield Spread' },
  { id: 'CPIAUCSL', label: 'CPI (Urban Consumers)' },
  { id: 'CPILFESL', label: 'Core CPI (ex Food & Energy)' },
  { id: 'DEXUSEU',  label: 'USD/EUR Exchange Rate' },
  { id: 'DEXJPUS',  label: 'JPY/USD Exchange Rate' },
  { id: 'BAMLH0A0HYM2', label: 'High Yield Spread (OAS)' },
  { id: 'VIXCLS',   label: 'VIX (CBOE Volatility Index)' },
  { id: 'GOLDAMGBD228NLBM', label: 'Gold Price (London Fix)' },
]

export async function fetchFRED(seriesId, apiKey, startDate, endDate, onProgress) {
  if (!apiKey) throw new Error('FRED API key required. Add it in Settings.')
  onProgress?.(`Fetching ${seriesId} from FRED…`)
  const start = startDate || '2000-01-01'
  const end   = endDate   || new Date().toISOString().split('T')[0]
  const url   = `${PROXY}/fred?series_id=${seriesId}&api_key=${apiKey}&start=${start}&end=${end}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`FRED fetch failed: ${res.status}`)
  const json = await res.json()
  if (json.error_message) throw new Error(`FRED: ${json.error_message}`)

  const rows = (json.observations || [])
    .filter(o => o.value !== '.')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))

  const meta = FRED_SERIES.find(s => s.id === seriesId)
  onProgress?.(`${seriesId} loaded`)
  return { rows, field: 'value', label: meta?.label || seriesId }
}

export async function parseLocalFile(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true, skipEmptyLines: true, dynamicTyping: true,
        complete: ({ data, meta }) => resolve({ rows: data, fields: meta.fields }),
        error: reject,
      })
    })
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buf  = await file.arrayBuffer()
    const wb   = XLSX.read(buf)
    const ws   = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws)
    return { rows, fields: rows.length > 0 ? Object.keys(rows[0]) : [] }
  }
  throw new Error('Unsupported file type. Use .csv, .xlsx, or .xls')
}

export function mergeCOTWithPrice(cotRows, priceRows) {
  if (!priceRows?.length) return cotRows
  const priceMap   = new Map(priceRows.map(r => [r.date, r.value]))
  const priceDates = priceRows.map(r => r.date).sort()

  function nearestPrice(date) {
    if (priceMap.has(date)) return priceMap.get(date)
    let best = null, bestDiff = Infinity
    for (const d of priceDates) {
      const diff = Math.abs(new Date(d) - new Date(date))
      if (diff < bestDiff) { bestDiff = diff; best = d }
    }
    return best ? priceMap.get(best) : null
  }

  const OZ = 5000
  return cotRows.map(row => {
    const p = nearestPrice(row.date)
    if (!p) return { ...row, price: null }
    return {
      ...row, price: p,
      spec_long_exposure:     row.M_Money_Positions_Long_All     * p * OZ / 1e9,
      spec_short_exposure:    row.M_Money_Positions_Short_All    * p * OZ / 1e9,
      spec_net_exposure:      row.spec_net                       * p * OZ / 1e9,
      hedge_long_exposure:    row.Prod_Merc_Positions_Long_All   * p * OZ / 1e9,
      hedge_short_exposure:   row.Prod_Merc_Positions_Short_All  * p * OZ / 1e9,
      hedge_net_exposure:     row.hedger_net                     * p * OZ / 1e9,
      swap_long_exposure:     row.Swap_Positions_Long_All        * p * OZ / 1e9,
      swap_short_exposure:    row.Swap__Positions_Short_All      * p * OZ / 1e9,
      swap_net_exposure:      row.swap_net                       * p * OZ / 1e9,
      other_long_exposure:    row.Other_Rept_Positions_Long_All  * p * OZ / 1e9,
      other_short_exposure:   row.Other_Rept_Positions_Short_All * p * OZ / 1e9,
      other_net_exposure:     row.other_net                      * p * OZ / 1e9,
      nonrept_long_exposure:  row.NonRept_Positions_Long_All     * p * OZ / 1e9,
      nonrept_short_exposure: row.NonRept_Positions_Short_All    * p * OZ / 1e9,
      nonrept_net_exposure:   row.nonrept_net                    * p * OZ / 1e9,
    }
  })
}
