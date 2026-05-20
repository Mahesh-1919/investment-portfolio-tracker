import { NextResponse } from "next/server";
import { buildSeedPortfolio } from "@/lib/portfolioData";
import { fetchLivePrices } from "@/lib/yahooFetcher";
import { mergeWithLivePrices, groupBySector, computePortfolioStats } from "@/lib/portfolioUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const seedHoldings = buildSeedPortfolio();
    const symbols = seedHoldings.map((h) => h.yahooSymbol);
    const livePrices = await fetchLivePrices(symbols);
    const enrichedHoldings = mergeWithLivePrices(seedHoldings, livePrices);
    const sectors = groupBySector(enrichedHoldings);
    const stats = computePortfolioStats(enrichedHoldings);

    const successCount = livePrices.filter((p) => p.cmp !== null).length;
    const errorCount = livePrices.filter((p) => p.error).length;

    return NextResponse.json({
      success: true,
      data: {
        holdings: enrichedHoldings,
        sectors,
        stats,
        meta: {
          totalSymbols: symbols.length,
          liveDataReceived: successCount,
          errors: errorCount,
          timestamp: new Date().toISOString(),
          note: null,
        },
      },
    });
  } catch (error) {
    console.error("[Portfolio API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolio data. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
