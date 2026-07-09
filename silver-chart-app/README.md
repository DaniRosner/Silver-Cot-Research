# COT Research Workbench

A flexible financial charting app for CFTC Commitments of Traders data, Yahoo Finance, FRED, and local files.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Features

- **CFTC COT data** — live fetch from cftc.gov, all 5 participant groups, net/long/short/dollar exposure
- **Yahoo Finance** — any ticker (SI=F, GLD, AAPL, etc.)
- **FRED** — Fed funds rate, yield curve, CPI, VIX, spreads (free API key required)
- **Local CSV/Excel** — upload any .csv, .xlsx, or .xls file
- **Overlay mode** — all series on one chart (auto-normalized when units differ)
- **Stacked mode** — each series in its own panel
- **Download charts** — PNG export of any chart
- **Workspaces** — save/load chart configurations to localStorage, export/import as JSON

## FRED API key

Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html  
Enter it in **Settings** → FRED API key. It's stored in your browser only.

## Deploying

```bash
npm run build       # outputs to /dist
```

Deploy the `/dist` folder to GitHub Pages, Netlify, Vercel, or any static host.

### GitHub Pages

```bash
npm run build
# push /dist to your gh-pages branch, or use the gh-pages package
```

## Project structure

```
src/
  lib/
    dataSources.js    # CFTC, Yahoo Finance, FRED, local file parsers
    chartConfig.js    # default workspace, colors, chart types
    workspace.js      # localStorage + JSON export/import
    download.js       # PNG export
  hooks/
    useDataEngine.js  # data fetching, caching, series resolution
  components/
    SeriesBuilder.jsx # add/edit/remove chart series
    ChartCanvas.jsx   # Recharts chart (overlay + stacked modes)
    DateRangePicker.jsx
    WorkspacePanel.jsx
    SettingsPanel.jsx
  App.jsx             # main layout and state
```

## Adding new data sources

To add a new source (e.g. LBMA, SHFE), add a fetcher function to `src/lib/dataSources.js`, add the source type to `SeriesBuilder.jsx`'s `SOURCE_TYPES` array, and handle it in `useDataEngine.js`'s `resolveSeries` function.
