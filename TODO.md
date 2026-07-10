# Silver COT Research — Task List
*Last updated: May 26, 2026*

---

## 🔴 High Priority

1. **Confirm CFTC reporting thresholds and trader classification definitions for silver futures**
   Identify exactly which trades are absent from the Disaggregated COT report. Among the absent trades, try to determine their composition — confirm it's retail or identify what else it might be.

2. **Investigate what specific market events triggered managed money entry in late Feb – early Mar 2024**
   Beyond the Powell testimony. What happened specifically around February 27 – March 3, 2024?

3. **Add timeline annotations to all graphs**
   Three markers: (1) February 2022 Fed tightening start, (2) Powell testimony March 6–7 2024, (3) Liberation Day April 2, 2026.

---

## 🟡 Medium Priority

4. **Plot concentration data: top 4 and top 8 traders' share of OI over time, separating long from short**
   From Assa's May 11 email. Zoom window (Nov 2025 – Mar 2026). Still undelivered.

5. **Run the momentum regression**
   Regress weekly Δ speculator share on contemporaneous and lagged weekly Δ silver price. Tests whether speculators are chasing momentum or leading it. If speculator share goes up *after* price rises, they're momentum chasers. If *before*, they may be driving it.

6. **Graph speculator net positions pre-Aug 2025 with annotated negative-position periods**
   Identify all episodes where speculators went net short (more shorts than longs) between 2020–2025. Label start/end dates and investigate what macro event drove each episode. Good historical context for the thesis.

7. **Run the pipeline on the Combined Futures & Options report**
   Rerun the full analysis on the CFTC's Combined F&O report. Currently the pipeline uses Futures-Only data; the Combined report adds options on silver futures which may represent significant additional exposure.

8. **Add futures contract expiry date markers to the price chart**
   Mark COMEX Silver contract expiry dates as vertical lines on the price panel.

9. **Convert CSV data to a queryable database**
   Migrate the current silver_cot_data.csv into a SQL database for easier querying and analysis. From the May 26 meeting.

10. **Verify yield curve changes between February 1 and March 10, 2024**
   Confirm rate expectations were shifting in that window as supporting evidence for the Powell hypothesis.

11. **Examine Compustat portfolio holdings data around March 2024 via WRDS**
    Look at hedge fund and financial firm holdings to independently confirm the managed money strategy shift.

---

## 🟢 Lower Priority / Investigative

12. **Reconnect with Assa end of June**
    Available after June 26. Assa to provide list of research topics and data sources for summer thesis work by end of June.

13. **Explore publicly available LBMA and SHFE data**
    Investigate what spot price and volume data is available from the London Bullion Market Association and Shanghai Futures Exchange. Key for testing Assa's physical shortage hypothesis.

14. **Research "spreading" and "change in commitment" in CFTC reports**
    Understand what these columns mean and whether they're relevant to include in the analysis.

15. **Find a silver trader to interview**
    Reach out to any connections and CC Assa to facilitate scheduling. (Ben Meisels already contacted Apr 30 — follow up if no response.)

16. **Graph options vs. futures trade sizes**
    Depends on completing the Combined F&O pipeline first (item 7).

---

## Standing Rules

- **Default time window:** All new graphs use the **Nov 2025 – Feb 2026** zoom window unless Assa specifies otherwise.
- **Chart style:** Full 6-year charts use lines. Zoom window charts use weekly dots overlaid on the daily price line.
- **Peak annotation:** Dashed vertical line marking the Jan 27 price peak appears on zoom charts only.
- **Default zoom:** Nov 2025 – Feb 2026 window with price peak dashed line on all panels.

---

## Completed ✅

- Built Python pipeline pulling CFTC Disaggregated COT data (2020–present), merged with Yahoo Finance silver price
- Fixed Jan 27, 2026 anomaly — Micro Silver (code 84) was contaminating standard Silver rows; fixed by adding market name filter
- Built full-range charts: price, net positioning, OI analysis, gross OI by group
- Built zoom charts (Nov 2025 – Feb 2026): price, net positioning (dots), OI, gross OI by group, speculator share
- Built dollar exposure charts: net exposure by group (full range + zoom)
- Built long/short position charts by group (full range + zoom)
- Built long/short dollar exposure charts by group
- Investigated speculator dollar exposure anomaly — confirmed it does drop post-crash; visual scale was compressing variation
- Added Other Reportable and Non-Reportable categories to existing graphs (long/short dollar exposure)
- Confirmed longs/shorts gap exists — non-reportable long exposure tracks silver price closely, consistent with retail momentum chasing
- Plotted difference between total long and total short positions (Nov 2025 – Mar 2026)
- Built Quarto document combining narrative, charts, and code — uploaded to GitHub
