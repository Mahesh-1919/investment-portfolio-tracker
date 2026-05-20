import YahooFinanceClass from "yahoo-finance2";
import { LivePriceResult } from "@/types/portfolio";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf = new (YahooFinanceClass as any)({ suppressNotices: ["yahooSurvey"] });

const CACHE_TTL_MS = 30_000;
const FAILURE_CACHE_TTL_MS = 5_000;
const BATCH_SIZE = 50;
const INTER_BATCH_DELAY_MS = 200;

const cache = new Map<string, { data: LivePriceResult; expiresAt: number }>();

function getCached(symbol: string): LivePriceResult | null {
  const entry = cache.get(symbol);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(symbol);
    return null;
  }
  return entry.data;
}

function setCache(symbol: string, data: LivePriceResult, ttl = CACHE_TTL_MS): void {
  cache.set(symbol, { data, expiresAt: Date.now() + ttl });
}

async function fetchBatch(symbols: string[]): Promise<LivePriceResult[]> {
  const uncached = symbols.filter((s) => !getCached(s));

  if (uncached.length === 0) {
    return symbols.map((s) => getCached(s)!);
  }

  let freshResults: LivePriceResult[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = (await yf.quote(uncached)) as any[];

    // Fetch historical data and news for sparklines/headlines
    // We'll only do this for fresh results to save time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quoteMap = new Map<string, any>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quotes.map((q: any) => [q.symbol, q])
    );

    const freshResultsPromises = uncached.map(async (symbol) => {
      const q = quoteMap.get(symbol);

      if (!q) {
        const result: LivePriceResult = {
          symbol,
          cmp: null,
          peRatio: null,
          latestEarnings: null,
          error: "No data returned (possibly delisted or invalid symbol)",
        };
        setCache(symbol, result, FAILURE_CACHE_TTL_MS);
        return result;
      }

      // Fetch sparkline (last 7 days of close prices)
      let sparkline: number[] | undefined;
      try {
        const chart = await yf.chart(symbol, {
          period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          interval: "1d",
        });
        sparkline = chart.quotes
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((quote: any) => quote.close)
          .filter((v: number | null | undefined): v is number => v !== null && v !== undefined);
        
        if (sparkline && sparkline.length > 0) {
          console.log(`[YahooFetcher] Success: ${symbol} sparkline points: ${sparkline.length}`);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn(`[YahooFetcher] Failed sparkline for ${symbol}:`, message);
      }

      // Fetch news (limit to first 3 items)
      let news: { title: string; link: string; publisher: string }[] | undefined;
      try {
        const search = await yf.search(symbol, { newsCount: 3 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        news = search.news?.map((n: any) => ({

          title: n.title,
          link: n.link,
          publisher: n.publisher,
        }));
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.warn(`[YahooFetcher] Failed news for ${symbol}:`, message);
      }

      const result: LivePriceResult = {
        symbol,
        cmp: q.regularMarketPrice ?? null,
        peRatio: q.trailingPE ?? null,
        latestEarnings: q.epsTrailingTwelveMonths ?? null,
        sparkline,
        news,
      };
      setCache(symbol, result);
      return result;
    });

    freshResults = await Promise.all(freshResultsPromises);

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Batch fetch failed";
    console.error(`[YahooFetcher] Batch failed for [${uncached.join(",")}]: ${errMsg}`);

    freshResults = uncached.map((symbol) => {
      const result: LivePriceResult = {
        symbol,
        cmp: null,
        peRatio: null,
        latestEarnings: null,
        error: errMsg,
      };
      setCache(symbol, result, FAILURE_CACHE_TTL_MS);
      return result;
    });
  }

  const freshMap = new Map(freshResults.map((r) => [r.symbol, r]));
  return symbols.map((s) => freshMap.get(s) ?? getCached(s)!);
}

export async function fetchLivePrices(symbols: string[]): Promise<LivePriceResult[]> {
  if (symbols.length === 0) return [];

  const results: LivePriceResult[] = [];

  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const chunk = symbols.slice(i, i + BATCH_SIZE);
    const chunkResults = await fetchBatch(chunk);
    results.push(...chunkResults);

    if (i + BATCH_SIZE < symbols.length) {
      await new Promise((r) => setTimeout(r, INTER_BATCH_DELAY_MS));
    }
  }

  return results;
}

export function getCacheStats() {
  const now = Date.now();
  let live = 0, expired = 0;
  cache.forEach((entry) => {
    if (entry.expiresAt > now) live++;
    else expired++;
  });
  return { total: cache.size, live, expired };
}

export function clearPriceCache(): void {
  cache.clear();
}
