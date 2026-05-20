"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { StockHolding, SectorSummary, PortfolioStats } from "@/types/portfolio";

interface PortfolioResponse {
  holdings: StockHolding[];
  sectors: SectorSummary[];
  stats: PortfolioStats;
  meta: {
    totalSymbols: number;
    liveDataReceived: number;
    errors: number;
    timestamp: string;
    note: string | null;
  };
}

interface UsePortfolioReturn {
  data: PortfolioResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
  isRefreshing: boolean;
  countdown: number; // seconds until next auto-refresh
}

const REFRESH_INTERVAL = 15; // seconds

export function usePortfolio(): UsePortfolioReturn {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  const countdownRef = useRef(REFRESH_INTERVAL);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/portfolio", {
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${response.status}`);
      }

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to load portfolio");
      }

      setData(json.data);
      setLastUpdated(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    countdownRef.current = REFRESH_INTERVAL;

    countdownTimerRef.current = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);

      if (countdownRef.current <= 0) {
        countdownRef.current = REFRESH_INTERVAL;
        setCountdown(REFRESH_INTERVAL);
        fetchData();
      }
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchData]);

  const refresh = useCallback(() => {
    // Reset countdown
    countdownRef.current = REFRESH_INTERVAL;
    setCountdown(REFRESH_INTERVAL);
    fetchData(true);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refresh, isRefreshing, countdown };
}
