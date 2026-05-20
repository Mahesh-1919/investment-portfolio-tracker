# Portfolio Dashboard — Octa Byte AI Evaluation

Real-time investment portfolio tracker built with Next.js 15, TypeScript, Tailwind CSS, and Node.js.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Project Structure

```
app/
  api/portfolio/route.ts   ← Backend: live price fetching + data merge
  page.tsx                 ← Dashboard (client component)
components/portfolio/      ← All UI components
hooks/usePortfolio.ts      ← 15s polling hook with countdown
lib/
  portfolioData.ts         ← Seed data from Excel
  yahooFetcher.ts          ← Yahoo Finance proxy with cache
  portfolioUtils.ts        ← Merge, group, compute, format helpers
types/portfolio.ts         ← TypeScript interfaces
```

## Architecture

### Data Flow
Excel seed data + Yahoo Finance live prices → API Route → polling hook → React UI

### Key Design Decisions

**1. Backend proxy for Yahoo Finance**
Yahoo has no official API. `yahoo-finance2` (npm, unofficial) hits Yahoo's internal endpoints.
All scraping is server-side — never exposed to the browser. API keys/secrets stay safe.

**2. In-memory cache (30s TTL)**
Each symbol response is cached for 30s per Node.js process. Prevents rate-limiting and
reduces API response time on repeated 15s polls.

**3. Concurrency-controlled batching**
Symbols fetched in batches of 5 with 300ms between batches. Pragmatic throttle against
Yahoo's informal rate limits.

**4. Graceful degradation**
If a live fetch fails, the row shows "--" for live fields rather than breaking.
Partial live data is surfaced with a count badge in the header.

## Features

- Live CMP via Yahoo Finance (auto-refreshes every 15 seconds)
- Sector grouping with collapsible rows + sector-level P&L summaries
- Color-coded Gain/Loss: green = profit, red = loss
- Sortable columns via @tanstack/react-table
- Recharts: sector allocation bar chart + per-stock gain/loss chart
- Core holding indicators (★) + exit flags from Excel data
- Full loading skeleton, error banners, live status badge

## Tech Stack

Next.js 15 · TypeScript · Tailwind CSS · @tanstack/react-table · recharts · yahoo-finance2 · lucide-react

## Known Limitations

1. yahoo-finance2 is unofficial and may break if Yahoo changes their internal API
2. NSE/BSE data via Yahoo can be 15–20 min delayed during market hours
3. Google Finance (mentioned in assignment) has no accessible API. P/E and EPS are
   sourced from Yahoo Finance (trailingPE, epsTrailingTwelveMonths) which provides
   equivalent fundamentals data
4. In-memory cache doesn't persist across serverless instances (use Redis for production)

## Deployment

```bash
# Vercel
npx vercel

# Self-hosted
npm run build && npm start
```

See TECHNICAL_DOCUMENT.md for detailed challenge write-up.
