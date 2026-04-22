"""
Silver COT Analysis
--------------------
Downloads CFTC Disaggregated COT data for Silver (COMEX, code 084691),
extracts Managed Money (speculators) vs Commercial (hedgers) net positions,
fetches Silver spot price via Yahoo Finance, and plots them side-by-side.

Requirements:
    pip install pandas requests yfinance matplotlib
"""

import io
import os
import zipfile
import requests
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import yfinance as yf
from datetime import datetime
from matplotlib.backends.backend_pdf import PdfPages

# ── CONFIG ──────────────────────────────────────────────────────────────────
SILVER_CODE  = 84          # COMEX Silver contract code
START_YEAR   = 2020              # First year to pull
END_YEAR     = datetime.now().year
PRICE_TICKER = "SI=F"           # Yahoo Finance: Silver front-month futures

# CFTC column names we care about (Disaggregated Futures-Only report)
COLS = {
    "date"             : "Report_Date_as_YYYY-MM-DD",
    "speculator_long"  : "M_Money_Positions_Long_All",
    "speculator_short" : "M_Money_Positions_Short_All",
    "commercial_long"  : "Prod_Merc_Positions_Long_All",
    "commercial_short" : "Prod_Merc_Positions_Short_All",
    "swap_long"        : "Swap_Positions_Long_All",
    "swap_short"       : "Swap__Positions_Short_All",
    "open_int"         : "Open_Interest_All",
    "code"             : "CFTC_Commodity_Code",
    "market_name" : "Market_and_Exchange_Names",
}

# ── DOWNLOAD & PARSE COT DATA:  ────────────────────────────────────────────────
# Download every year, filter to Silver only, stack it all together, calculate net positions, and return a clean table
def fetch_cot_year(year: int) -> pd.DataFrame:
    url = f"https://www.cftc.gov/files/dea/history/fut_disagg_txt_{year}.zip"
    print(f"  Downloading {year}...", end=" ")
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        # The zip contains one .txt (CSV) file
        name = [n for n in z.namelist() if n.endswith(".txt")][0]
        with z.open(name) as f:
            df = pd.read_csv(f, low_memory=False)
    print(f"rows={len(df):,}")
    return df

def load_silver_cot(start_year: int, end_year: int) -> pd.DataFrame:
    frames = []
    for yr in range(start_year, end_year + 1):
        try:
            df = fetch_cot_year(yr)
            silver = df[
                (df[COLS["code"]] == SILVER_CODE) & 
                (df[COLS["market_name"]] == "SILVER - COMMODITY EXCHANGE INC.")
            ].copy()
            frames.append(silver)
        except Exception as e:
            print(f"  Warning: could not load {yr}: {e}")

    cot = pd.concat(frames, ignore_index=True)
    cot[COLS["date"]] = pd.to_datetime(cot[COLS["date"]])
    cot = cot.sort_values(COLS["date"]).drop_duplicates(COLS["date"])

    # Derived columns
    cot["spec_net"]  = cot[COLS["speculator_long"]]  - cot[COLS["speculator_short"]]
    cot["hedger_net"]= cot[COLS["commercial_long"]]  - cot[COLS["commercial_short"]]
    cot["swap_net"]  = cot[COLS["swap_long"]]        - cot[COLS["swap_short"]]
    cot["date"]      = cot[COLS["date"]]

    return cot[["date", "spec_net", "hedger_net", "swap_net",
            COLS["speculator_long"], COLS["speculator_short"],
            COLS["commercial_long"], COLS["commercial_short"],
            COLS["swap_long"], COLS["swap_short"],
            COLS["open_int"]]]

# ── FETCH SILVER PRICE──────────────────────────────────────────────────────
# Download Silver's price history from Yahoo Finance and return it as a clean two-column table of date and price
def fetch_silver_price(start: str, end: str) -> pd.DataFrame:
    print("Fetching silver price from Yahoo Finance...")
    price = yf.download(PRICE_TICKER, start=start, end=end, auto_adjust=True, progress=False)
    price = price[["Close"]].rename(columns={"Close": "price"})
    price.index = pd.to_datetime(price.index)
    return price

