import { useState, useEffect, useCallback } from "react";
import { formatCurrencyPlain, formatCurrency } from "@/lib/format";
import { useNavigate } from "react-router-dom";

// ─── Bot configurations ───────────────────────────────────────────────────────
const BOTS = [
  {
    id: "v1",
    name: "NeuroTrade v1.0",
    emoji: "🤖",
    subtitle: "News Sentiment · 10 stocks",
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/10",
    dot: "bg-blue-400",
    path: "/bot-v1",
    sb_url: "https://lgrllhsfgvnngtmlwwug.supabase.co",
    sb_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncmxsaHNmZ3Zubmd0bWx3d3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU5NTM4NiwiZXhwIjoyMDg3MTcxMzg2fQ.zXnxQ9C6xuOWibkmXRcVelUKmuQNqNxFvv4d7bp2ZHw",
  },
  {
    id: "v2",
    name: "NeuroTrade v2.0",
    emoji: "⚡",
    subtitle: "Technical · 21 simboluri · 24/7",
    color: "text-accent",
    border: "border-accent/20",
    bg: "bg-accent/10",
    dot: "bg-accent",
    path: "/bot-v2",
    sb_url: "https://qvzupovzynuqqmcmdvou.supabase.co",
    sb_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2enVwb3Z6eW51cXFtY21kdm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxNTMzMSwiZXhwIjoyMDg4NzkxMzMxfQ.pd9SqoI3V0Q4qLc_R64pSaF_sexqeb9MT-9vFKRETt0",
  },
  {
    id: "v3",
    name: "NeuroTrade v3.0",
    emoji: "🚀",
    subtitle: "Știri + Tehnic · 27 simboluri · VIX",
    color: "text-purple-400",
    border: "border-purple-500/20",
    bg: "bg-purple-500/10",
    dot: "bg-purple-400",
    path: "/bot-v3",
    sb_url: "https://zawhuoshdefyznqmjphh.supabase.co",
    sb_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2h1b3NoZGVmeXpucW1qcGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyNDU3NywiZXhwIjoyMDg4OTAwNTc3fQ.WK6J0-FIBndW1nb-XgS60bunFxwQFN2K3kzQ7E9X0g4",
  },
  {
    id: "omega",
    name: "OMEGA",
    emoji: "⚡",
    subtitle: "Market Regime · 36 simboluri · Auto-tune",
    color: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
    path: "/bot-omega",
    sb_url: "https://qvzupovzynuqqmcmdvou.supabase.co",
    sb_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2enVwb3Z6eW51cXFtY21kdm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxNTMzMSwiZXhwIjoyMDg4NzkxMzMxfQ.pd9SqoI3V0Q4qLc_R64pSaF_sexqeb9MT-9vFKRETt0",
  },
  {
    id: "zeus",
    name: "ZEUS",
    emoji: "🌩️",
    subtitle: "High-Conviction · 10 max pos",
    color: "text-yellow-400",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/10",
    dot: "bg-yellow-400",
    path: "/bot-zeus",
    sb_url: "https://zawhuoshdefyznqmjphh.supabase.co",
    sb_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2h1b3NoZGVmeXpucW1qcGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyNDU3NywiZXhwIjoyMDg4OTAwNTc3fQ.WK6J0-FIBndW1nb-XgS60bunFxwQFN2K3kzQ7E9X0g4",
  },
  {
    id: "apollo",
    name: "APOLLO",
    emoji: "☀️",
    subtitle: "Precision · Defensiv",
    color: "text-orange-400",
    border: "border-orange-500/20",
    bg: "bg-orange-500/10",
    dot: "bg-orange-400",
    path: "/bot-apollo",
    sb_url: "https://zawhuoshdefyznqmjphh.supabase.co",
    sb_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2h1b3NoZGVmeXpucW1qcGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyNDU3NywiZXhwIjoyMDg4OTAwNTc3fQ.WK6J0-FIBndW1nb-XgS60bunFxwQFN2K3kzQ7E9X0g4",
  },
  {
    id: "hermes",
    name: "HERMES",
    emoji: "🪄",
    subtitle: "Kraken Crypto · 24/7",
    color: "text-cyan-400",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/10",
    dot: "bg-cyan-400",
    path: "/bot-hermes",
    sb_url: "https://qvzupovzynuqqmcmdvou.supabase.co",
    sb_key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2enVwb3Z6eW51cXFtY21kdm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxNTMzMSwiZXhwIjoyMDg4NzkxMzMxfQ.pd9SqoI3V0Q4qLc_R64pSaF_sexqeb9MT-9vFKRETt0",
  },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface BotSnapshot {
  equity: number;
  pnl: number;
  pnl_pct: number;
  open_positions: number;
  total_trades: number;
  total_pl: number;
  safe_mode: boolean;
  updated_at: string;
}

interface BotData {
  id: string;
  snapshot: BotSnapshot | null;
  loading: boolean;
  error: boolean;
  lastUpdate: Date | null;
}

async function fetchBotSnapshot(sb_url: string, sb_key: string): Promise<BotSnapshot | null> {
  try {
    const url = `${sb_url}/rest/v1/portfolio_snapshot?select=*&limit=1`;
    const res = await fetch(url, { headers: { apikey: sb_key, Authorization: `Bearer ${sb_key}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FleetOverview() {
  const navigate = useNavigate();
  const [botData, setBotData] = useState<Record<string, BotData>>(() =>
    Object.fromEntries(BOTS.map(b => [b.id, { id: b.id, snapshot: null, loading: true, error: false, lastUpdate: null }]))
  );
  const [lastFleetUpdate, setLastFleetUpdate] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    const results = await Promise.all(
      BOTS.map(async (bot) => {
        const snapshot = await fetchBotSnapshot(bot.sb_url, bot.sb_key);
        return { id: bot.id, snapshot, loading: false, error: snapshot === null, lastUpdate: new Date() };
      })
    );
    setBotData(Object.fromEntries(results.map(r => [r.id, r])));
    setLastFleetUpdate(new Date());
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 15000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  // Aggregate stats
  const loadedBots = BOTS.filter(b => !botData[b.id]?.loading && botData[b.id]?.snapshot);
  const totalEquity = loadedBots.reduce((sum, b) => sum + (botData[b.id]?.snapshot?.equity ?? 0), 0);
  const totalPnl = loadedBots.reduce((sum, b) => sum + (botData[b.id]?.snapshot?.pnl ?? 0), 0);
  const totalPl = loadedBots.reduce((sum, b) => sum + (botData[b.id]?.snapshot?.total_pl ?? 0), 0);
  const totalPositions = loadedBots.reduce((sum, b) => sum + (botData[b.id]?.snapshot?.open_positions ?? 0), 0);
  const totalTrades = loadedBots.reduce((sum, b) => sum + (botData[b.id]?.snapshot?.total_trades ?? 0), 0);
  const activeBots = BOTS.filter(b => !botData[b.id]?.snapshot?.safe_mode && !botData[b.id]?.error).length;
  const safeBots = BOTS.filter(b => botData[b.id]?.snapshot?.safe_mode).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border border-accent/20 rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">🛸</div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Fleet <span className="text-accent">Overview</span></h1>
              <p className="text-sm text-muted-foreground font-body">Toți 7 boții · Status agregat în timp real</p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono text-accent">{activeBots}/7 activi</span>
            </div>
            {safeBots > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                ⚠️ {safeBots} safe mode
              </span>
            )}
            {lastFleetUpdate && (
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                sync {lastFleetUpdate.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: "Total Equity (flota)", val: loadedBots.length > 0 ? formatCurrencyPlain(totalEquity) : "—", sub: <span className={`text-sm font-mono ${totalPnl >= 0 ? "text-accent" : "text-danger"}`}>{totalPnl >= 0 ? "↑" : "↓"} {formatCurrency(totalPnl)}</span>, color: "" },
          { label: "Total P&L realizat", val: totalPl !== 0 ? `${totalPl >= 0 ? "+" : ""}${totalPl.toFixed(2)}$` : "—", sub: <span className="text-xs text-muted-foreground">across all bots</span>, color: totalPl > 0 ? "text-accent" : totalPl < 0 ? "text-danger" : "" },
          { label: "Poziții deschise", val: String(totalPositions), sub: <span className="text-xs text-muted-foreground">across all bots</span>, color: "" },
          { label: "Total Trades", val: String(totalTrades), sub: <span className="text-xs text-muted-foreground">all bots combined</span>, color: "" },
          { label: "Boți activi", val: `${activeBots}/7`, sub: <span className="text-xs text-muted-foreground">{safeBots > 0 ? `${safeBots} în safe mode` : "Toți operaționali"}</span>, color: activeBots === 7 ? "text-accent" : activeBots >= 5 ? "text-yellow-400" : "text-danger" },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
            <p className="text-xs text-muted-foreground font-body mb-1">{card.label}</p>
            <p className={`text-2xl font-mono font-semibold ${card.color}`}>{card.val}</p>
            <div className="mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Bot Cards Grid */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-4">Status flotă</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BOTS.map((bot) => {
            const data = botData[bot.id];
            const snap = data?.snapshot;
            const isLoading = data?.loading ?? true;
            const isSafeMode = snap?.safe_mode ?? false;
            const equity = snap?.equity ?? 0;
            const pnl = snap?.pnl ?? 0;
            const pnlPct = snap?.pnl_pct ?? 0;
            const openPos = snap?.open_positions ?? 0;
            const totalPl = snap?.total_pl ?? 0;

            return (
              <button
                key={bot.id}
                onClick={() => navigate(bot.path)}
                className={`bg-card border ${bot.border} rounded-2xl p-5 shadow-lg shadow-black/20 text-left w-full hover:bg-card-hover/50 transition-all duration-150 hover:shadow-xl cursor-pointer group`}
              >
                {/* Bot header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bot.bg} border ${bot.border} flex items-center justify-center text-xl`}>
                      {bot.emoji}
                    </div>
                    <div>
                      <p className={`font-heading font-bold text-base ${bot.color}`}>{bot.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{bot.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isLoading ? (
                      <div className="w-14 h-4 bg-card-hover rounded animate-pulse" />
                    ) : isSafeMode ? (
                      <span className="text-xs font-mono text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">⚠️ SAFE</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${bot.dot} animate-pulse`} />
                        <span className={`text-xs font-mono ${bot.color}`}>LIVE</span>
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground/50 font-mono group-hover:text-muted-foreground transition-colors">→ detalii</span>
                  </div>
                </div>

                {/* Stats */}
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-7 bg-card-hover rounded animate-pulse" />
                    <div className="h-4 bg-card-hover rounded animate-pulse w-3/4" />
                  </div>
                ) : snap === null ? (
                  <div className="py-2">
                    <p className="text-sm text-muted-foreground">Nu s-a putut conecta la Supabase.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-body">Equity</p>
                        <p className="text-xl font-mono font-semibold">{equity > 0 ? formatCurrencyPlain(equity) : "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-body">P&L Session</p>
                        <p className={`text-base font-mono font-semibold ${pnl >= 0 ? "text-accent" : "text-danger"}`}>
                          {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}$ <span className="text-xs opacity-70">({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border-subtle/50">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-body">Poziții</p>
                        <p className="text-sm font-mono font-semibold">{openPos}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-body">Total Trades</p>
                        <p className="text-sm font-mono font-semibold">{snap.total_trades ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-body">P&L Total</p>
                        <p className={`text-sm font-mono font-semibold ${totalPl >= 0 ? "text-accent" : "text-danger"}`}>
                          {totalPl >= 0 ? "+" : ""}{totalPl.toFixed(2)}$
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fleet comparison table */}
      <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
        <h2 className="text-lg font-heading font-semibold mb-4">Comparație flotă</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                {["Bot", "Status", "Equity", "P&L Session", "P&L Total", "Poziții", "Trades"].map(h => (
                  <th key={h} className={`py-2 px-3 text-xs text-muted-foreground font-body font-normal ${["Equity", "P&L Session", "P&L Total"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BOTS.map((bot) => {
                const data = botData[bot.id];
                const snap = data?.snapshot;
                const isLoading = data?.loading ?? true;
                const isSafe = snap?.safe_mode ?? false;
                const pnl = snap?.pnl ?? 0;
                const totalPl = snap?.total_pl ?? 0;

                return (
                  <tr
                    key={bot.id}
                    className="border-b border-border-subtle/50 hover:bg-card-hover/30 transition-colors cursor-pointer"
                    onClick={() => navigate(bot.path)}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span>{bot.emoji}</span>
                        <span className={`font-mono font-semibold text-sm ${bot.color}`}>{bot.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {isLoading ? (
                        <div className="w-14 h-4 bg-card-hover rounded animate-pulse" />
                      ) : isSafe ? (
                        <span className="text-xs text-yellow-400 font-mono">⚠️ SAFE</span>
                      ) : snap === null ? (
                        <span className="text-xs text-danger font-mono">⛔ ERR</span>
                      ) : (
                        <span className={`text-xs font-mono ${bot.color} flex items-center gap-1.5`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${bot.dot}`} />LIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {isLoading ? "..." : snap?.equity ? formatCurrencyPlain(snap.equity) : "—"}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono ${pnl >= 0 ? "text-accent" : "text-danger"}`}>
                      {isLoading ? "..." : snap ? `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}$` : "—"}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono ${totalPl >= 0 ? "text-accent" : "text-danger"}`}>
                      {isLoading ? "..." : snap ? `${totalPl >= 0 ? "+" : ""}${totalPl.toFixed(2)}$` : "—"}
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-muted-foreground">
                      {isLoading ? "..." : snap?.open_positions ?? "—"}
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-muted-foreground">
                      {isLoading ? "..." : snap?.total_trades ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
