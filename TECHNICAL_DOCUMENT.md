# Technical Document: Portfolio Dashboard

**Assignment**: Dynamic Portfolio Dashboard — Octa Byte AI  
**Stack**: Next.js 15 · TypeScript · Tailwind CSS · Node.js

---

## 1. Problem Decomposition

Before writing a single line of code, I mapped out the core sub-problems:

| Problem | Complexity | Solution |
|---------|------------|----------|
| Yahoo Finance API (no official API) | High | `yahoo-finance2` npm lib (unofficial, server-side) |
| Google Finance API (no API) | High | Yahoo Finance equivalents (trailingPE, EPS) |
| 7-Day Sparklines | Medium | `yf.chart` (v2) for historical close prices |
| Live News Feed | Medium | `yf.search` with hover-activated UI tooltips |
| Portfolio Search/Filter | Low | Client-side fuzzy search via `useMemo` |
| Rate limiting on unofficial APIs | Medium | In-memory cache + batched concurrency |
| Real-time CMP updates | Medium | Client-side polling every 15s |
| Sector grouping with collapsible rows | Medium | `@tanstack/react-table` + custom sector headers |
| Data accuracy / fallbacks | Medium | Graceful degradation + fallback to Excel values |

---

## 2. The API Problem — The Hardest Part

### Yahoo Finance
Yahoo Finance shut down its official API in 2017. There are a few approaches:

**Option A — Web scraping (fragile)**: Parse HTML from finance.yahoo.com. Breaks whenever Yahoo changes their frontend.

**Option B — Unofficial library (chosen)**: `yahoo-finance2` on npm reverse-engineers Yahoo's internal undocumented JSON endpoints. It's stable because it targets the same APIs Yahoo's own mobile apps use, not the rendered HTML.

**Why I chose Option B**: More stable, typed API, community-maintained (9k+ stars), handles cookies and CSRF automatically.

**Risk acknowledged**: Yahoo can change internal endpoints without notice. Mitigation: cache responses, fail gracefully, and the library maintainers typically patch within days of breakage.

---

## 3. Rate Limiting Strategy

Yahoo's informal limits are roughly 10–20 requests/second before they start returning 429s. With 26 stocks in the portfolio:

**Approach**:
1. **Batch size of 50**: Current implementation chunks at 50, but uses concurrent processing for fresh data.
2. **30-second in-memory cache**: Each symbol result is cached for 30 seconds. A 15s poll cycle means every other poll hits the cache, halving real API calls.
3. **Shorter failure cache**: Failed fetches are re-cached for only 5 seconds, allowing faster retry.

---

## 4. Real-Time Updates Architecture

```
Browser                          Server
   │                                │
   │──── GET /api/portfolio ────────►│ Fetch + merge + respond
   │◄─── JSON (holdings, sectors) ──│
   │                                │
   │ (wait 15s)                     │
   │                                │
   │──── GET /api/portfolio ────────►│ Serve from cache (if < 30s)
   │◄─── JSON                       │
```

- `usePortfolio` hook uses `setInterval` to poll every 15 seconds.
- A visual countdown (15 → 0) keeps users informed.
- Manual "Refresh" button resets the countdown and triggers an immediate fetch.

---

## 5. Data Model Design

The portfolio data has two distinct layers:

**Static layer** (from Excel, never changes at runtime):
- Purchase price, quantity, sector, NSE code, Excel fundamentals.

**Dynamic layer** (from Yahoo Finance, updates every 15s):
- CMP, present value, gain/loss, live P/E, live EPS, Sparklines, News.

---

## 6. Component Architecture

```
DashboardPage (client, polling)
├── DashboardHeader (status, countdown, refresh button)
├── StatsCards (total invested, present value, gain/loss)
├── SectorChart (recharts bar — invested vs present per sector)
├── GainLossChart (recharts horizontal bar — per-stock P&L)
└── PortfolioTable (@tanstack/react-table)
    ├── [SectorHeader × 6] (collapsible, sector P&L summary)
    └── [StockRow × N] (individual holdings + News Tooltip + Sparkline)
```

---

## 7. Performance Optimizations

1. **`useMemo` for filtering and sorting**: Ensuring high performance even with large stock lists.
2. **Batch Data Fetching**: Using `Promise.all` for concurrent historical and news fetching on the server.
3. **Memoized Table**: Headless table logic ensures only changed rows re-render.

---

## 8. Security Considerations

- **Server-Side Execution**: All API interactions with Yahoo Finance happen on the server, hiding logic and protecting against CORS issues.
- **Husky & Lint-staged**: Pre-commit hooks ensure that only code following strict ESLint rules and TypeScript types is committed.

---

## 9. Future Roadmap & Scaling

### 1. Redis for Distributed Caching
Currently, the application uses an in-memory `Map` for caching prices. While fast, this cache is lost on every server restart and isn't shared across multiple server instances (e.g., in a Vercel/Serverless environment).
- **Implementation**: Migrate to **Upstash Redis** or standard Redis.
- **Benefit**: Persistence and shared state across all server instances.

### 2. Official Market Data Integration (Zerodha Kite)
To move beyond the 15-minute delay of unofficial Yahoo data, the next step is integrating an official Indian exchange broker API like **Kite Connect**.
- **Implementation**: Replace `yahooFetcher.ts` logic with Kite's REST API for CMP and fundamental data.
- **Benefit**: NSE/BSE tick-by-tick accuracy and legal data reliability.

### 3. WebSockets for True Real-time Streaming
Polling every 15 seconds is efficient but not "true" real-time.
- **Implementation**: Implement a WebSocket server (using Socket.io or Next.js custom server) that pipes a live stream from a data provider directly to the browser.
- **Benefit**: Zero-latency price updates without manual or timed refreshes.

### 4. Historical P&L & Analytics
- **Implementation**: A time-series chart showing portfolio value over time, stored in a lightweight database (PostgreSQL/Supabase).
- **Metric**: Adding **XIRR** and **CAGR** calculations for professional performance tracking.

---

## 10. Lessons Learned

The most important non-obvious insight: **always read unofficial library source code before committing to it**. I verified `yahoo-finance2` before using it — it targets Yahoo's internal endpoints and has proper TypeScript types.

The second insight: **build for failure from day one**. The `null` data model + graceful UI degradation ensures the dashboard always renders something useful, even when individual symbols fail to load.

---

## 11. Advanced Features Implementation

### 7-Day Sparklines
To provide visual momentum indicators without overloading the API:
- **Backend**: Uses `yf.chart(symbol, { interval: '1d' })` to fetch the last 7 days of closing prices.
- **Frontend**: A custom component using Recharts `<LineChart />` with hidden axes, color-coded by P&L.

### Live News Integration
- **Data Source**: Uses `yf.search(symbol)` to retrieve headlines.
- **UI/UX**: Headlines are displayed in a hover-activated tooltip to maintain a clean layout.

### Real-time Search
- **Implementation**: A client-side filter matching company names and symbols.
- **Performance**: Integrated with `useMemo` to keep table sorting and sector grouping consistent during filtering.
