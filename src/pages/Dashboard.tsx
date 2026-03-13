import { formatCurrencyPlain, formatCurrency, formatPercent } from "@/lib/format";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, BarChart, Bar, Cell } from "recharts";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

// ── Supabase endpoints pentru toți 3 boții ──────────────────
const BOTS = [
  {
    id: "v1",
    label: "NeuroTrade v1",
    emoji: "🤖",
    color: "blue",
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
    url: "https://lgrllhsfgvnngtmlwwug.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncmxsaHNmZ3Zubmd0bWx3d3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU5NTM4NiwiZXhwIjoyMDg3MTcxMzg2fQ.zXnxQ9C6xuOWibkmXRcVelUKmuQNqNxFvv4d7bp2ZHw",
    strategy: "News Sentiment",
    symbols: 10,
    cycle: "5 min",
    status: "deprecated",
    link: "/bot-v1",
  },
  {
    id: "v2",
    label: "NeuroTrade v2",
    emoji: "⚡",
    color: "green",
    colorClass: "text-accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20",
    url: "https://qvzupovzynuqqmcmdvou.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2enVwb3Z6eW51cXFtY21kdm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxNTMzMSwiZXhwIjoyMDg4NzkxMzMxfQ.pd9SqoI3V0Q4qLc_R64pSaF_sexqeb9MT-9vFKRETt0",
    strategy: "Technical Analysis",
    symbols: 21,
    cycle: "5 min",
    status: "live",
    link: "/bot-v2",
  },
  {
    id: "v3",
    label: "NeuroTrade v3",
    emoji: "🚀",
    color: "purple",
    colorClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
    url: "https://zawhuoshdefyznqmjphh.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2h1b3NoZGVmeXpucW1qcGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyNDU3NywiZXhwIjoyMDg4OTAwNTc3fQ.WK6J0-FIBndW1nb-XgS60bunFxwQFN2K3kzQ7E9X0g4",
    strategy: "News + Technical + VIX",
    symbols: 27,
    cycle: "2 min",
    status: "live",
    link: "/bot-v3",
  },
];

async function fetchBotData(bot: typeof BOTS[0]) {
  const headers = { apikey: bot.key, Authorization: `Bearer ${bot.key}` };
  const base = bot.url + "/rest/v1";
  try {
    const [snapRes, tradesRes, signalsRes] = await Promise.all([
      fetch(`${base}/portfolio_snapshot?select=*&limit=1`, { headers }),
      fetch(`${base}/trades?select=*&order=timestamp.desc&limit=50`, { headers }),
      fetch(`${base}/signals?select=*&order=updated_at.desc&limit=5`, { headers }),
    ]);
    const [snap, trades, signals] = await Promise.all([
      snapRes.ok ? snapRes.json() : [],
      tradesRes.ok ? tradesRes.json() : [],
      signalsRes.ok ? signalsRes.json() : [],
    ]);
    return { snapshot: snap?.[0] ?? null, trades: trades ?? [], signals: signals ?? [] };
  } catch {
    return { snapshot: null, trades: [], signals: [] };
  }
}

interface DashboardProps {
  portfolio: any;
  positions: any[];
  signals: any[];
  trades: any[];
  logs: any[];
  equityHistory: number[];
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-card-hover rounded w-24 mb-3" />
      <div className="h-8 bg-card-hover rounded w-32 mb-2" />
      <div className="h-3 bg-card-hover rounded w-20" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "live") return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-accent/10 border border-accent/20 text-accent">
      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />LIVE
    </span>
  );
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
      ⏸ DEPRECATED
    </span>
  );
}

function ActionBadge({ action, color = "green" }: { action: string; color?: string }) {
  const styles: Record<string, string> = {
    BUY: color === "purple" ? "bg-purple-500/10 text-purple-400" : "bg-accent-dim text-accent",
    SELL: "bg-danger-dim text-danger",
    HOLD: "bg-secondary text-muted-foreground",
  };
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[action] ?? styles.HOLD}`}>{action}</span>;
}

function TrendBadge({ trend }: { trend?: string }) {
  const t = (trend ?? "NEUTRAL").toUpperCase();
  const styles: Record<string, string> = {
    BULL: "bg-accent-dim text-accent", BULLISH: "bg-accent-dim text-accent",
    BEAR: "bg-danger-dim text-danger", BEARISH: "bg-danger-dim text-danger",
    VOLATILE: "bg-warning-dim text-warning", NEUTRAL: "bg-secondary text-muted-foreground",
  };
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[t] ?? styles.NEUTRAL}`}>{t}</span>;
}

