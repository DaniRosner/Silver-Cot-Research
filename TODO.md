# Silver COT Research — Task List
*Last updated: April 30, 2026*

---

## 🔴 High Priority

1. **Check longs = shorts across all CFTC groups**
   Verify that total long positions equal total short positions across all trader categories. If they don't balance, identify the missing categories — likely Other Reportable and Non-Reportable. This is Assa's most recent explicit ask (Apr 29 email, unanswered).

2. **Reply to Assa's Apr 29 10:53 PM email**
   Acknowledge all three points: (a) longs/shorts balance check, (b) swap dealer exposure story, (c) reexamining speculator dollar exposure as a portfolio management lens.

3. **Run the momentum regression**
   Regress weekly Δ speculator share on contemporaneous and lagged weekly Δ silver price. Tests whether speculators are chasing momentum or leading it.

---

## 🟡 Medium Priority

4. **Add Other Reportable and Non-Reportable categories to existing graphs**
   Now more urgent given the balance check — these missing groups likely explain any longs/shorts discrepancy.

5. **Graph speculator net positions pre-Aug 2025 with annotated negative-position periods**
   Identify all episodes of negative speculator net positioning with start/end dates and investigate what drove each episode.

6. **Run the pipeline on the Combined Futures & Options report**
   Rerun the full analysis on the CFTC's Combined F&O report in addition to the current Futures-Only pipeline.

7. **Add futures contract expiry date markers to the price chart**
   Mark COMEX Silver contract expiry dates as vertical lines on the price panel.

8. **Add CFTC concentration data**
   Plot % of open interest held by the largest traders (top 4 and top 8) over time.

---

## 🟢 Lower Priority / Investigative

9. **Explore publicly available LBMA and SHFE data**
   Investigate what spot price and volume data is available from the London Bullion Market Association and Shanghai Futures Exchange. Key for testing Assa's physical shortage hypothesis.

10. **Research "spreading" and "change in commitment" in CFTC reports**
    Understand what these columns mean and whether they're relevant to include in the analysis.

11. **Investigate how companies report trades to the CFTC**
    Understand the reporting mechanics and whether underlying trade-level data is accessible.

12. **Find a silver trader to interview**
    Reach out to any connections and CC Assa to facilitate scheduling.

13. **Graph options vs. futures trade sizes**
    Depends on completing the Combined F&O pipeline first (item 6).

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
