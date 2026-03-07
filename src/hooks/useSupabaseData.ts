import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const SUPABASE_URL = "https://lgrllhsfgvnngtmlwwug.supabase.co";
const SUPABASE_KEY = "sb_publishable_KtQkZ2_nx8rR65ypG9ZWSw_AjVWWX-N";

interface Portfolio {
  id?: string;
  cycle?: number;
  equity?: number;
  cash?: number;
  buying_power?: number;
  pnl?: number;
  pnl_pct?: number;
  safe_mode?: boolean;
  spy_change_pct?: number;
  market_trend?: string;
  open_positions?: number;
  total_trades?: number;
  total_pl?: number;
  updated_at?: string;
}

interface Position {
  id: string;
  symbol: string;
  qty: number;
  avg_entry: number;
  current_price: number;
  market_value: number;
  unrealized_pl: number;
  unrealized_pct: number;
  stop_loss: number;
  take_profit: number;
  updated_at?: string;
}

interface Signal {
  id: string;
  symbol: string;
  action: string;
  confidence: number;
  price: number;
  rsi?: number;
  macd?: string;
  ema_trend?: string;
  tech_score?: number;
  reasoning?: string;
  risk_level?: string;
  executed?: boolean;
  block_reason?: string;
  updated_at?: string;
}

interface Trade {
  id: string;
  symbol: string;
  action: string;
  qty: number;
  price: number;
  value: number;
  confidence?: number;
  close_type?: string;
  pl?: number;
  order_id?: string;
  timestamp?: string;
}

interface CycleLog {
  id: string;
  level: string;
  message: string;
  timestamp?: string;
}

export interface SupabaseData {
  portfolio: Portfolio | null;
  positions: Position[];
  signals: Signal[];
  trades: Trade[];
  logs: CycleLog[];
  equityHistory: number[];
  loading: boolean;
  lastUpdate: Date | null;
  isSyncing: boolean;
  connectionError: boolean;
  refresh: () => void;
}

async function fetchTable<T>(table: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${table}`);
  return res.json();
}

export default function useSupabaseData(): SupabaseData {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [equityHistory, setEquityHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const isFirst = useRef(true);

  const fetchAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [p, pos, sig, tr, lg] = await Promise.all([
        fetchTable<Portfolio>("portfolio_snapshot"),
        fetchTable<Position>("open_positions"),
        fetchTable<Signal>("signals"),
        fetchTable<Trade>("trades"),
        fetchTable<CycleLog>("cycle_logs"),
      ]);
      const snap = p?.[0] ?? null;
      setPortfolio(snap);
      setPositions(pos ?? []);
      setSignals(sig ?? []);
      setTrades(tr ?? []);
      const sortedLogs = (lg ?? []).sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime());
      setLogs(sortedLogs);
      setConnectionError(false);
      if (snap?.equity != null) {
        setEquityHistory((prev) => {
          const next = [...prev, snap.equity!];
          return next.length > 40 ? next.slice(-40) : next;
        });
      }
      setLastUpdate(new Date());
      if (!isFirst.current) {
        toast.success("Data refreshed", { duration: 1500 });
      }
      isFirst.current = false;
    } catch {
      setConnectionError(true);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);

    const channel = supabase
      .channel("portfolio-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "portfolio_snapshot" },
        (payload) => {
          const snap = payload.new as Portfolio;
          setPortfolio(snap);
          setLastUpdate(new Date());
          setConnectionError(false);
          if (snap?.equity != null) {
            setEquityHistory((prev) => {
              const next = [...prev, snap.equity!];
              return next.length > 40 ? next.slice(-40) : next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return { portfolio, positions, signals, trades, logs, equityHistory, loading, lastUpdate, isSyncing, connectionError, refresh: fetchAll };
}