export default function Dashboard({ portfolio, positions, signals, trades, logs, equityHistory, loading }: DashboardProps) {
  const [botData, setBotData] = useState<Record<string, any>>({});
  const [botsLoading, setBotsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const results = await Promise.all(BOTS.map(async (bot) => {
      const data = await fetchBotData(bot);
      return { id: bot.id, ...data };
    }));
    const map: Record<string, any> = {};
    results.forEach(r => { map[r.id] = r; });
    setBotData(map);
    setBotsLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 15000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  // ── Aggregate KPIs din toți 3 boții ──────────────────────
  const totalEquity = BOTS.reduce((s, b) => s + (botData[b.id]?.snapshot?.equity ?? 0), 0);
  const totalPl = BOTS.reduce((s, b) => s + (botData[b.id]?.snapshot?.total_pl ?? 0), 0);
  const totalTrades = BOTS.reduce((s, b) => {
    const t = botData[b.id]?.trades ?? [];
    return s + (botData[b.id]?.snapshot?.total_trades ?? t.length);
  }, 0);

  const allSellTrades = BOTS.flatMap(b => (botData[b.id]?.trades ?? []).filter((t: any) => t.action === "SELL"));
  const totalWins = allSellTrades.filter((t: any) => (t.pl ?? 0) > 0).length;
  const globalWinRate = allSellTrades.length > 0 ? (totalWins / allSellTrades.length) * 100 : 0;

  const totalOpenPos = BOTS.reduce((s, b) => s + (botData[b.id]?.snapshot?.open_positions ?? 0), 0);

  // ── V1 data pentru equity curve (backward compat) ────────
  const equity = portfolio?.equity ?? 0;
  const pnl = portfolio?.pnl ?? 0;
  const pnlPct = portfolio?.pnl_pct ?? 0;
  const chartData = equityHistory.map((v, i) => ({ idx: i, equity: v }));
  const eqMin = equityHistory.length > 0 ? Math.min(...equityHistory) : 0;
  const eqMax = equityHistory.length > 0 ? Math.max(...equityHistory) : 0;
  const allSame = eqMin === eqMax;

  // ── Comparison bar chart data ─────────────────────────────
  const comparisonData = BOTS.map(b => {
    const snap = botData[b.id]?.snapshot;
    const bt = botData[b.id]?.trades ?? [];
    const sells = bt.filter((t: any) => t.action === "SELL");
    const wins = sells.filter((t: any) => (t.pl ?? 0) > 0).length;
    return {
      name: b.label.replace("NeuroTrade ", ""),
      equity: snap?.equity ?? 0,
      pl: snap?.total_pl ?? 0,
      winRate: sells.length > 0 ? (wins / sells.length) * 100 : 0,
      trades: snap?.total_trades ?? bt.length,
      color: b.color,
    };
  });

  if (loading && botsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Aggregate KPI Row ─────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">Agregat — Toți 3 Boții</h2>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
            <p className="text-xs text-muted-foreground font-body mb-1">Total Equity (3 boți)</p>
            <p className="text-2xl font-mono font-semibold">{botsLoading ? "—" : formatCurrencyPlain(totalEquity)}</p>
            <p className="text-xs text-muted-foreground mt-1">{BOTS.length} portofolii combinate</p>
          </div>

          <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
            <p className="text-xs text-muted-foreground font-body mb-1">Realized P&L (total)</p>
            <p className={`text-2xl font-mono font-semibold ${totalPl >= 0 ? "text-accent" : "text-danger"}`}>
              {botsLoading ? "—" : formatCurrency(totalPl)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">din {totalTrades} trades închise</p>
          </div>

          <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
            <p className="text-xs text-muted-foreground font-body mb-1">Win Rate (global)</p>
            <p className={`text-2xl font-mono font-semibold ${
              botsLoading ? "text-muted-foreground" : globalWinRate >= 50 ? "text-accent" : globalWinRate >= 40 ? "text-warning" : "text-danger"
            }`}>
              {botsLoading ? "—" : `${globalWinRate.toFixed(1)}%`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{totalWins}W / {allSellTrades.length - totalWins}L</p>
          </div>

          <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
            <p className="text-xs text-muted-foreground font-body mb-1">Poziții deschise</p>
            <p className="text-2xl font-mono font-semibold">{botsLoading ? "—" : totalOpenPos}</p>
            <p className="text-xs text-muted-foreground mt-1">pe toți 3 boții activi</p>
          </div>
        </div>
      </div>

      {/* ── Bot Cards (V1 / V2 / V3) ─────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">Status Boți</h2>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {BOTS.map(bot => {
            const snap = botData[bot.id]?.snapshot;
            const bt = botData[bot.id]?.trades ?? [];
            const sells = bt.filter((t: any) => t.action === "SELL");
            const wins = sells.filter((t: any) => (t.pl ?? 0) > 0).length;
            const wr = sells.length > 0 ? (wins / sells.length) * 100 : 0;
            const bEquity = snap?.equity ?? 0;
            const bPl = snap?.total_pl ?? 0;
            const bPnl = snap?.pnl ?? 0;
            const bPnlPct = snap?.pnl_pct ?? 0;
            const bOpen = snap?.open_positions ?? 0;

            return (
              <Link to={bot.link} key={bot.id} className="block group">
                <div className={`bg-card border ${bot.borderClass} rounded-xl p-5 shadow-lg shadow-black/20 hover:bg-card-hover transition-colors duration-200`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-lg ${bot.bgClass} border ${bot.borderClass} flex items-center justify-center text-lg`}>
                        {bot.emoji}
                      </div>
                      <div>
                        <p className={`text-sm font-heading font-bold ${bot.colorClass}`}>{bot.label}</p>
                        <p className="text-xs text-muted-foreground font-body">{bot.strategy}</p>
                      </div>
                    </div>
                    <StatusBadge status={bot.status} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Equity</span>
                      <span className="font-mono font-semibold text-sm">
                        {botsLoading ? "—" : bEquity > 0 ? formatCurrencyPlain(bEquity) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Session P&L</span>
                      <span className={`font-mono text-xs ${bPnl >= 0 ? "text-accent" : "text-danger"}`}>
                        {botsLoading ? "—" : `${bPnl >= 0 ? "↑" : "↓"} ${formatCurrency(bPnl)} (${formatPercent(bPnlPct)})`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Realized P&L</span>
                      <span className={`font-mono text-xs font-semibold ${bPl >= 0 ? "text-accent" : "text-danger"}`}>
                        {botsLoading ? "—" : `${bPl >= 0 ? "+" : ""}${bPl.toFixed(2)}$`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Win Rate</span>
                      <span className={`font-mono text-xs ${wr >= 50 ? "text-accent" : wr >= 40 ? "text-warning" : sells.length === 0 ? "text-muted-foreground" : "text-danger"}`}>
                        {botsLoading || sells.length === 0 ? "—" : `${wr.toFixed(0)}%`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Open / Simboluri</span>
                      <span className="font-mono text-xs">{bOpen} pos · {bot.symbols} sym · {bot.cycle}</span>
                    </div>
                  </div>

                  <div className={`mt-4 pt-3 border-t border-border-subtle flex items-center justify-between`}>
                    <span className="text-xs text-muted-foreground font-body">
                      {snap?.updated_at
                        ? `sync ${new Date(snap.updated_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                        : "Fără date"}
                    </span>
                    <span className={`text-xs ${bot.colorClass} group-hover:underline`}>Vezi detalii →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Comparison + Equity Curve ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Comparison Chart */}
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <div className="mb-4">
            <h3 className="font-heading text-base font-semibold">Comparație Boți</h3>
            <p className="text-xs text-muted-foreground">Equity per bot (paper trading)</p>
          </div>
          {botsLoading ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm animate-pulse">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparisonData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(218,11%,65%)" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ background: "hsl(217,33%,11%)", border: "1px solid hsl(215,19%,17%)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [formatCurrencyPlain(v), "Equity"]}
                />
                <Bar dataKey="equity" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color === "blue" ? "hsl(213,94%,68%)" : entry.color === "purple" ? "hsl(270,80%,70%)" : "hsl(160,84%,39%)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Win Rate comparison */}
          {!botsLoading && (
            <div className="mt-4 space-y-2">
              {comparisonData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-10 font-mono">{d.name}</span>
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 0 ? "bg-blue-400" : i === 1 ? "bg-accent" : "bg-purple-400"}`}
                      style={{ width: `${d.winRate}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                    {d.winRate > 0 ? `${d.winRate.toFixed(0)}%` : "—"}
                  </span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1">Win rate per bot</p>
            </div>
          )}
        </div>

        {/* Equity Curve V1 (din SupabaseDataContext, backward compat) */}
        <div className="lg:col-span-3 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <div className="mb-4">
            <h3 className="font-heading text-base font-semibold">Equity Curve — V1</h3>
            <p className="text-xs text-muted-foreground">Last {equityHistory.length} cycles (Bot V1 — date istorice)</p>
          </div>
          {chartData.length < 2 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Collecting data...</div>
          ) : allSame ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Waiting for equity changes...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160,84%,39%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(160,84%,39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={[eqMin * 0.9995, eqMax * 1.0005]} hide />
                <XAxis dataKey="idx" hide />
                <ReferenceLine
                  y={100000}
                  stroke="hsl(218,11%,65%)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{ value: "Start", position: "left", fill: "hsl(218,11%,65%)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ background: "hsl(217,33%,11%)", border: "1px solid hsl(215,19%,17%)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ display: "none" }}
                  formatter={(v: number) => [formatCurrencyPlain(v), "Equity"]}
                />
                <Area type="monotone" dataKey="equity" stroke="hsl(160,84%,39%)" strokeWidth={2} fill="url(#eqGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Comparison Table ─────────────────────────────── */}
      <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-base font-semibold">Comparison Card — V1 vs V2 vs V3</h3>
            <p className="text-xs text-muted-foreground">Date live din Supabase, refresh la 15s</p>
          </div>
          <button
            onClick={fetchAll}
            className="text-xs text-muted-foreground hover:text-accent transition-colors font-mono flex items-center gap-1.5"
          >
            🔄 Refresh
          </button>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border-subtle text-xs text-muted-foreground">
                <th className="text-left pb-3 font-medium">Metric</th>
                {BOTS.map(b => (
                  <th key={b.id} className={`text-right pb-3 font-medium ${b.colorClass}`}>
                    {b.emoji} {b.label.replace("NeuroTrade ", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Equity",
                  vals: BOTS.map(b => {
                    const eq = botData[b.id]?.snapshot?.equity ?? 0;
                    return eq > 0 ? formatCurrencyPlain(eq) : "—";
                  }),
                },
                {
                  label: "Session P&L",
                  vals: BOTS.map(b => {
                    const p = botData[b.id]?.snapshot?.pnl ?? 0;
                    const pct = botData[b.id]?.snapshot?.pnl_pct ?? 0;
                    return botData[b.id]?.snapshot ? `${p >= 0 ? "+" : ""}${p.toFixed(2)}$ (${formatPercent(pct)})` : "—";
                  }),
                  colors: BOTS.map(b => (botData[b.id]?.snapshot?.pnl ?? 0) >= 0 ? "text-accent" : "text-danger"),
                },
                {
                  label: "Realized P&L",
                  vals: BOTS.map(b => {
                    const pl = botData[b.id]?.snapshot?.total_pl ?? 0;
                    return botData[b.id]?.snapshot ? `${pl >= 0 ? "+" : ""}${pl.toFixed(2)}$` : "—";
                  }),
                  colors: BOTS.map(b => (botData[b.id]?.snapshot?.total_pl ?? 0) >= 0 ? "text-accent" : "text-danger"),
                },
                {
                  label: "Win Rate",
                  vals: BOTS.map(b => {
                    const sells = (botData[b.id]?.trades ?? []).filter((t: any) => t.action === "SELL");
                    const wins = sells.filter((t: any) => (t.pl ?? 0) > 0).length;
                    return sells.length > 0 ? `${((wins / sells.length) * 100).toFixed(0)}%` : "—";
                  }),
                },
                {
                  label: "Total Trades",
                  vals: BOTS.map(b => {
                    const snap = botData[b.id]?.snapshot;
                    const t = botData[b.id]?.trades ?? [];
                    return String(snap?.total_trades ?? t.length);
                  }),
                },
                {
                  label: "Open Positions",
                  vals: BOTS.map(b => String(botData[b.id]?.snapshot?.open_positions ?? 0)),
                },
                {
                  label: "Market Trend",
                  vals: BOTS.map(b => botData[b.id]?.snapshot?.market_trend ?? "—"),
                },
                {
                  label: "Safe Mode",
                  vals: BOTS.map(b => {
                    const sm = botData[b.id]?.snapshot?.safe_mode;
                    return sm === undefined ? "—" : sm ? "🟡 ON" : "🟢 OFF";
                  }),
                },
                {
                  label: "Cycle",
                  vals: BOTS.map(b => b.cycle),
                },
                {
                  label: "Simboluri",
                  vals: BOTS.map(b => String(b.symbols)),
                },
                {
                  label: "Strategie",
                  vals: BOTS.map(b => b.strategy),
                },
                {
                  label: "Status",
                  vals: BOTS.map(b => b.status === "live" ? "🟢 LIVE" : "⏸ Deprecated"),
                },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border-subtle/50 hover:bg-card-hover transition-colors duration-150">
                  <td className="py-2.5 text-xs text-muted-foreground font-body">{row.label}</td>
                  {row.vals.map((val, j) => (
                    <td key={j} className={`py-2.5 text-right font-mono text-xs ${row.colors?.[j] ?? ""}`}>
                      {botsLoading ? <span className="inline-block w-12 h-3 bg-card-hover rounded animate-pulse" /> : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Latest Signals (V1 context — backward compat) ── */}
      <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-base font-semibold">Latest AI Signals — V1</h3>
            <p className="text-xs text-muted-foreground">Current cycle analysis</p>
          </div>
          <Link to="/signals" className="text-xs text-accent hover:underline">View all →</Link>
        </div>
        {signals.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No signals yet</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border-subtle text-xs text-muted-foreground">
                  <th className="text-left pb-3 font-medium">Symbol</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                  <th className="text-left pb-3 font-medium">Confidence</th>
                  <th className="text-left pb-3 font-medium">RSI</th>
                  <th className="text-left pb-3 font-medium">EMA Trend</th>
                  <th className="text-left pb-3 font-medium">Executed</th>
                </tr>
              </thead>
              <tbody>
                {[...signals].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)).slice(0, 8).map((s: any) => (
                  <tr key={s.id} className="border-b border-border-subtle/50 hover:bg-card-hover transition-colors duration-150">
                    <td className="py-3 font-heading font-semibold">{s.symbol}</td>
                    <td className="py-3"><ActionBadge action={s.action} /></td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(s.confidence ?? 0) >= 80 ? "bg-accent" : (s.confidence ?? 0) >= 65 ? "bg-warning" : "bg-danger"}`}
                            style={{ width: `${s.confidence ?? 0}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{s.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`font-mono text-xs ${(s.rsi ?? 50) < 30 ? "text-accent" : (s.rsi ?? 50) > 70 ? "text-danger" : "text-muted-foreground"}`}>
                        {s.rsi?.toFixed(1) ?? "—"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs ${s.ema_trend === "bullish" ? "text-accent" : s.ema_trend === "bearish" ? "text-danger" : "text-muted-foreground"}`}>
                        {s.ema_trend ?? "—"}
                      </span>
                    </td>
                    <td className="py-3">
                      {s.executed
                        ? <span className="inline-flex items-center gap-1 text-xs bg-accent-dim text-accent px-2 py-0.5 rounded-full">✓</span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Bot Status + Live Activity ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-semibold flex items-center gap-2">⚡ Bot Status</h3>
            <span className="flex items-center gap-1.5 text-xs text-accent font-mono">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />ACTIVE 24/7
            </span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Current Cycle</span><span className="font-mono font-semibold">#{portfolio?.cycle ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Update</span><span className="font-mono">{portfolio?.updated_at ? new Date(portfolio.updated_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Market Trend</span><TrendBadge trend={portfolio?.market_trend} /></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Safe Mode</span><span className={`text-xs font-medium ${portfolio?.safe_mode ? "text-warning" : "text-accent"}`}>{portfolio?.safe_mode ? "🟡 ON" : "🟢 OFF"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Trades (V1)</span><span className="font-mono font-semibold">{portfolio?.total_trades ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Open Positions (V1)</span><span className="font-mono font-semibold">{portfolio?.open_positions ?? 0}</span></div>
          </div>
          <div className="border-t border-border-subtle mt-4 pt-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              3 boți activi · Gemini AI · Alpaca Paper
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-semibold flex items-center gap-2">
              🖥️ Live Bot Activity
              <span className="flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-accent font-mono">LIVE</span>
              </span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">last {Math.min(logs.length, 50)} events</span>
              <button
                onClick={() => window.location.reload()}
                className="text-xs text-muted-foreground hover:text-accent transition-colors duration-150 flex items-center gap-1.5 font-mono"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
          <div className="space-y-0.5 font-mono text-xs max-h-[280px] overflow-y-auto scrollbar-hide">
            {logs.slice(0, 50).map((log: any) => (
              <div
                key={log.id}
                className={`flex gap-2 sm:gap-3 py-1 border-b border-border-subtle/30 ${
                  log.level === "ERROR" ? "text-destructive" : log.level === "WARNING" ? "text-warning" : "text-muted-foreground"
                }`}
              >
                <span className="text-muted-foreground/60 shrink-0">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--"}
                </span>
                <span className={`shrink-0 px-1.5 rounded text-[10px] border ${
                  log.level === "ERROR" ? "text-destructive border-destructive/20 bg-destructive/10"
                  : log.level === "WARNING" ? "text-warning border-warning/20 bg-warning/10"
                  : "text-accent border-accent/20 bg-accent/10"
                }`}>
                  {log.level}
                </span>
                <span className="truncate">{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && <p className="text-muted-foreground py-4 text-center">Nicio activitate încă</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