# ── PLOT ─────────────────────────────────────────────────────────────────────
def plot_main(cot: pd.DataFrame, price: pd.DataFrame) -> plt.Figure:
    fig, axes = plt.subplots(3, 1, figsize=(14, 14), sharex=True)
    fig.suptitle("Silver (COMEX): Speculators vs Hedgers vs Price", fontsize=15, fontweight="bold")

    colors = {"spec": "#e05c00", "hedge": "#0a5c91", "price": "#2a9d2a", "swap": "#8b00ff"}

    # ── Panel 1: Silver Price ────────────────────────────────────────────────
    ax1 = axes[0]
    ax1.plot(price.index, price["price"], color=colors["price"], linewidth=1.5)
    ax1.set_ylabel("Silver Price (USD)", fontsize=10)
    ax1.set_title("Silver Spot Price", fontsize=11)
    ax1.grid(True, alpha=0.3)
    ax1.fill_between(price.index, price["price"].squeeze(), alpha=0.1, color=colors["price"])

    # ── Panel 2: Net Positions (Speculators vs Hedgers vs Swap Dealers) ──────────────────────
    ax2 = axes[1]
    ax2.plot(cot["date"], cot["spec_net"],   color=colors["spec"],  linewidth=1.5, label="Managed Money (Speculators) Net")
    ax2.plot(cot["date"], cot["hedger_net"], color=colors["hedge"], linewidth=1.5, label="Commercial (Hedgers) Net")
    ax2.plot(cot["date"], cot["swap_net"],   color=colors["swap"],  linewidth=1.5, label="Swap Dealers (Big Banks) Net")
    ax2.axhline(0, color="black", linewidth=0.7, linestyle="--")
    ax2.set_ylabel("Net Contracts", fontsize=10)
    ax2.set_title("Net Positioning: Speculators vs Hedgers vs Swap Dealers", fontsize=11)
    ax2.legend(fontsize=9)
    ax2.grid(True, alpha=0.3)
    ax2.fill_between(cot["date"], cot["spec_net"], 0,
                     where=(cot["spec_net"] > 0), alpha=0.12, color=colors["spec"])
    ax2.fill_between(cot["date"], cot["spec_net"], 0,
                     where=(cot["spec_net"] < 0), alpha=0.12, color="red")

    # ── Panel 3: Speculator Share of Open Interest ───────────────────────────
    cot["spec_share"] = (cot[COLS["speculator_long"]] + cot[COLS["speculator_short"]]) / cot[COLS["open_int"]] * 100
    ax3 = axes[2]
    ax3.bar(cot["date"], cot["spec_share"], width=5, color=colors["spec"], alpha=0.7, label="Speculator Share %")
    ax3.set_ylabel("% of Open Interest", fontsize=10)
    ax3.set_title("Speculator Share of Total Open Interest", fontsize=11)
    ax3.legend(fontsize=9)
    ax3.grid(True, alpha=0.3)
    ax3.set_xlabel("Date", fontsize=10)

    # ── Format X axis ────────────────────────────────────────────────────────
    ax3.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m"))
    ax3.xaxis.set_major_locator(mdates.MonthLocator(interval=3))
    ax3.set_xlabel("Date", fontsize=10)

    fig.autofmt_xdate(rotation=45)
    plt.tight_layout()
    return fig

# ── PLOT OI ──────────────────────────────────────────────────────────────────
def plot_oi(cot: pd.DataFrame, price: pd.DataFrame) -> plt.Figure:
    fig, axes = plt.subplots(2, 1, figsize=(14, 8), sharex=True)
    fig.suptitle("Silver (COMEX): Open Interest Analysis", fontsize=15, fontweight="bold")

    colors = {"spec": "#e05c00", "hedge": "#0a5c91", "swap": "#8b00ff", "total": "black", "price": "#2a9d2a"}

    # ── Panel 1: Total Open Interest (bar) ───────────────────────────────────
    ax1 = axes[0]
    ax1.bar(cot["date"], cot[COLS["open_int"]], width=5, color=colors["total"], alpha=0.6, label="Total Open Interest")
    
    # Average OI reference line
    avg_oi = cot[COLS["open_int"]].mean()
    ax1.axhline(avg_oi, color="red", linewidth=1, linestyle="--", label=f"Average OI ({avg_oi:,.0f})")

    # Overlay silver price on twin axis
    ax1b = ax1.twinx()
    ax1b.plot(price.index, price["price"], color=colors["price"], linewidth=1.2, alpha=0.6, label="Silver Price")
    ax1b.set_ylabel("Silver Price (USD)", fontsize=9, color=colors["price"])
    ax1b.tick_params(axis="y", labelcolor=colors["price"])

    ax1.set_ylabel("Contracts", fontsize=10)
    ax1.set_title("Total Open Interest vs Silver Price", fontsize=11)
    ax1.legend(fontsize=9, loc="upper left")
    ax1b.legend(fontsize=9, loc="upper right")
    ax1.grid(True, alpha=0.3)

    # ── Panel 2: Gross OI by Group (line) ────────────────────────────────────
    cot["spec_gross"]  = cot[COLS["speculator_long"]]  + cot[COLS["speculator_short"]]
    cot["hedge_gross"] = cot[COLS["commercial_long"]]  + cot[COLS["commercial_short"]]
    cot["swap_gross"]  = cot[COLS["swap_long"]]        + cot[COLS["swap_short"]]

    ax2 = axes[1]
    ax2.plot(cot["date"], cot["spec_gross"],  color=colors["spec"],  linewidth=1.5, label="Managed Money (Speculators)")
    ax2.plot(cot["date"], cot["hedge_gross"], color=colors["hedge"], linewidth=1.5, label="Commercial (Hedgers)")
    ax2.plot(cot["date"], cot["swap_gross"],  color=colors["swap"],  linewidth=1.5, label="Swap Dealers (Big Banks)")
    ax2.set_ylabel("Contracts", fontsize=10)
    ax2.set_title("Gross Open Interest by Group\n(note: sums exceed total OI as longs & shorts are counted separately per group)", fontsize=11)
    ax2.legend(fontsize=9)
    ax2.grid(True, alpha=0.3)
    ax2.set_xlabel("Date", fontsize=10)

    ax2.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m"))
    ax2.xaxis.set_major_locator(mdates.MonthLocator(interval=3))
    fig.autofmt_xdate(rotation=45)

    plt.tight_layout()
    return fig

