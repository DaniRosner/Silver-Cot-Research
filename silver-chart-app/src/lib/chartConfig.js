export const SERIES_COLORS = [
  '#58a6ff', // blue
  '#e05c00', // orange
  '#2a9d2a', // green
  '#8b00ff', // purple
  '#2a9d8f', // teal
  '#d4a017', // gold
  '#f85149', // red
  '#e87ba4', // pink
  '#1baf7a', // aqua
  '#eda100', // amber
]

export const CHART_TYPES = [
  { value: 'line',    label: 'Line' },
  { value: 'scatter', label: 'Scatter (dots)' },
  { value: 'bar',     label: 'Bar' },
  { value: 'area',    label: 'Area' },
]

export const COT_GROUP_COLORS = {
  'Managed Money':    '#e05c00',
  'Hedgers':         '#0a5c91',
  'Swap Dealers':    '#8b00ff',
  'Other Reportable':'#d4a017',
  'Non-Reportable':  '#2a9d8f',
  'Market':          '#888',
  'Dollar Exposure': '#58a6ff',
  'Price':           '#2a9d2a',
}

export function getDefaultColor(index) {
  return SERIES_COLORS[index % SERIES_COLORS.length]
}

export const DEFAULT_DATE_RANGES = [
  { label: 'Last 3 months', months: 3 },
  { label: 'Last 6 months', months: 6 },
  { label: 'Last 1 year',   months: 12 },
  { label: 'Last 2 years',  months: 24 },
  { label: 'Last 5 years',  months: 60 },
  { label: 'All data',      months: null },
  { label: 'Custom',        months: 'custom' },
]

// Default workspace — Silver COT net positioning
export function defaultWorkspace() {
  return {
    id: 'ws_default',
    name: 'Silver COT — Net Positioning',
    createdAt: new Date().toISOString(),
    layoutMode: 'overlay',   // 'overlay' | 'stacked'
    dateRange: { preset: 'all', start: '2020-01-01', end: null },
    series: [
      {
        id: 's_spec',
        label: 'Managed Money Net',
        sourceType: 'cot',
        cotField: 'spec_net',
        chartType: 'line',
        color: '#e05c00',
        visible: true,
        strokeWidth: 1.5,
        dotSize: 0,
      },
      {
        id: 's_hedge',
        label: 'Hedgers Net',
        sourceType: 'cot',
        cotField: 'hedger_net',
        chartType: 'line',
        color: '#0a5c91',
        visible: true,
        strokeWidth: 1.5,
        dotSize: 0,
      },
      {
        id: 's_swap',
        label: 'Swap Dealers Net',
        sourceType: 'cot',
        cotField: 'swap_net',
        chartType: 'line',
        color: '#8b00ff',
        visible: true,
        strokeWidth: 1.5,
        dotSize: 0,
      },
      {
        id: 's_price',
        label: 'Silver Price',
        sourceType: 'yahoo',
        ticker: 'SI=F',
        chartType: 'line',
        color: '#2a9d2a',
        visible: true,
        strokeWidth: 1.5,
        dotSize: 0,
      },
    ],
  }
}
