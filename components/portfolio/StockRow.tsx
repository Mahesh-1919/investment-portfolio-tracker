"use client";

import { StockHolding } from "@/types/portfolio";
import { formatCurrency, formatPct, formatNumber } from "@/lib/portfolioUtils";
import clsx from "clsx";
import { Star, Newspaper, ExternalLink } from "lucide-react";
import { Sparkline } from "./Sparkline";

interface StockRowProps {
  holding: StockHolding;
  rank: number;
}

export function StockRow({ holding, rank }: StockRowProps) {
  const isPositive = (holding.gainLoss ?? 0) >= 0;
  const hasLiveData = holding.cmp !== null;

  return (
    <tr
      className="border-b border-slate-800/60 transition-colors hover:bg-slate-800/40 group"
    >
      <td className="px-3 py-2.5 text-center text-xs text-slate-600 tabular-nums">
        {rank}
      </td>

      <td className="px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-slate-200 text-sm truncate max-w-[120px]">
                {holding.particulars}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {holding.nseCode}
            </span>
          </div>

          {/* Sparkline & News */}
          <div className="flex items-center gap-3 shrink-0">
            {holding.sparkline && holding.sparkline.length > 0 ? (
              <div className="opacity-60 group-hover:opacity-100 transition-opacity w-16 h-8">
                <Sparkline
                  data={holding.sparkline}
                  color={isPositive ? "#34d399" : "#f87171"}
                />
              </div>
            ) : (
              <div className="w-16 h-8 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-800" />
              </div>
            )}
            {holding.news && holding.news.length > 0 && (
              <div className="relative group/news shrink-0">
                <Newspaper className="w-3.5 h-3.5 text-slate-500 hover:text-sky-400 cursor-help transition-colors" />
                <div className="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-lg bg-slate-800 border border-slate-700 shadow-2xl opacity-0 invisible group-hover/news:opacity-100 group-hover/news:visible transition-all z-50 pointer-events-none group-hover/news:pointer-events-auto">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Latest News</p>
                  <div className="space-y-2">
                    {holding.news.map((item, i) => (
                      <a
                        key={i}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-slate-300 hover:text-sky-400 transition-colors border-b border-slate-700/50 pb-2 last:border-0 last:pb-0"
                      >
                        <p className="line-clamp-2 leading-snug">{item.title}</p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                          <span>{item.publisher}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
