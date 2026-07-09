#!/usr/bin/env python3
"""
COT Workbench — local proxy server
Handles CFTC zip downloads, Yahoo Finance, and FRED API calls
to avoid CORS restrictions in the browser.

Usage:
    python3 proxy.py

Runs on http://localhost:3001
Keep this running alongside `npm run dev`
"""

import io
import json
import zipfile
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = 3001

ALLOWED_HOSTS = {
    "www.cftc.gov",
    "cftc.gov",
    "query1.finance.yahoo.com",
    "query2.finance.yahoo.com",
    "api.stlouisfed.org",
}

class ProxyHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"  {args[0]} {args[1]}")

    def send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        # ── /cot?year=2024 ────────────────────────────────────────────────────
        if parsed.path == "/cot":
            year = params.get("year", [None])[0]
            commodity = int(params.get("commodity", [84])[0])
            market = params.get("market", ["SILVER - COMMODITY EXCHANGE INC."])[0]

            if not year:
                return self._error(400, "Missing year parameter")

            url = f"https://www.cftc.gov/files/dea/history/fut_disagg_txt_{year}.zip"
            print(f"\n→ Fetching COT {year} from CFTC...")

            try:
                req = urllib.request.Request(url, headers={"User-Agent": "COT-Workbench/1.0"})
                with urllib.request.urlopen(req, timeout=60) as resp:
                    data = resp.read()

                with zipfile.ZipFile(io.BytesIO(data)) as z:
                    txt_name = next(n for n in z.namelist() if n.endswith(".txt"))
                    with z.open(txt_name) as f:
                        csv_text = f.read().decode("utf-8", errors="replace")

                # Filter to requested commodity + market inline (saves bandwidth to browser)
                lines = csv_text.splitlines()
                if not lines:
                    return self._error(500, "Empty CSV")

                header = lines[0]
                cols = [c.strip().strip('"') for c in header.split(",")]

                try:
                    code_idx   = cols.index("CFTC_Commodity_Code")
                    market_idx = cols.index("Market_and_Exchange_Names")
                except ValueError:
                    # Return full CSV if columns not found, let the browser filter
                    self._json_response({"header": header, "rows": lines[1:]})
                    return

                filtered = [header]
                for line in lines[1:]:
                    if not line.strip():
                        continue
                    parts = line.split(",")
                    if len(parts) <= max(code_idx, market_idx):
                        continue
                    code = parts[code_idx].strip().strip('"')
                    mkt  = parts[market_idx].strip().strip('"')
                    try:
                        if int(code) == commodity and mkt == market:
                            filtered.append(line)
                    except ValueError:
                        continue

                print(f"  ✓ {year}: {len(filtered)-1} rows for commodity {commodity}")
                self._text_response("\n".join(filtered))

            except StopIteration:
                self._error(500, f"No .txt file in COT zip for {year}")
            except urllib.error.HTTPError as e:
                self._error(e.code, f"CFTC returned {e.code} for {year}")
            except Exception as e:
                self._error(500, str(e))

        # ── /yahoo?ticker=SI%3DF&start=1609459200&end=1700000000 ─────────────
        elif parsed.path == "/yahoo":
            ticker = params.get("ticker", [None])[0]
            start  = params.get("start",  ["946684800"])[0]
            end    = params.get("end",    [None])[0]

            if not ticker:
                return self._error(400, "Missing ticker")

            import time
            if not end:
                end = str(int(time.time()))

            url = (
                f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
                f"?interval=1d&period1={start}&period2={end}"
            )
            print(f"\n→ Fetching {ticker} from Yahoo Finance...")
            try:
                req = urllib.request.Request(url, headers={
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json",
                })
                with urllib.request.urlopen(req, timeout=30) as resp:
                    body = resp.read()
                print(f"  ✓ {ticker} fetched")
                self._raw_response(body, "application/json")
            except Exception as e:
                self._error(500, str(e))

        # ── /fred?series_id=DFF&api_key=...&start=...&end=... ────────────────
        elif parsed.path == "/fred":
            series_id = params.get("series_id", [None])[0]
            api_key   = params.get("api_key",   [None])[0]
            start     = params.get("start",     ["2015-01-01"])[0]
            end       = params.get("end",       [None])[0]

            if not series_id or not api_key:
                return self._error(400, "Missing series_id or api_key")

            import time
            if not end:
                from datetime import date
                end = date.today().isoformat()

            url = (
                f"https://api.stlouisfed.org/fred/series/observations"
                f"?series_id={series_id}&api_key={api_key}&file_type=json"
                f"&observation_start={start}&observation_end={end}"
            )
            print(f"\n→ Fetching {series_id} from FRED...")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "COT-Workbench/1.0"})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    body = resp.read()
                print(f"  ✓ {series_id} fetched")
                self._raw_response(body, "application/json")
            except Exception as e:
                self._error(500, str(e))

        # ── /health ───────────────────────────────────────────────────────────
        elif parsed.path == "/health":
            self._json_response({"status": "ok", "port": PORT})

        else:
            self._error(404, f"Unknown endpoint: {parsed.path}")

    def _json_response(self, data):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _text_response(self, text):
        body = text.encode("utf-8")
        self.send_response(200)
        self.send_cors()
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _raw_response(self, body, content_type):
        self.send_response(200)
        self.send_cors()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _error(self, code, message):
        body = json.dumps({"error": message}).encode()
        self.send_response(code)
        self.send_cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = HTTPServer(("localhost", PORT), ProxyHandler)
    print(f"""
╔══════════════════════════════════════════════╗
║       COT Workbench — Proxy Server           ║
║   Running on http://localhost:{PORT}            ║
║                                              ║
║   Keep this running alongside npm run dev    ║
║   Press Ctrl+C to stop                       ║
╚══════════════════════════════════════════════╝
""")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nProxy stopped.")
