"use client";

import { RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";
import clsx from "clsx";

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  countdown: number;
  liveCount: number;
  totalCount: number;
  hasError: boolean;
}

export function DashboardHeader({
  lastUpdated,
  onRefresh,
  isRefreshing,
  countdown,
  liveCount,
  totalCount,
  hasError,
}: DashboardHeaderProps) {
  const allLive = liveCount === totalCount && totalCount > 0;
  const someLive = liveCount > 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Portfolio Dashboard
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 ml-9">
          Priyanshu&apos;s Investment Portfolio · NSE / BSE
        </p>
      </div>

      <div className="flex items-center gap-3 ml-9 sm:ml-0">
        <div
          className={clsx(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium",
            allLive
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : someLive
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-slate-800 text-slate-500 border border-slate-700"
          )}
        >
          {allLive ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          {allLive
            ? "All Live"
            : someLive
            ? `${liveCount}/${totalCount} Live`
            : "Fetching..."}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums">
            {countdown}s
          </span>
        </div>

        {lastUpdated && (
          <span className="text-xs text-slate-600 hidden md:block">
            Updated {lastUpdated.toLocaleTimeString("en-IN")}
          </span>
        )}

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <RefreshCw
            className={clsx("w-3.5 h-3.5", isRefreshing && "animate-spin")}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}
