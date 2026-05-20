"use client";

import { usePortfolio } from "@/hooks/usePortfolio";
import { DashboardHeader } from "@/components/portfolio/DashboardHeader";
import { StatsCards } from "@/components/portfolio/StatsCards";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { SectorChart } from "@/components/portfolio/SectorChart";
import { GainLossChart } from "@/components/portfolio/GainLossChart";
import { LoadingSkeleton } from "@/components/portfolio/LoadingSkeleton";
import { AlertCircle, Info } from "lucide-react";

export default function DashboardPage() {
  const { data, loading, error, lastUpdated, refresh, isRefreshing, countdown } = usePortfolio();

  const liveCount = data?.holdings.filter((h) => h.cmp !== null).length ?? 0;
  const totalCount = data?.holdings.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <DashboardHeader
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          countdown={countdown}
          liveCount={liveCount}
          totalCount={totalCount}
          hasError={!!error}
        />

        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Failed to fetch live data</p>
              <p className="text-rose-500 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}


        {loading && <LoadingSkeleton />}

        {!loading && data && (
          <div className="space-y-5">
            <StatsCards stats={data.stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SectorChart sectors={data.sectors} totalInvestment={data.stats.totalInvestment} />
              <GainLossChart holdings={data.holdings} />
            </div>
            {data.meta.note && (
              <div className="flex items-center gap-2 text-xs text-amber-500 px-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {data.meta.note}
              </div>
            )}
            <PortfolioTable sectors={data.sectors} />
            <div className="flex items-center justify-between pt-2 text-xs text-slate-700 border-t border-slate-800/60">
              <span>{data.meta.liveDataReceived}/{data.meta.totalSymbols} symbols with live data</span>
              <span>Data as of {new Date(data.meta.timestamp).toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
