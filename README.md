# Silver COT Research

## Overview
This project analyzes CFTC Commitments of Traders (COT) data for Silver futures 
traded on COMEX to study the positioning dynamics of different market participants 
and their relationship to silver price movements.

## Data Source
**Source:** U.S. Commodity Futures Trading Commission (CFTC)  
**Report:** Disaggregated Futures-Only Report  
**Commodity:** Silver (COMEX), commodity code 084691  
**Frequency:** Weekly (released every Friday, reflecting positions as of Tuesday)  
**Coverage:** September 2009 – present  
**URL:** https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm

Price data is sourced from Yahoo Finance via the `yfinance` library (ticker: `SI=F`).

## How the Data Was Collected
The CFTC publishes annual ZIP files containing the full Disaggregated 
Futures-Only report for each calendar year. This project's pipeline 
automatically downloads and extracts these files for each year, filters 
to Silver (commodity code 084691), and concatenates them into a single 
weekly time series. Price data is fetched from Yahoo Finance and merged 
by nearest date.

## Data Categories
The Disaggregated COT report breaks participants into four categories. 
This project tracks three:

**1. Managed Money (Speculators)**  
Hedge funds, commodity trading advisors (CTAs), and algorithmic traders. 
These participants take positions to profit from price movements rather than 
to hedge underlying exposure. Their net positioning is widely watched as a 
sentiment indicator.

**2. Producer/Merchant/Processor/User (Commercials/Hedgers)**  
Silver miners, refiners, industrial manufacturers, and other entities with 
direct exposure to physical silver. They are typically net short because they 
use futures to lock in prices for silver they will produce or consume in the future.

**3. Swap Dealers**  
Large financial institutions (typically major banks) that act as intermediaries, 
taking the other side of client trades and managing the resulting exposure 
through futures markets. Their positioning reflects both their own book 
management and their clients' hedging needs.

## Population
- **Participants:** Only "reportable" traders — those holding positions above 
  CFTC reporting thresholds. Smaller retail traders are captured in the 
  "Non-Reportable" category, which this project excludes.
- **Contracts:** Standard COMEX Silver futures (5,000 troy ounces per contract). 
  Micro contracts (1,000 oz) are not included in this dataset.
- **Market:** Futures-only (excludes options).

## CME vs. LBMA vs. SHFE
Silver trades globally across three major venues:

| Exchange | Location | Structure | Role |
|----------|----------|-----------|------|
| **COMEX** (CME Group) | New York | Centralized futures exchange | Global price benchmark; highest transparency; COT data publicly available |
| **LBMA** | London | OTC (over-the-counter) | Largest physical silver market; less transparent; primarily spot, forwards, and swaps |
| **SHFE** (Shanghai Futures Exchange) | Shanghai | Centralized futures exchange | Dominant in Asia; volumes adjusted by half when comparing to COMEX (SHFE reports both sides of each trade) |

COMEX is the primary price discovery venue for silver globally and the only 
one that publishes detailed participant positioning data (COT reports), making 
it the natural starting point for this research.

## Files
- `silver_cot.py` — Main pipeline: downloads COT data, merges with price data, 
  exports CSV, and generates charts
- `silver_cot_data.csv` — Generated output (not tracked in Git)
- `silver_cot_chart.png` — Generated chart (not tracked in Git)
