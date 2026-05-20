"use client";

import { SectorSummary } from "@/types/portfolio";
import { formatCurrency, formatPct } from "@/lib/portfolioUtils";
import clsx from "clsx";
import {
  Building2,
  Cpu,
  ShoppingCart,
  Zap,
  Wrench,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";

const SECTOR_META: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  "Financial Sector": {
    icon: Building2,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  "Tech Sector": {
    icon: Cpu,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  Consumer: {
    icon: ShoppingCart,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  Power: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  "Pipe Sector": {
    icon: Wrench,
    color: "text-teal-400",
    bg: "bg-teal-400/10",
  },
  Others: {
    icon: LayoutGrid,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
  },
};

interface SectorHeaderProps {
  sector: SectorSummary;
  isOpen: boolean;
  onToggle: () => void;
  colSpan: number;
}

export function SectorHeader({
  sector,
  isOpen,
  onToggle,
  colSpan,
}: SectorHeaderProps) {
  const meta = SECTOR_META[sector.sector] ?? SECTOR_META["Others"];
  const Icon = meta.icon;
  const isPositive = (sector.gainLoss ?? 0) >= 0;

  return (
    <tr
      className="cursor-pointer select-none hover:brightness-110 transition-all"
      onClick={onToggle}
    >
      <td
        colSpan={colSpan}
        className="px-4 py-3 bg-slate-800/60 border-y border-slate-700/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={clsx("p-1.5 rounded-md", meta.bg)}>
              <Icon className={clsx("w-4 h-4", meta.color)} />
            </span>
            <span className={clsx("font-semibold text-sm", meta.color)}>
              {sector.sector}
            </span>
            <span className="text-slate-500 text-xs">
              {sector.holdings.length} holdings
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Invested</p>
              <p className="text-slate-300 font-mono font-medium tabular-nums">
                {formatCurrency(sector.totalInvestment)}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Present</p>
              <p className="text-slate-300 font-mono font-medium tabular-nums">
                {formatCurrency(sector.totalPresentValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Gain/Loss</p>
              <p
                className={clsx(
                  "font-mono font-semibold tabular-nums text-sm",
                  isPositive ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {formatCurrency(sector.gainLoss)}{" "}
                <span className="text-xs opacity-75">
                  ({formatPct(sector.gainLossPct)})
                </span>
              </p>
            </div>
            <ChevronDown
              className={clsx(
                "w-4 h-4 text-slate-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </div>
      </td>
    </tr>
  );
}
