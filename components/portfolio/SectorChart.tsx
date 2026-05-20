"use client";

import { SectorSummary } from "@/types/portfolio";
import { formatCurrency } from "@/lib/portfolioUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import clsx from "clsx";

const SECTOR_COLORS: Record<string, string> = {
  "Financial Sector": "#38bdf8",
  "Tech Sector": "#a78bfa",
  Consumer: "#fbbf24",
  Power: "#facc15",
  "Pipe Sector": "#2dd4bf",
  Others: "#94a3b8",
};

interface SectorChartProps {
  sectors: SectorSummary[];
  totalInvestment: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: ChartData }[];
}

interface ChartData {
  name: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  pct: number;
  color: string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isPos = d.gainLoss >= 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-200 mb-2">{d.name}</p>
      <div className="space-y-1 text-slate-400">
        <div className="flex justify-between gap-4">
          <span>Invested</span>
          <span className="text-slate-300 font-mono">
            {formatCurrency(d.investment)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Present</span>
          <span className="text-slate-300 font-mono">
            {formatCurrency(d.presentValue)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Gain/Loss</span>
          <span
            className={clsx(
              "font-mono font-semibold",
              isPos ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {isPos ? "+" : ""}
            {formatCurrency(d.gainLoss)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Weight</span>
          <span className="text-slate-300">{d.pct.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

export function SectorChart({ sectors, totalInvestment }: SectorChartProps) {
  const data: ChartData[] = sectors.map((s) => ({
    name: s.sector.replace(" Sector", ""),
    investment: s.totalInvestment,
    presentValue: s.totalPresentValue ?? s.totalInvestment,
    gainLoss: s.gainLoss ?? 0,
    pct: (s.totalInvestment / totalInvestment) * 100,
    color: SECTOR_COLORS[s.sector] ?? "#94a3b8",
  }));

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
        Sector Allocation
      </h3>

      <div className="flex flex-wrap gap-3 mb-5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-slate-400">{d.name}</span>
            <span className="text-xs text-slate-600">
              {d.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
            width={55}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(148,163,184,0.05)" }}
          />
          <Bar dataKey="investment" name="Invested" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                fillOpacity={0.5}
              />
            ))}
          </Bar>
          <Bar dataKey="presentValue" name="Present" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
