"use client";

import { StockHolding } from "@/types/portfolio";
import { formatCurrency } from "@/lib/portfolioUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface GainLossChartProps {
  holdings: StockHolding[];
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { name: string; gainLoss: number; gainLossPct: number } }[];
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isPos = d.gainLoss >= 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-200 mb-1">{d.name}</p>
      <p className={isPos ? "text-emerald-400" : "text-rose-400"}>
        {isPos ? "+" : ""}{formatCurrency(d.gainLoss)}
      </p>
      <p className="text-slate-500">
        {isPos ? "+" : ""}{(d.gainLossPct * 100).toFixed(2)}%
      </p>
    </div>
  );
}

export function GainLossChart({ holdings }: GainLossChartProps) {
  // Only show holdings that have live data
  const liveHoldings = holdings.filter((h) => h.gainLoss !== null);

  // Sort by gain/loss and take top 8 + bottom 5
  const sorted = [...liveHoldings].sort(
    (a, b) => (b.gainLoss ?? 0) - (a.gainLoss ?? 0)
  );

  const top = sorted.slice(0, 5);
  const bottom = sorted.slice(-5).reverse();
  const display = [...top, ...bottom].filter(
    (h, i, arr) => arr.findIndex((x) => x.id === h.id) === i
  );

  const data = display.map((h) => ({
    name: h.particulars.length > 12
      ? h.particulars.slice(0, 12) + "…"
      : h.particulars,
    gainLoss: h.gainLoss ?? 0,
    gainLossPct: h.gainLossPct ?? 0,
    color: (h.gainLoss ?? 0) >= 0 ? "#34d399" : "#f87171",
  }));

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5 flex items-center justify-center h-48">
        <p className="text-slate-600 text-sm">Waiting for live data...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
        Gain / Loss by Stock
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={14}>
          <XAxis
            type="number"
            tick={{ fontSize: 9, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={85}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.05)" }} />
          <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
          <Bar dataKey="gainLoss" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
