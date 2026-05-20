"use client";

import { PortfolioStats } from "@/types/portfolio";
import { formatCurrency, formatPct } from "@/lib/portfolioUtils";
import { TrendingUp, TrendingDown, Wallet, BarChart2 } from "lucide-react";
import clsx from "clsx";

interface StatsCardsProps {
  stats: PortfolioStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const isPositive = (stats.totalGainLoss ?? 0) >= 0;

  const cards = [
    {
      label: "Total Invested",
      value: formatCurrency(stats.totalInvestment),
      sub: "Cost basis",
      icon: Wallet,
      color: "text-sky-400",
      bg: "bg-sky-400/10 border-sky-400/20",
    },
    {
      label: "Present Value",
      value: formatCurrency(stats.totalPresentValue),
      sub: "Market value",
      icon: BarChart2,
      color: "text-violet-400",
      bg: "bg-violet-400/10 border-violet-400/20",
    },
    {
      label: "Total Gain / Loss",
      value: formatCurrency(stats.totalGainLoss),
      sub: formatPct(stats.totalGainLossPct),
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-emerald-400" : "text-rose-400",
      bg: isPositive
        ? "bg-emerald-400/10 border-emerald-400/20"
        : "bg-rose-400/10 border-rose-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={clsx(
            "rounded-xl border p-5 flex items-start gap-4",
            card.bg
          )}
        >
          <div className={clsx("p-2 rounded-lg", card.bg)}>
            <card.icon className={clsx("w-5 h-5", card.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
              {card.label}
            </p>
            <p className={clsx("text-xl font-bold tabular-nums", card.color)}>
              {card.value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