# ── PLOT ZOOM ────────────────────────────────────────────────────────────────
def plot_zoom(cot: pd.DataFrame, price: pd.DataFrame) -> plt.Figure:
    # Filter to Nov 2025 – Feb 2026
    cot_zoom  = cot[(cot["date"] >= "2025-11-01") & (cot["date"] <= "2026-02-28")].copy()
    price_zoom = price[(price.index >= "2025-11-01") & (price.index <= "2026-02-28")]

    fig, axes = plt.subplots(3, 1, figsize=(14, 14), sharex=True)
    fig.suptitle("Silver (COMEX): Zoom — Nov 2025 to Feb 2026", fontsize=15, fontweight="bold")

    colors = {"spec": "#e05c00", "hedge": "#0a5c91", "price": "#2a9d2a", "swap": "#8b00ff"}

    # ── Panel 1: Silver Price (daily line) ───────────────────────────────────
    ax1 = axes[0]
    ax1.plot(price_zoom.index, price_zoom["price"], color=colors["price"], linewidth=1.5)
    ax1.fill_between(price_zoom.index, price_zoom["price"].squeeze(), alpha=0.1, color=colors["price"])
    ax1.set_ylabel("Silver Price (USD)", fontsize=10)
    ax1.set_title("Silver Spot Price", fontsize=11)
    ax1.grid(True, alpha=0.3)

    # ── Panel 2: Net Positions (weekly dots) ─────────────────────────────────
    ax2 = axes[1]
    ax2.plot(cot_zoom["date"], cot_zoom["spec_net"],   color=colors["spec"],  marker="o", linestyle="None", markersize=5, label="Managed Money (Speculators) Net")
    ax2.plot(cot_zoom["date"], cot_zoom["hedger_net"], color=colors["hedge"], marker="o", linestyle="None", markersize=5, label="Commercial (Hedgers) Net")
    ax2.plot(cot_zoom["date"], cot_zoom["swap_net"],   color=colors["swap"],  marker="o", linestyle="None", markersize=5, label="Swap Dealers (Big Banks) Net")
    ax2.axhline(0, color="black", linewidth=0.7, linestyle="--")
    ax2.set_ylabel("Net Contracts", fontsize=10)
    ax2.set_title("Net Positioning: Speculators vs Hedgers vs Swap Dealers (Weekly COT)", fontsize=11)
    ax2.legend(fontsize=9, loc="upper left")
    ax2.grid(True, alpha=0.3)
    ax2b = ax2.twinx()
    ax2b.plot(price_zoom.index, price_zoom["price"], color=colors["price"], linewidth=1.2, alpha=0.5, label="Silver Price")
    ax2b.set_ylabel("Silver Price (USD)", fontsize=9, color=colors["price"])
    ax2b.tick_params(axis="y", labelcolor=colors["price"])
    ax2b.legend(fontsize=9, loc="upper right")

    # ── Panel 3: Speculator Share (weekly dots) ───────────────────────────────
    cot_zoom["spec_share"] = (cot_zoom[COLS["speculator_long"]] + cot_zoom[COLS["speculator_short"]]) / cot_zoom[COLS["open_int"]] * 100
    ax3 = axes[2]
    ax3.plot(cot_zoom["date"], cot_zoom["spec_share"], color=colors["spec"], marker="o", linestyle="None", markersize=5, label="Speculator Share %")
    ax3.set_ylabel("% of Open Interest", fontsize=10)
    ax3.set_title("Speculator Share of Total Open Interest (Weekly COT)", fontsize=11)
    ax3.legend(fontsize=9, loc="upper left")
    ax3.grid(True, alpha=0.3)
    ax3b = ax3.twinx()
    ax3b.plot(price_zoom.index, price_zoom["price"], color=colors["price"], linewidth=1.2, alpha=0.5, label="Silver Price")
    ax3b.set_ylabel("Silver Price (USD)", fontsize=9, color=colors["price"])
    ax3b.tick_params(axis="y", labelcolor=colors["price"])
    ax3b.legend(fontsize=9, loc="upper right")

    # ── Format X axis ────────────────────────────────────────────────────────
    ax3.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m-%d"))
    ax3.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
    ax3.set_xlabel("Date", fontsize=10)

    fig.autofmt_xdate(rotation=45)
    plt.tight_layout()
    return fig

