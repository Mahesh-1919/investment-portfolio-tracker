"use client";

import { StockHolding } from "@/types/portfolio";
import { formatCurrency, formatPct, formatNumber } from "@/lib/portfolioUtils";
import clsx from "clsx";
import { AlertTriangle, Star } from "lucide-react";

interface StockRowProps {
  holding: StockHolding;
  rank: number;
}

export function StockRow({ holding, rank }: StockRowProps) {
  const isPositive = (holding.gainLoss ?? 0) >= 0;
  const hasLiveData = holding.cmp !== null;
  const shouldExit = holding.exitFlag?.toLowerCase().includes("exit");

  return (
    <tr
      className={clsx(
        "border-b border-slate-800/60 transition-colors hover:bg-slate-800/40 group",
        shouldExit && "opacity-75"
      )}
    >
      <td className="px-3 py-2.5 text-center text-xs text-slate-600 tabular-nums">
        {rank}
      </td>

      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-200 text-sm">
                {holding.particulars}
              </span>
              {holding.isCoreHolding && (
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              )}
              {shouldExit && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-medium">
                  Exit
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {holding.nseCode}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-2.5 text-right text-sm tabular-nums text-slate-400 font-mono">
        {formatCurrency(holding.purchasePrice)}
      </td>

      <td className="px-4 py-2.5 text-right text-sm tabular-nums text-slate-300 font-mono">
        {holding.qty.toLocaleString("en-IN")}
      </td>

      <td className="px-4 py-2.5 text-right text-sm tabular-nums text-slate-300 font-mono">
        {formatCurrency(holding.investment)}
      </td>

      <td className="px-4 py-2.5 text-right text-sm tabular-nums text-slate-400">
        <div className="flex items-center justify-end gap-2">
          <div className="w-12 h-1.5 rounded-full bg-slate-700 overflow-hidden hidden sm:block">
            <div
              className="h-full rounded-full bg-slate-400"
              style={{ width: `${Math.min(holding.portfolioPct * 100 * 3, 100)}%` }}
            />
          </div>
          <span>{(holding.portfolioPct * 100).toFixed(1)}%</span>
        </div>
      </td>

      <td className="px-4 py-2.5 text-right">
        {hasLiveData ? (
          <span className="text-sm tabular-nums text-white font-mono font-medium">
            {formatCurrency(holding.cmp)}
          </span>
        ) : (
          <span className="text-xs text-slate-600 flex items-center justify-end gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
            Live...
          </span>
        )}
      </td>

      <td className="px-4 py-2.5 text-right text-sm tabular-nums font-mono">
        {hasLiveData ? (
          <span className="text-slate-200">
            {formatCurrency(holding.presentValue)}
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>

      <td className="px-4 py-2.5 text-right">
        {hasLiveData ? (
          <div className="flex flex-col items-end">
            <span
              className={clsx(
                "text-sm tabular-nums font-mono font-semibold",
                isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(holding.gainLoss)}
            </span>
            <span
              className={clsx(
                "text-xs tabular-nums",
                isPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {formatPct(holding.gainLossPct)}
            </span>
          </div>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>

      <td className="px-4 py-2.5 text-right text-sm tabular-nums text-slate-400 font-mono">
        {holding.peRatio !== null ? formatNumber(holding.peRatio, 2) : "—"}
      </td>

      <td className="px-4 py-2.5 text-right text-sm tabular-nums text-slate-400 font-mono">
        {holding.latestEarnings !== null
          ? formatNumber(holding.latestEarnings, 2)
          : "—"}
      </td>
    </tr>
  );
}
