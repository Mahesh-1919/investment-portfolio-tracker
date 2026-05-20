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

### Google Finance
Google Finance has no accessible API — not official, not unofficial. Web scraping Google Finance is also unreliable due to aggressive bot protection (Captcha, IP rotation).

**My solution**: Yahoo Finance provides equivalent fundamental data:
- P/E Ratio → `quote.trailingPE` (same as P/E TTM)
- Latest Earnings (EPS) → `quote.epsTrailingTwelveMonths`

These are identical data points to what Google Finance shows. If a live fetch fails, the dashboard falls back to the values from the Excel file.

---

## 3. Rate Limiting Strategy

Yahoo's informal limits are roughly 10–20 requests/second before they start returning 429s. With 26 stocks in the portfolio:

**Approach**:
1. **Batch size of 5**: Fetch 5 symbols concurrently per round
2. **300ms inter-batch delay**: A 300ms gap between each batch of 5
3. **30-second in-memory cache**: Each symbol result is cached for 30 seconds. A 15s poll cycle means every other poll hits the cache, halving real API calls.
4. **Shorter failure cache**: Failed fetches are re-cached for only 5 seconds, allowing faster retry.

**Total fetch time estimate**: 26 stocks / 5 per batch = 6 batches × ~300ms = ~1.8s worst case (network not included).

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

- `usePortfolio` hook uses `setInterval` to poll every 15 seconds
- A visual countdown (15 → 0) keeps users informed
- Manual "Refresh" button resets the countdown and triggers an immediate fetch
- `isRefreshing` state shows a spinner on the button during the fetch

**Why polling over WebSockets**: WebSockets add server complexity (persistent connections, reconnection logic) and don't meaningfully improve UX when the underlying data source (Yahoo Finance) is itself polled — not pushed. Polling every 15s is appropriate for delayed exchange data.

---

## 5. Data Model Design

The portfolio data has two distinct layers:

**Static layer** (from Excel, never changes at runtime):
- Purchase price, quantity, sector, NSE code, Excel fundamentals

**Dynamic layer** (from Yahoo Finance, updates every 15s):
- CMP, present value, gain/loss, live P/E, live EPS

I modeled this as a single `StockHolding` interface where dynamic fields are `number | null`. Null means "not yet fetched" — the UI handles this by showing a pulsing placeholder rather than 0 or NaN.

This avoids the common bug of showing ₹0 gain/loss for stocks that haven't loaded yet.

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
    └── [StockRow × N] (individual holdings)
```

Key decisions:
- **`@tanstack/react-table`** for the table: Provides headless sorting without opinionated rendering, letting us slot in custom sector header rows between data rows.
- **Recharts** for charts: Declarative, SSR-compatible, lightweight.
- **Sector collapsibility**: Each sector starts expanded. Toggle state is local to `PortfolioTable`. Collapse is useful when the user wants to focus on a specific sector.

---

## 7. Performance Optimizations

1. **`useMemo` for sorted sectors**: Re-sorting 26 items only when `sorting` state changes.
2. **Server-side data merge**: `mergeWithLivePrices` runs on the server, not in the browser, reducing JS bundle work.
3. **`force-dynamic` on API route**: Prevents Next.js from caching the API response at the CDN layer, ensuring every poll gets fresh data.
4. **Error isolation**: A failed Yahoo fetch for one symbol doesn't block the entire response — other symbols still return.

---

## 8. Security Considerations

- **No API keys exposed**: `yahoo-finance2` doesn't require API keys. If a service were added that required keys (e.g. a paid data provider), they would live in `.env.local` and be accessed only server-side.
- **No sensitive data client-side**: The backend merges data before sending to the browser. The client never directly calls Yahoo Finance.
- **Input validation**: The API route doesn't accept any user input — it uses a hardcoded symbol list from `portfolioData.ts`.

---

## 9. What I Would Add With More Time

1. **Redis cache**: Replace in-memory cache with Redis for multi-instance deployments (Vercel, etc.)
2. **WebSocket for real price streaming**: Integrate a paid provider like Zerodha Kite WebSocket or NSE's official feed for true real-time prices
3. **Historical P&L chart**: A time-series chart showing portfolio value over time, stored in a lightweight database (SQLite or Postgres)
4. **Alert system**: Email/SMS alerts when a stock's gain/loss crosses a threshold
5. **Authentication**: Multi-user support with individual portfolios
6. **Google Finance scraping**: A Playwright-based headless browser approach could work but adds significant infrastructure overhead — not worth it when Yahoo Finance provides the same data

---

## 10. Lessons Learned

The most important non-obvious insight: **always read unofficial library source code before committing to it**. I verified `yahoo-finance2` before using it — it targets Yahoo's `query2.finance.yahoo.com` internal endpoint and has proper TypeScript types. Some alternatives (like `yahoo-finance` v1) are abandoned and broken.

The second insight: **build for failure from day one**. The `null` data model + graceful UI degradation took 20% more upfront time but meant the dashboard always renders something useful, even when Yahoo is flaky.