# ── EXPORT CSV ───────────────────────────────────────────────────────────────
def export_csv(cot: pd.DataFrame, price: pd.DataFrame):
    price_reset = price.reset_index()
    price_reset.columns = [col[0] if isinstance(col, tuple) else col for col in price_reset.columns]
    price_reset = price_reset.rename(columns={"Date": "date", "Close": "price"})
    price_reset["date"] = pd.to_datetime(price_reset["date"]).astype("datetime64[us]")
    cot = cot.copy()
    cot["date"] = cot["date"].astype("datetime64[us]")
    
    merged = pd.merge_asof(
        cot.sort_values("date"),
        price_reset[["date", "price"]].sort_values("date"),
        on="date",
        direction="nearest"
    )
    merged.to_csv("silver_cot_data.csv", index=False)
    print(f"Data exported → silver_cot_data.csv  ({len(merged)} rows)")


# ── VALIDATE ─────────────────────────────────────────────────────────────────
def validate(cot: pd.DataFrame):
    print("\n── Validation Report ──────────────────────────────────────────")
    
    # Check 1: Net positions sum to near zero
    cot["total_net"] = cot["spec_net"] + cot["hedger_net"] + cot["swap_net"]
    max_imbalance = cot["total_net"].abs().max()
    mean_imbalance = cot["total_net"].abs().mean()
    print(f"Check 1 - Net positions sum to zero:")
    print(f"  Max imbalance:  {max_imbalance:,.0f} contracts")
    print(f"  Mean imbalance: {mean_imbalance:,.0f} contracts")
    if mean_imbalance < 5000:
        print("  ✓ PASS")
    else:
        print("  ✗ FAIL - imbalance too large")

    # Check 2: Net positions never exceed open interest
    max_spec  = cot["spec_net"].abs().max()
    max_hedge = cot["hedger_net"].abs().max()
    max_swap  = cot["swap_net"].abs().max()
    oi_min    = cot[COLS["open_int"]].min()
    print(f"\nCheck 2 - Net positions don't exceed open interest:")
    print(f"  Max speculator net:  {max_spec:,.0f}")
    print(f"  Max hedger net:      {max_hedge:,.0f}")
    print(f"  Max swap dealer net: {max_swap:,.0f}")
    print(f"  Min open interest:   {oi_min:,.0f}")
    if max_spec < oi_min and max_hedge < oi_min and max_swap < oi_min:
        print("  ✓ PASS")
    else:
        print("  ✗ FAIL - a net position exceeds open interest")

    # Check 3: No missing dates (gaps larger than 14 days)
    cot_sorted = cot.sort_values("date")
    gaps = cot_sorted["date"].diff().dt.days.dropna()
    max_gap = gaps.max()
    print(f"\nCheck 3 - No large gaps in data:")
    print(f"  Largest gap between reports: {max_gap:.0f} days")
    if max_gap <= 14:
        print("  ✓ PASS")
    else:
        print(f"  ✗ FAIL - gap of {max_gap:.0f} days detected")

    print("───────────────────────────────────────────────────────────────\n")

# ── VERSION OUTPUT FILE ───────────────────────────────────────────────────────
def get_versioned_filename(base: str, ext: str) -> str:
    version = 1
    while os.path.exists(f"{base}_v{version}.{ext}"):
        version += 1
    return f"{base}_v{version}.{ext}"

# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"Loading COT data {START_YEAR}–{END_YEAR}...")
    cot = load_silver_cot(START_YEAR, END_YEAR)
    validate(cot)
    print(f"COT rows loaded: {len(cot)}  |  Date range: {cot['date'].min().date()} → {cot['date'].max().date()}")

    price = fetch_silver_price(
        start=str(cot["date"].min().date()),
        end=str(datetime.now().date())
    )

    export_csv(cot, price)
    out_path = get_versioned_filename("silver_cot_charts", "pdf")
    with PdfPages(out_path) as pdf:
        pdf.savefig(plot_main(cot, price), bbox_inches="tight")
        pdf.savefig(plot_oi(cot, price), bbox_inches="tight")
        pdf.savefig(plot_zoom(cot, price), bbox_inches="tight")
        print(f"Charts saved → {out_path}")