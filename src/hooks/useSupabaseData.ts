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

export interface CycleLog {
  id: string;
  cycle: number;
  level: string;
  message: string;
  timestamp: string;
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

async function fetchTable<T>(table: string, order?: string, limit?: number): Promise<T[]> {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  const res = await fetch(url, {
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
        fetchTable<Trade>("trades", "timestamp.desc", 100),
        fetchTable<CycleLog>("cycle_logs", "timestamp.desc", 200),
      ]);
      const snap = p?.[0] ?? null;
      setPortfolio(snap);
      setPositions(pos ?? []);
      setSignals(sig ?? []);
      setTrades(tr ?? []);
      // Deduplicate logs by id to prevent duplicates from realtime + polling overlap
      setLogs((prev) => {
        const incoming = lg ?? [];
        const existingIds = new Set(prev.map((l) => l.id));
        const merged = [
          ...incoming,
          ...prev.filter((l) => !incoming.some((i) => i.id === l.id)),
        ];
        // Sort by timestamp desc, keep latest 200
        return merged
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 200);
      });
      setConnectionError(false);
      if (snap?.equity != null) {
        setEquityHistory((prev) => {
          const next = [...prev, snap.equity!];
          return next.length > 40 ? next.slice(-40) : next;
        });
      }
      setLastUpdate(new Date());
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
      .channel("neurotrade-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "portfolio_snapshot" }, (payload) => {
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
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "open_positions" }, () => {
        fetchTable<Position>("open_positions").then(setPositions).catch(() => {});
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "signals" }, () => {
        fetchTable<Signal>("signals").then(setSignals).catch(() => {});
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trades" }, (payload) => {
        setTrades((prev) => [payload.new as Trade, ...prev].slice(0, 100));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "cycle_logs" }, (payload) => {
        const newLog = payload.new as CycleLog;
        setLogs((prev) => {
          if (prev.some((l) => l.id === newLog.id)) return prev; // skip duplicate
          return [newLog, ...prev].slice(0, 200);
        });
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  return { portfolio, positions, signals, trades, logs, equityHistory, loading, lastUpdate, isSyncing, connectionError, refresh: fetchAll };
}
