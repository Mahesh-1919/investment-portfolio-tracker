export type Sector =
  | "Financial Sector"
  | "Tech Sector"
  | "Consumer"
  | "Power"
  | "Pipe Sector"
  | "Others";

export interface StockHolding {
  id: number;
  particulars: string;         // Stock name
  purchasePrice: number;
  qty: number;
  investment: number;          // purchasePrice * qty
  portfolioPct: number;        // % of total investment
  nseCode: string;             // NSE/BSE ticker
  yahooSymbol: string;         // yahoo finance symbol (e.g. "HDFCBANK.NS")
  cmp: number | null;          // live, fetched from Yahoo Finance
  presentValue: number | null; // cmp * qty
  gainLoss: number | null;     // presentValue - investment
  gainLossPct: number | null;
  peRatio: number | null;      // P/E TTM from Excel (fallback until live)
  latestEarnings: number | null;
  marketCap: number | null;
  sector: Sector;
  // Extra fundamentals from Excel
  revenue: number | null;
  ebitda: number | null;
  ebitdaPct: number | null;
  pat: number | null;
  debtToEquity: number | null;
  bookValue: number | null;
  isCoreHolding: boolean;      // Stage-2 "Yes" column
  exitFlag?: string;           // "Must exit", "Exit" etc.
  lastUpdated?: string;
}

export interface SectorSummary {
  sector: Sector;
  totalInvestment: number;
  totalPresentValue: number | null;
  gainLoss: number | null;
  gainLossPct: number | null;
  holdings: StockHolding[];
}

export interface PortfolioStats {
  totalInvestment: number;
  totalPresentValue: number | null;
  totalGainLoss: number | null;
  totalGainLossPct: number | null;
  lastUpdated: string;
}

export interface LivePriceResult {
  symbol: string;
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  error?: string;
}
