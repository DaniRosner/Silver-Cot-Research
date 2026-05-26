# Silver COT Research — Task List
*Last updated: May 26, 2026*

---

## 🔴 High Priority

1. **Build the Quarto document**
   Assa's most recent explicit ask (May 20 email). Move chart summaries into a Quarto file that includes text, charts, and code. Write a narrative of what you think is happening and how the charts support it. Send to Assa before the upcoming Teams meeting.

2. **Investigate which trades are included/excluded from CFTC reports**
   Identify exactly which trades are absent from the Disaggregated COT report. Among the absent trades, try to determine their composition — confirm it's retail or identify what else it might be.

3. **Check when the Teams meeting is**
   Assa sent a Teams invite today (May 26) titled "Update - research of silver's boom and bust." Date/time is in the .ics attachment — check your calendar.

---

## 🟡 Medium Priority

4. **Plot concentration data: top 4 and top 8 traders' share of OI over time, separating long from short**
   From Assa's May 11 email. Zoom window (Nov 2025 – Mar 2026). Still undelivered.

5. **Run the momentum regression**
   Regress weekly Δ speculator share on contemporaneous and lagged weekly Δ silver price. Tests whether speculators are chasing momentum or leading it.

6. **Graph speculator net positions pre-Aug 2025 with annotated negative-position periods**
   Identify all episodes of negative speculator net positioning with start/end dates and investigate what drove each episode.

7. **Run the pipeline on the Combined Futures & Options report**
   Rerun the full analysis on the CFTC's Combined F&O report in addition to the current Futures-Only pipeline.

8. **Add futures contract expiry date markers to the price chart**
   Mark COMEX Silver contract expiry dates as vertical lines on the price panel.

---

## 🟢 Lower Priority / Investigative

9. **Explore publicly available LBMA and SHFE data**
   Investigate what spot price and volume data is available from the London Bullion Market Association and Shanghai Futures Exchange. Key for testing Assa's physical shortage hypothesis.

10. **Research "spreading" and "change in commitment" in CFTC reports**
    Understand what these columns mean and whether they're relevant to include in the analysis.

11. **Find a silver trader to interview**
    Reach out to any connections and CC Assa to facilitate scheduling. (Ben Meisels already contacted Apr 30 — follow up if no response.)

12. **Graph options vs. futures trade sizes**
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
