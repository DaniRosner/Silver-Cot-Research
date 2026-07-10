# COT Research Workbench — Documentation

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
6. [Stopping the App](#stopping-the-app)
7. [Troubleshooting](#troubleshooting)
8. [Glossary](#glossary)

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

You need two free tools installed before you can run the app: **Node.js** and **Python 3**. Python 3 comes pre-installed on Mac. Node.js needs to be installed manually.

### Check if you already have them

Open a Terminal (Mac: press `Cmd + Space`, type "Terminal", press Enter) and run these two commands:

```bash
node --version
python3 --version
```

If you see version numbers like `v20.x.x` and `Python 3.x.x`, you are ready. Skip to [Installation](#installation).

If you see an error for `node`, follow the steps below.

### Installing Node.js

1. Go to **https://nodejs.org**
2. Click the large **LTS** button (stands for Long Term Support — the stable version)
3. Download and run the installer
4. Click through all the default options
5. When it finishes, **close and reopen your Terminal**
6. Run `node --version` — you should now see `v20.x.x` or higher

---

## Installation

### Step 1 — Get the code

**Option A — Download the ZIP (simplest)**

Download the `silver-chart-app` ZIP file from the GitHub releases page, unzip it, and place the `silver-chart-app` folder somewhere you will remember (e.g. your Desktop or Documents folder).

**Option B — Clone from GitHub**

If you have Git installed:

```bash
git clone https://github.com/DaniRosner/Silver-Cot-Research.git
cd Silver-Cot-Research/silver-chart-app
```

### Step 2 — Install dependencies

Open a Terminal, navigate to the `silver-chart-app` folder, and run:

```bash
cd path/to/silver-chart-app
npm install
```

Replace `path/to/silver-chart-app` with the actual path to the folder. For example:
- Mac: `cd ~/Desktop/silver-chart-app`
- If you cloned the repo: `cd ~/Silver-Cot-Research/silver-chart-app`

This downloads all the libraries the app needs. It takes about 30 seconds and prints a lot of text — that is normal. You only need to do this once (or whenever you update the app).

---

## Running the App

The app requires **two terminal windows running at the same time** — one for the proxy server, one for the app itself. Both need to stay open while you use the app.

### Terminal 1 — Start the proxy server

```bash
cd path/to/silver-chart-app
python3 proxy.py
```

You will see a banner like this confirming it is running:

```
╔══════════════════════════════════════════════╗
║       COT Workbench — Proxy Server           ║
║   Running on http://localhost:3001            ║
║                                              ║
║   Keep this running alongside npm run dev    ║
║   Press Ctrl+C to stop                       ║
╚══════════════════════════════════════════════╝
```

Leave this terminal open and do not type anything else in it.

### Terminal 2 — Start the app

Open a **second** terminal window and run:

```bash
cd path/to/silver-chart-app
npm run dev
```

You will see output like:

```
  VITE v4.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

### Step 3 — Open in your browser

Go to **http://localhost:5173** in any browser (Chrome, Firefox, Safari, and Edge all work).

The app will load and immediately begin fetching Silver COT data from the CFTC website. **This takes 15–30 seconds on the first load** — you will see a loading spinner with a status message. After that the default chart appears.

> **Every time you want to use the app**, you need to run both `python3 proxy.py` and `npm run dev`. See [Stopping the App](#stopping-the-app) for how to shut down cleanly.

---

## Using the App

### The Sidebar

The left sidebar has three tabs:

| Tab | What it does |
|---|---|
| **Series** | Add, edit, and remove data series. Set the date range. |
| **Workspaces** | Save, load, export, and import chart configurations. |
| **Settings** | Set your FRED API key and choose dark or light theme. |

You can hide the sidebar by clicking the **☰** menu icon in the top left.

---

### Adding a Series

A **series** is one line (or bar, or area) on the chart. You can have as many as you want.

1. Click **+ Add series** at the bottom of the Series tab
2. A new series card appears — click the **▾** arrow to expand it
3. Give it a **Label** (the name that appears in the legend)
4. Choose a **Data source** (see [Data Sources](#data-sources) below)
5. Choose a **Chart type** (line, scatter, bar, or area)
6. Pick a **Color** using the color picker or by typing a hex code
7. Click anywhere outside the card to collapse it

To **hide a series** without deleting it, click the colored dot on the left of the series card. Click it again to show it.

To **delete a series**, click the **x** button on the right of the series card.

---

### Data Sources

#### CFTC COT Data

The CFTC Disaggregated Commitments of Traders report for COMEX Silver, fetched live from cftc.gov.

After selecting **CFTC COT Data** as your source, choose a **COT field** from the dropdown. Fields are grouped by participant category:

| Category | Who they are | Example fields |
|---|---|---|
| **Managed Money** | Hedge funds, CTAs, algorithmic traders | Net, Longs, Shorts |
| **Hedgers** | Silver miners, refiners, industrial users | Net, Longs, Shorts |
| **Swap Dealers** | Large banks managing client exposure | Net, Longs, Shorts |
| **Other Reportable** | Smaller institutions above the reporting threshold | Net, Longs, Shorts |
| **Non-Reportable** | Retail traders below the reporting threshold | Net, Longs, Shorts |
| **Market** | Overall market | Total Open Interest |
| **Dollar Exposure** | Any of the above converted to dollar value | Long/Short/Net in $B |

> COT data is reported **weekly** (every Tuesday). The app automatically carries each reading forward across the intervening days so lines appear continuous on the chart.

#### Yahoo Finance

Any ticker symbol available on Yahoo Finance — stocks, ETFs, commodities, indices, and currencies.

After selecting **Yahoo Finance**, type a **ticker symbol** in the field. Examples:

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

Macroeconomic data from the St. Louis Federal Reserve. **Requires a free API key** — see [Settings](#settings).

After selecting **FRED**, choose a series from the dropdown:

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

You can also type any FRED series ID directly into the **Custom series ID** field if you know it (e.g. `T10Y3M` for the 10Y-3M spread). Browse all available series at **https://fred.stlouisfed.org**.

#### Local CSV / Excel

Upload any `.csv`, `.xlsx`, or `.xls` file from your computer.

1. Select **Local CSV/Excel** as the source
2. Click **Upload CSV / Excel** and choose your file
3. Once uploaded, select which column contains **dates** and which contains **values**

The date column should contain dates in `YYYY-MM-DD` format (e.g. `2024-01-15`). Other common formats may also work.

---

### Chart Types

Each series can be displayed as a different chart type:

| Type | Best for |
|---|---|
| **Line** | Continuous data like prices and net positions |
| **Scatter (dots)** | Weekly COT data where you want to emphasize the discrete reporting dates |
| **Bar** | Volume, open interest, or other count data |
| **Area** | Same as line but with a filled region underneath |

You can also adjust **stroke width**, **dot size**, and **fill opacity** under **Advanced options** at the bottom of each series card.

---

### Date Range

Use the date range buttons at the top of the Series tab to zoom in or out:

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

Use the **Overlay** and **Stacked** buttons in the top right to switch between two chart layouts.

**Overlay** — all series on a single chart. Series with small positive values (prices, rates) are automatically placed on the right y-axis. COT contract and dollar exposure series go on the left y-axis. Series labeled "(right)" in the legend use the right axis.

**Stacked** — each series gets its own panel, stacked vertically. Useful when series have very different scales and you want to see each one clearly without compression.

---

### Downloading Charts

Click **Download PNG** in the top right of the chart area to save the current chart as a PNG image file. The filename will match your workspace name.

---

### Saving and Sharing Workspaces

A **workspace** is the complete configuration of your chart — all series, their settings, the date range, and the layout mode. Workspaces let you save your work and come back to it later, or share a chart configuration with someone else.

#### Saving to your browser

Click the **Workspaces** tab, then click **Save**. Your workspace is saved to your browser's local storage and will persist between sessions on the same computer.

To **rename** a workspace, click the pencil icon next to it in the list.

To **load** a saved workspace, click its name in the list.

To **delete** a workspace, click the x button next to it.

#### Exporting and importing as JSON

To share a workspace with someone else or back it up:

1. Click **Export** to download the current workspace as a `.cot-workspace.json` file
2. Send that file to whoever you want to share it with
3. They click **Import** in their Workspaces tab and select the file
4. The workspace loads exactly as you configured it

> Workspace files contain your chart configuration only — not the actual data. The recipient's app will fetch the live data fresh when they load it.

---

### Settings

Click the **Settings** tab to configure:

**Theme** — toggle between dark mode (default) and light mode.

**FRED API key** — required to use FRED data. Get a free key in under a minute:
1. Go to **https://fred.stlouisfed.org/docs/api/api_key.html**
2. Create a free account
3. Copy your API key and paste it into the Settings field
4. Click **Save settings**

Your API key is stored in your browser only and never sent anywhere except directly to the FRED API.

**COT data start year** — controls how far back the CFTC data is fetched. The default is 2020. Setting it earlier (e.g. 2010) gives more history but makes the initial load slower.

---

## Stopping the App

To stop the app, go to each terminal window and press **Ctrl + C**.

---

## Troubleshooting

### "vite: command not found" when running npm run dev

You have not run `npm install` yet, or you replaced the folder with a new version without reinstalling. Run:

```bash
npm install
npm run dev
```

### Orange warning banner: "Proxy not running"

The proxy server is not running. Open a terminal, navigate to the `silver-chart-app` folder, and run:

```bash
python3 proxy.py
```

The banner will disappear automatically once the proxy is detected.

### "No COT data loaded" error

This means the proxy could not reach cftc.gov. Check that:
1. The proxy terminal shows no errors
2. You have an internet connection
3. You are not behind a firewall that blocks cftc.gov

Try clicking the reload button in the top right of the app.

### Data only shows from 2020 even though I selected "All"

Make sure you are on v7 or later. Earlier versions had a bug where the "All" preset still applied a 2020 start date filter. Update to the latest version from GitHub.

### "python: command not found" when starting the proxy

Use `python3` instead of `python`:

```bash
python3 proxy.py
```

### The chart looks compressed or hard to read

Try switching to **Stacked** mode using the button in the top right. Each series will get its own panel with its own y-axis scale.

### Yahoo Finance data does not go back far enough

Yahoo Finance's available history varies by ticker. Most major US stocks go back to the late 1990s or early 2000s. Some ETFs and newer tickers will have shorter histories. This is a limitation of Yahoo Finance, not the app.

---

## Glossary

**COT (Commitments of Traders)** — A weekly report published by the CFTC showing the net long and short positions held by different categories of traders in US futures markets.

**CFTC (Commodity Futures Trading Commission)** — The US federal agency that regulates futures and options markets and publishes the COT report.

**Net position** — Long contracts minus short contracts. A positive number means a group holds more longs than shorts (bullish bias). A negative number means more shorts than longs (bearish bias).

**Dollar exposure** — Net position x current price x 5,000 oz per contract. Converts contract counts into dollar values for comparability across time periods and between groups.

**Managed Money** — Hedge funds, commodity trading advisors (CTAs), and algorithmic traders. Generally considered the speculative category — they trade for profit rather than to hedge commercial risk.

**Hedgers (Producer/Merchant/Processor/User)** — Silver miners, refiners, jewelers, and industrial consumers who use futures to lock in prices for physical silver they will produce or consume.

**Swap Dealers** — Large financial institutions (typically banks) that act as intermediaries, managing the futures exposure arising from over-the-counter swaps with clients.

**Non-Reportable** — Traders whose positions are below the CFTC reporting threshold (approximately 150 contracts for silver). Generally considered to represent retail traders and small speculators.

**Open Interest** — The total number of outstanding futures contracts that have not been settled. Rising open interest alongside rising prices generally signals a strengthening trend.

**Forward-fill** — A technique for handling weekly data displayed on a daily chart. Each weekly reading is repeated across the following days until the next weekly report arrives, creating a continuous line.

**FRED (Federal Reserve Economic Data)** — A free database of over 800,000 economic time series maintained by the Federal Reserve Bank of St. Louis. Available at fred.stlouisfed.org.

**Proxy server** — A small local program (proxy.py) that runs on your computer and fetches data from external websites on behalf of the app. Necessary because web browsers block direct requests to external APIs (a security restriction called CORS).

**Workspace** — A saved configuration of your chart, including all series, their data sources and styling, the date range, and the layout mode. Can be exported as a JSON file and shared with others.
