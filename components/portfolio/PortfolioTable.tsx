"use client";

import React,{ useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { SectorSummary, StockHolding } from "@/types/portfolio";
import { SectorHeader } from "./SectorHeader";
import { StockRow } from "./StockRow";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import clsx from "clsx";

interface PortfolioTableProps {
  sectors: SectorSummary[];
}

const COL_SPAN = 11;

// Column definitions for react-table (used for header sorting only)
const columns: ColumnDef<StockHolding>[] = [
  { accessorKey: "id", header: "#", size: 40 },
  { accessorKey: "particulars", header: "Stock" },
  { accessorKey: "purchasePrice", header: "Buy Price" },
  { accessorKey: "qty", header: "Qty" },
  { accessorKey: "investment", header: "Invested" },
  { accessorKey: "portfolioPct", header: "Weight" },
  { accessorKey: "cmp", header: "CMP" },
  { accessorKey: "presentValue", header: "Present Value" },
  { accessorKey: "gainLoss", header: "Gain/Loss" },
  { accessorKey: "peRatio", header: "P/E (TTM)" },
  { accessorKey: "latestEarnings", header: "EPS" },
];

export function PortfolioTable({ sectors }: PortfolioTableProps) {
  // Track which sectors are open (all open by default)
  const [openSectors, setOpenSectors] = useState<Set<string>>(
    new Set(sectors.map((s) => s.sector))
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");

  const toggleSector = (sector: string) => {
    setOpenSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) {
        next.delete(sector);
      } else {
        next.add(sector);
      }
      return next;
    });
  };

  // Filter and flatten all holdings for sort state management via react-table
  const filteredSectors = useMemo(() => {
    if (!search) return sectors;
    const term = search.toLowerCase();
    return sectors
      .map((s) => ({
        ...s,
        holdings: s.holdings.filter(
          (h) =>
            h.particulars.toLowerCase().includes(term) ||
            h.nseCode.toLowerCase().includes(term)
        ),
      }))
      .filter((s) => s.holdings.length > 0);
  }, [sectors, search]);

  const allHoldings = useMemo(
    () => filteredSectors.flatMap((s) => s.holdings),
    [filteredSectors]
  );

  const table = useReactTable({
    data: allHoldings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Map sorted row ids to their sort rank
  const sortedIds = useMemo(() => {
    return table.getRowModel().rows.map((r) => r.original.id);
  }, [table]);

  const sortedRankMap = useMemo(() => {
    const map = new Map<number, number>();
    sortedIds.forEach((id, idx) => map.set(id, idx + 1));
    return map;
  }, [sortedIds]);

  // Sort holdings within each sector according to table sort state
  const sortedSectors = useMemo(() => {
    if (sorting.length === 0) return filteredSectors;

    return filteredSectors.map((sector) => ({
      ...sector,
      holdings: [...sector.holdings].sort((a, b) => {
        for (const sort of sorting) {
          const key = sort.id as keyof StockHolding;
          const aVal = a[key] as number | null;
          const bVal = b[key] as number | null;
          if (aVal === null && bVal === null) continue;
          if (aVal === null) return sort.desc ? -1 : 1;
          if (bVal === null) return sort.desc ? 1 : -1;
          if (aVal < bVal) return sort.desc ? 1 : -1;
          if (aVal > bVal) return sort.desc ? -1 : 1;
        }
        return 0;
      }),
    }));
  }, [filteredSectors, sorting]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search stocks by name or symbol..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {/* Sticky header */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-900 border-b border-slate-700/50">
                {table.getHeaderGroups()[0].headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={clsx(
                        "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500",
                        "whitespace-nowrap select-none",
                        header.id === "id" ? "text-center w-10" : "text-right",
                        header.id === "particulars" && "text-left",
                        "cursor-pointer hover:text-slate-300 transition-colors"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className="flex items-center gap-1 justify-end">
                        {header.id === "particulars" && (
                          <span className="justify-start">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                        )}
                        {header.id !== "particulars" && (
                          <>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </>
                        )}
                        {isSorted === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-sky-400" />
                        ) : isSorted === "desc" ? (
                          <ArrowDown className="w-3 h-3 text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="bg-slate-900/50">
              {sortedSectors.map((sector) => {
                const isOpen = openSectors.has(sector.sector);
                return (
                  <React.Fragment key={`sector-${sector.sector}`}>
                    <SectorHeader
                      sector={sector}
                      isOpen={isOpen}
                      onToggle={() => toggleSector(sector.sector)}
                      colSpan={COL_SPAN}
                    />
                    {isOpen &&
                      sector.holdings.map((holding, idx) => (
                        <StockRow
                          key={holding.id}
                          holding={holding}
                          rank={
                            sorting.length > 0
                              ? (sortedRankMap.get(holding.id) ?? idx + 1)
                              : idx + 1
                          }
                        />
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


