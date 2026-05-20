import { StockHolding, SectorSummary, PortfolioStats, Sector } from "@/types/portfolio";
import { LivePriceResult } from "@/types/portfolio";

export function mergeWithLivePrices(
  holdings: StockHolding[],
  livePrices: LivePriceResult[]
): StockHolding[] {
  const priceMap = new Map(livePrices.map((p) => [p.symbol, p]));

  return holdings.map((h) => {
    const live = priceMap.get(h.yahooSymbol);
    if (!live || live.cmp === null) return h;

    const cmp = live.cmp;
    const presentValue = cmp * h.qty;
    const gainLoss = presentValue - h.investment;
    const gainLossPct = gainLoss / h.investment;

    return {
      ...h,
      cmp,
      presentValue,
      gainLoss,
      gainLossPct,
      // Update PE and earnings if we got fresh data
      peRatio: live.peRatio ?? h.peRatio,
      latestEarnings: live.latestEarnings ?? h.latestEarnings,
      sparkline: live.sparkline ?? h.sparkline,
      news: live.news ?? h.news,
      lastUpdated: new Date().toISOString(),
    };
  });
}

export function groupBySector(holdings: StockHolding[]): SectorSummary[] {
  const sectors = [
    "Financial Sector",
    "Tech Sector",
    "Consumer",
    "Power",
    "Pipe Sector",
    "Others",
  ] as Sector[];

  return sectors
    .map((sector) => {
      const sectorHoldings = holdings.filter((h) => h.sector === sector);
      if (sectorHoldings.length === 0) return null;

      const totalInvestment = sectorHoldings.reduce(
        (sum, h) => sum + h.investment,
        0
      );

      const valuedHoldings = sectorHoldings.filter(
        (h) => h.presentValue !== null
      );
      const totalPresentValue =
        valuedHoldings.length > 0
          ? valuedHoldings.reduce((sum, h) => sum + h.presentValue!, 0)
          : null;

      const gainLoss =
        totalPresentValue !== null
          ? totalPresentValue - totalInvestment
          : null;
      const gainLossPct =
        gainLoss !== null ? gainLoss / totalInvestment : null;

      return {
        sector,
        totalInvestment,
        totalPresentValue,
        gainLoss,
        gainLossPct,
        holdings: sectorHoldings,
      } as SectorSummary;
    })
    .filter(Boolean) as SectorSummary[];
}

export function computePortfolioStats(holdings: StockHolding[]): PortfolioStats {
  const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
  const valuedHoldings = holdings.filter((h) => h.presentValue !== null);
  const totalPresentValue =
    valuedHoldings.length > 0
      ? valuedHoldings.reduce((sum, h) => sum + h.presentValue!, 0)
      : null;

  const totalGainLoss =
    totalPresentValue !== null
      ? totalPresentValue - totalInvestment
      : null;
  const totalGainLossPct =
    totalGainLoss !== null ? totalGainLoss / totalInvestment : null;

  return {
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    totalGainLossPct,
    lastUpdated: new Date().toISOString(),
  };
}

export function formatCurrency(value: number | null, compact = false): string {
  if (value === null) return "—";
  if (compact) {
    if (Math.abs(value) >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)}Cr`;
    if (Math.abs(value) >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)}L`;
    if (Math.abs(value) >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatPct(value: number | null): string {
  if (value === null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(2)}%`;
}

export function formatNumber(value: number | null, decimals = 2): string {
  if (value === null) return "—";
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}
