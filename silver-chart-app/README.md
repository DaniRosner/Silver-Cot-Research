# COT Research Workbench

A free, open-source tool for interactive financial charting using CFTC Commitments of Traders (COT) data, Yahoo Finance, FRED, and your own local files. Built for researchers, traders, and students studying futures markets.

---

## Table of Contents

1. [What This Tool Does](#what-this-tool-does)
2. [Before You Begin — Prerequisites](#before-you-begin-prerequisites)
3. [Installation](#installation)
4. [Running the App](#running-the-app)
5. [Using the App](#using-the-app)
   - [The Sidebar](#the-sidebar)
   - [Adding a Series](#adding-a-series)
   - [Data Sources](#data-sources)
   - [Chart Types](#chart-types)
   - [Date Range](#date-range)
   - [Layout Modes](#layout-modes)
   - [Downloading Charts](#downloading-charts)
   - [Saving and Sharing Workspaces](#saving-and-sharing-workspaces)
   - [Settings](#settings)
6. [Deploying](#deploying)
7. [Project Structure](#project-structure)
8. [Adding New Data Sources](#adding-new-data-sources)
9. [Stopping the App](#stopping-the-app)
10. [Troubleshooting](#troubleshooting)
11. [Glossary](#glossary)

---

## What This Tool Does

The COT Workbench lets you build custom charts by combining data from multiple sources on the same canvas. You choose what to plot, how to style it, and over what time period — all in an interactive browser-based interface.

**Example use cases:**
- Plot silver speculator net positioning vs. silver price
- Overlay the Fed funds rate on top of COT dollar exposure
- Compare gold and silver prices on one chart
- Upload your own CSV and chart it alongside live market data

The app runs entirely on your own computer. No data is sent anywhere — all fetching happens through a local proxy server that runs alongside the app.

---

## Before You Begin — Prerequisites

You need two free tools installed: **Node.js** and **Python 3**. Python 3 comes pre-installed on Mac. Node.js needs to be installed manually.

### Check if you already have them

Open a Terminal (Mac: press `Cmd + Space`, type "Terminal", press Enter) and run:

```bash
node --version
python3 --version
```

If you see version numbers like `v20.x.x` and `Python 3.x.x`, skip to [Installation](#installation).

### Installing Node.js

1. Go to **https://nodejs.org**
2. Click the large **LTS** button
3. Download and run the installer, clicking through all defaults
4. Close and reopen your Terminal
5. Run `node --version` — you should now see `v20.x.x` or higher

---

## Installation

### Step 1 — Get the code

**Option A — Download the ZIP (simplest)**

Download and unzip the `silver-chart-app` folder from the GitHub releases page and place it somewhere you will remember.

**Option B — Clone from GitHub**

```bash
git clone https://github.com/DaniRosner/Silver-Cot-Research.git
cd Silver-Cot-Research/silver-chart-app
```

### Step 2 — Install dependencies

```bash
cd path/to/silver-chart-app
npm install
```

This downloads all required libraries. Takes about 30 seconds. You only need to do this once (or after updating the app).

---

## Running the App

The app requires **two terminal windows running at the same time**. Both must stay open while you use the app.

### Terminal 1 — Start the proxy server

```bash
cd path/to/silver-chart-app
python3 proxy.py
```

You will see this banner confirming it is running:

```
╔══════════════════════════════════════════════╗
║       COT Workbench — Proxy Server           ║
║   Running on http://localhost:3001            ║
║                                              ║
║   Keep this running alongside npm run dev    ║
║   Press Ctrl+C to stop                       ║
╚══════════════════════════════════════════════╝
```

### Terminal 2 — Start the app

```bash
cd path/to/silver-chart-app
npm run dev
```

Then open **http://localhost:5173** in any browser.

The app will immediately begin fetching Silver COT data from the CFTC website. **This takes 15–30 seconds on first load.** After that the default chart appears.

> Every time you want to use the app, run both `python3 proxy.py` and `npm run dev`.

---

## Using the App

### The Sidebar

The left sidebar has three tabs:

| Tab | What it does |
|---|---|
| **Series** | Add, edit, and remove data series. Set the date range. |
| **Workspaces** | Save, load, export, and import chart configurations. |
| **Settings** | Set your FRED API key and choose dark or light theme. |

Hide or show the sidebar with the **☰** icon in the top left.

---

### Adding a Series

A **series** is one line (or bar, or area) on the chart. You can add as many as you want.

1. Click **+ Add series** at the bottom of the Series tab
2. Click the **▾** arrow to expand the new series card
3. Give it a **Label**, choose a **Data source**, **Chart type**, and **Color**
4. Click anywhere outside the card to collapse it

To **hide** a series without deleting it, click its colored dot. Click again to show it.
To **delete** a series, click the **x** button on its card.

---

### Data Sources

#### CFTC COT Data

Live from cftc.gov. Choose a **COT field** from the dropdown, grouped by participant category:

| Category | Who they are |
|---|---|
| **Managed Money** | Hedge funds, CTAs, algorithmic traders |
| **Hedgers** | Silver miners, refiners, industrial users |
| **Swap Dealers** | Large banks managing client exposure |
| **Other Reportable** | Smaller institutions above the reporting threshold |
| **Non-Reportable** | Retail traders below the reporting threshold |
| **Market** | Total Open Interest |
| **Dollar Exposure** | Any of the above converted to dollar value (Long/Short/Net in $B) |

> COT data is reported weekly (every Tuesday). The app automatically carries each reading forward across intervening days so lines appear continuous.

#### Yahoo Finance

Any ticker available on Yahoo Finance. Examples:

| Ticker | What it is |
|---|---|
| `SI=F` | COMEX Silver front-month futures |
| `GC=F` | COMEX Gold futures |
| `GLD` | SPDR Gold ETF |
| `AAPL` | Apple Inc. |
| `SPY` | S&P 500 ETF |
| `^VIX` | CBOE Volatility Index |
| `DX-Y.NYB` | US Dollar Index |

Data goes back to the year 2000 (or as far back as Yahoo has it for that ticker).

#### FRED (Federal Reserve Economic Data)

Macroeconomic data from the St. Louis Fed. **Requires a free API key** — see [Settings](#settings).

| Series | What it is |
|---|---|
| Fed Funds Rate | The overnight lending rate set by the Fed |
| 10-Year Treasury Yield | Long-term US government bond yield |
| 2-Year Treasury Yield | Short-term US government bond yield |
| 10Y-2Y Yield Spread | The yield curve (negative = inverted) |
| CPI | Consumer Price Index — measures inflation |
| Core CPI | CPI excluding food and energy |
| VIX | Market volatility index |
| Gold Price | London Fix gold price |

You can also enter any FRED series ID directly (e.g. `T10Y3M`). Browse all series at **https://fred.stlouisfed.org**.

#### Local CSV / Excel

Upload any `.csv`, `.xlsx`, or `.xls` file from your computer.

1. Select **Local CSV/Excel** as the source
2. Click **Upload CSV / Excel** and choose your file
3. Select which column contains **dates** and which contains **values**

Date column should be in `YYYY-MM-DD` format (e.g. `2024-01-15`).

---

### Chart Types

| Type | Best for |
|---|---|
| **Line** | Continuous data like prices and net positions |
| **Scatter (dots)** | Weekly COT data emphasizing discrete reporting dates |
| **Bar** | Volume, open interest, or count data |
| **Area** | Line with a filled region underneath |

Adjust **stroke width**, **dot size**, and **fill opacity** under **Advanced options** in each series card.

---

### Date Range

| Button | Shows |
|---|---|
| 3M | Last 3 months |
| 6M | Last 6 months |
| 1Y | Last 1 year |
| 2Y | Last 2 years |
| 5Y | Last 5 years |
| All | Full history of all loaded series |
| Custom | Pick a specific start and end date |

---

### Layout Modes

Toggle between **Overlay** and **Stacked** in the top right.

**Overlay** — all series on one chart. Price/rate series go on the right y-axis automatically; COT series go on the left. Series on the right axis are labeled "(right)" in the legend.

**Stacked** — each series gets its own panel. Best when series have very different scales.

---

### Downloading Charts

Click **Download PNG** in the top right of the chart area to export the current chart as a PNG file.

---

### Saving and Sharing Workspaces

A **workspace** saves your complete chart configuration — all series, settings, date range, and layout mode.

#### Saving to your browser

In the **Workspaces** tab, click **Save**. Workspaces persist in your browser's local storage between sessions.

- **Rename** — click the pencil icon
- **Load** — click the workspace name
- **Delete** — click the x button

#### Exporting and importing as JSON

1. Click **Export** to download the workspace as a `.cot-workspace.json` file
2. Send the file to whoever you want to share it with
3. They click **Import** and select the file

> Workspace files contain configuration only — no data. The recipient's app fetches live data fresh when they load it.

---

### Settings

**Theme** — dark (default) or light.

**FRED API key** — get a free key at **https://fred.stlouisfed.org/docs/api/api_key.html**, paste it here, and click **Save settings**. Stored in your browser only.

**COT data start year** — how far back to fetch CFTC data. Default is 2020. Earlier years give more history but slower load times.

---

## Deploying

To host the app publicly so others can use it without installing anything:

```bash
npm run build
```

This outputs a `/dist` folder. Deploy it to any static host:

- **GitHub Pages** — push `/dist` to your `gh-pages` branch
- **Netlify** — drag and drop the `/dist` folder at netlify.com
- **Vercel** — connect your repo and set the output directory to `dist`

> Note: the proxy server (`proxy.py`) is required for live data fetching and only runs locally. A hosted version of the app would need a separate deployed proxy or a different data fetching strategy.

---

## Project Structure

```
silver-chart-app/
├── proxy.py              # Local proxy server for CFTC, Yahoo, FRED
├── src/
│   ├── lib/
│   │   ├── dataSources.js    # Data fetchers for all sources
│   │   ├── chartConfig.js    # Default workspace, colors, chart types
│   │   ├── workspace.js      # localStorage + JSON export/import
│   │   └── download.js       # PNG export
│   ├── hooks/
│   │   └── useDataEngine.js  # Data fetching, caching, series resolution
│   ├── components/
│   │   ├── SeriesBuilder.jsx
│   │   ├── ChartCanvas.jsx
│   │   ├── DateRangePicker.jsx
│   │   ├── WorkspacePanel.jsx
│   │   └── SettingsPanel.jsx
│   └── App.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## Adding New Data Sources

To add a new source (e.g. LBMA, SHFE):

1. Add a fetcher function to `src/lib/dataSources.js`
2. Add the source type to `SeriesBuilder.jsx`'s `SOURCE_TYPES` array
3. Handle it in `useDataEngine.js`'s `resolveSeries` function

---

## Stopping the App

Press **Ctrl + C** in each terminal window.

---

## Troubleshooting

### "vite: command not found"

Run `npm install` first, then `npm run dev`.

### Orange banner: "Proxy not running"

Open a terminal in the `silver-chart-app` folder and run `python3 proxy.py`.

### "No COT data loaded"

The proxy could not reach cftc.gov. Check your internet connection and that the proxy terminal shows no errors. Click the **↻** reload button in the top right to retry.

### "python: command not found"

Use `python3` instead of `python`:
```bash
python3 proxy.py
```

### Data only shows from 2020 on "All" time range

Update to v7 or later. Earlier versions had a bug where "All" still applied a 2020 start date.

### Chart looks compressed or hard to read

Switch to **Stacked** mode — each series gets its own panel with its own scale.

### Yahoo Finance data does not go back far enough

Yahoo's history varies by ticker. This is a limitation of Yahoo Finance, not the app.

---

## Glossary

**COT (Commitments of Traders)** — A weekly CFTC report showing net long and short positions held by different trader categories in US futures markets.

**CFTC (Commodity Futures Trading Commission)** — The US federal agency that regulates futures markets and publishes the COT report.

**Net position** — Long contracts minus short contracts. Positive = more longs than shorts (bullish). Negative = more shorts than longs (bearish).

**Dollar exposure** — Net position x price x 5,000 oz per contract. Converts contract counts into dollar values for comparability across time.

**Managed Money** — Hedge funds, CTAs, and algorithmic traders. The speculative category — they trade for profit, not to hedge physical exposure.

**Hedgers (Producer/Merchant/Processor/User)** — Miners, refiners, and industrial consumers who use futures to lock in prices for physical silver.

**Swap Dealers** — Large banks acting as intermediaries, managing futures exposure from OTC swaps with clients.

**Non-Reportable** — Traders below the CFTC reporting threshold (~150 contracts for silver). Generally retail traders and small speculators.

**Open Interest** — Total outstanding futures contracts not yet settled. Rising OI with rising price signals a strengthening trend.

**Forward-fill** — Repeating each weekly COT reading across the following days until the next report, creating a continuous line on a daily chart.

**FRED** — Federal Reserve Economic Data. A free database of 800,000+ economic time series from the St. Louis Fed.

**Proxy server** — The local `proxy.py` program that fetches external data on behalf of the browser, bypassing CORS restrictions.

**Workspace** — A saved chart configuration (series, settings, date range, layout). Exportable as JSON and shareable with others.
