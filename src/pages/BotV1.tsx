import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatCurrencyPlain, formatPercent } from "@/lib/format";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const SB_URL = "https://lgrllhsfgvnngtmlwwug.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncmxsaHNmZ3Zubmd0bWx3d3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU5NTM4NiwiZXhwIjoyMDg3MTcxMzg2fQ.zXnxQ9C6xuOWibkmXRcVelUKmuQNqNxFvv4d7bp2ZHw";

async function fetchTable<T>(table: string, order?: string, limit?: number): Promise<T[]> {
  let url = `${SB_URL}/rest/v1/${table}?select=*`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  const res = await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!res.ok) return [];
  return res.json();
}

const WATCHLIST = ["AAPL","MSFT","NVDA","TSLA","GOOGL","AMZN","META","PLTR","COIN","HOOD"];

const STEPS = [
  { emoji: "📰", title: "Colectare știri", desc: "La fiecare 5 minute, NewsAPI agregă titluri financiare de pe Yahoo Finance, Google News, Finviz și Seeking Alpha pentru fiecare simbol din watchlist." },
  { emoji: "🧠", title: "Analiză Gemini AI", desc: "Titlurile sunt trimise la Google Gemini 2.0 Flash care calculează un scor de sentiment (0–100) și un reasoning detaliat per simbol." },
  { emoji: "📊", title: "Filtre tehnice", desc: "RSI calculat din bare de 1H. Dacă RSI > 65 → skip buy. Dacă RSI < 35 → semnal potențial. MACD și EMA confirmă direcția." },
  { emoji: "⚡", title: "Execuție automată", desc: "Dacă confidence ≥ 55% și RSI în interval → ordin plasat automat pe Alpaca Paper Trading fără confirmare umană." },
  { emoji: "🛡️", title: "Risk management", desc: "Stop Loss la -5%, Take Profit la +12%. Max 20 poziții simultane. Max pierdere zilnică 5% din equity." },
  { emoji: "📲", title: "Notificări Telegram", desc: "Fiecare trade, semnal și eroare trimisă instant pe Telegram." },
];

const SPECS = [
  { label: "Simboluri", value: "10 stocks" },
  { label: "Ciclu", value: "5 minute" },
  { label: "AI Model", value: "Gemini 2.0 Flash" },
  { label: "Date input", value: "Știri + RSI" },
  { label: "Crypto", value: "Nu" },
  { label: "Confidence prag", value: "≥ 55%" },
  { label: "Stop Loss", value: "-5%" },
  { label: "Take Profit", value: "+12%" },
  { label: "Max poziții", value: "20" },
  { label: "Broker", value: "Alpaca Paper" },
];

export default function BotV1() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [equityHistory, setEquityHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [p, t, s, l, eh] = await Promise.all([
        fetchTable<any>("portfolio_snapshot"),
        fetchTable<any>("trades", "timestamp.desc", 30),
        fetchTable<any>("signals", "updated_at.desc", 10),
        fetchTable<any>("bot_logs", "timestamp.desc", 40).catch(() => []),
        fetchTable<any>("equity_history", "created_at.asc", 60).catch(() => []),
      ]);
      setPortfolio(p?.[0] ?? null);
      setTrades(t ?? []);
      setSignals(s ?? []);
      setLogs(l ?? []);
      if (eh && eh.length > 0) {
        setEquityHistory(eh.map((e: any) => e.equity ?? e.value ?? 0));
      } else if (p?.[0]?.equity) {
        setEquityHistory(prev => [...prev.slice(-59), p[0].equity]);
      }
      setLastUpdate(new Date());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 15000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const equity = portfolio?.equity ?? 0;
  const pnl = portfolio?.pnl ?? 0;
  const pnlPct = portfolio?.pnl_pct ?? 0;
  const openPos = portfolio?.open_positions ?? 0;
  const totalTrades = portfolio?.total_trades ?? trades.length;
  const sellTrades = trades.filter((t) => t.action === "SELL");
  const wins = sellTrades.filter((t) => (t.pl ?? 0) > 0).length;
  const losses = sellTrades.length - wins;
  const winRate = sellTrades.length > 0 ? (wins / sellTrades.length) * 100 : 0;
  const totalPl = portfolio?.total_pl ?? 0;

  const chartData = equityHistory.map((v, i) => ({ idx: i, equity: v }));
  const eqMin = equityHistory.length > 1 ? Math.min(...equityHistory) : 0;
  const eqMax = equityHistory.length > 1 ? Math.max(...equityHistory) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border border-blue-500/20 rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl">🤖</div>
            <div>
              <h1 className="text-2xl font-heading font-bold">NeuroTrade <span className="text-blue-400">v1.0</span></h1>
              <p className="text-sm text-muted-foreground font-body">News-Driven Sentiment Bot · 10 Stocks · Gemini AI</p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">🟢 LIVE</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">Paper Trading</span>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                sync {lastUpdate.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
          Prima versiune a NeuroTrade. Strategia era bazată exclusiv pe sentiment din știri financiare — NewsAPI agrega titluri la fiecare 5 minute,
          Gemini 2.0 Flash analiza textul și genera un scor de încredere, iar dacă confidence-ul depășea 55%, ordinul era executat automat pe Alpaca.
          Fără indicatori tehnici avansați, fără crypto, fără safe mode.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Equity", val: equity > 0 ? formatCurrencyPlain(equity) : "—",
            sub: <span className={`text-sm font-mono mt-1 ${pnl >= 0 ? "text-accent" : "text-danger"}`}>{pnl >= 0 ? "↑" : "↓"} {formatCurrency(pnl)} ({formatPercent(pnlPct)})</span>
          },
          { label: "Poziții deschise", val: `${openPos}`, sup: "/20", sub: <span className="text-xs text-muted-foreground">max 20 simultane</span> },
          { label: "Total Trades", val: String(totalTrades), sub: <span className="text-xs text-muted-foreground">{wins}W · {losses}L</span> },
          {
            label: "Win Rate",
            val: sellTrades.length > 0 ? `${winRate.toFixed(0)}%` : "—",
            color: winRate >= 50 ? "text-accent" : winRate >= 40 ? "text-yellow-400" : sellTrades.length === 0 ? "" : "text-danger",
            sub: <span className="text-xs text-muted-foreground">P&L: <span className={totalPl >= 0 ? "text-accent" : "text-danger"}>{totalPl >= 0 ? "+" : ""}{totalPl.toFixed(2)}$</span></span>
          },
        ].map((card, i) => (
          <div key={i} className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
            <p className="text-xs text-muted-foreground font-body mb-1">{card.label}</p>
            {loading ? <div className="h-7 bg-card-hover rounded animate-pulse w-28 mb-1" /> : (
              <>
                <p className={`text-2xl font-mono font-semibold ${card.color ?? ""}`}>
                  {card.val}{card.sup && <span className="text-muted-foreground text-base">{card.sup}</span>}
                </p>
                <div className="mt-1">{card.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Equity Chart + Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <div className="mb-4">
            <h3 className="font-heading text-base font-semibold">Equity Curve</h3>
            <p className="text-xs text-muted-foreground">Ultimele {equityHistory.length} snapshots</p>
          </div>
          {chartData.length < 2 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Collecting data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="eqGradV1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(213,94%,68%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(213,94%,68%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={[eqMin * 0.9995, eqMax * 1.0005]} hide />
                <XAxis dataKey="idx" hide />
                <Tooltip
                  contentStyle={{ background: "hsl(217,33%,11%)", border: "1px solid hsl(215,19%,17%)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ display: "none" }}
                  formatter={(v: number) => [formatCurrencyPlain(v), "Equity"]}
                />
                <Area type="monotone" dataKey="equity" stroke="hsl(213,94%,68%)" strokeWidth={2} fill="url(#eqGradV1)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <h3 className="font-heading text-base font-semibold mb-4">Ultimele semnale</h3>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-card-hover rounded animate-pulse" />)}</div>
          ) : signals.length === 0 ? (
            <p className="text-muted-foreground text-sm">Niciun semnal.</p>
          ) : (
            <div className="space-y-2">
              {signals.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border-subtle/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm">{s.symbol}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${s.action === "BUY" ? "bg-blue-500/10 text-blue-400" : s.action === "SELL" ? "bg-danger/10 text-danger" : "bg-secondary text-muted-foreground"}`}>
                      {s.action}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{s.confidence ?? "—"}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
        <h2 className="text-lg font-heading font-semibold mb-5">Cum funcționează v1.0</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-background/50 border border-border-subtle rounded-xl p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">{step.emoji}</div>
              <div>
                <p className="text-sm font-semibold font-heading mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specs + Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-heading font-semibold mb-4">Parametri tehnici</h2>
          <div className="space-y-0">
            {SPECS.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                <span className="text-sm text-muted-foreground font-body">{s.label}</span>
                <span className="text-sm font-mono font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-heading font-semibold mb-4">Watchlist — 10 simboluri</h2>
          <div className="flex flex-wrap gap-2">
            {WATCHLIST.map((sym) => (
              <span key={sym} className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-mono">{sym}</span>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400 font-body">
              ⚠️ <strong>Limitare v1:</strong> Fără crypto, fără analiză tehnică avansată, fără safe mode VIX. Strategia era 100% bazată pe sentimentul din știri.
            </p>
          </div>
        </div>
      </div>

      {/* Recent trades */}
      <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
        <h2 className="text-lg font-heading font-semibold mb-4">Ultimele trades</h2>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-card-hover rounded-lg animate-pulse" />)}</div>
        ) : trades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🤖</p>
            <p className="text-muted-foreground text-sm">Niciun trade înregistrat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  {["Simbol","Acțiune","Preț","Qty","P&L","Data"].map(h => (
                    <th key={h} className={`py-2 px-3 text-xs text-muted-foreground font-body font-normal ${h === "Preț" || h === "P&L" || h === "Data" ? "text-right" : "text-left"} ${h === "Data" ? "hidden sm:table-cell" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border-subtle/50 hover:bg-card-hover/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold">{t.symbol}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${t.action === "BUY" ? "bg-blue-500/10 text-blue-400" : "bg-danger/10 text-danger"}`}>
                        {t.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">${(t.price ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{t.qty ?? "—"}</td>
                    <td className={`py-2.5 px-3 text-right font-mono ${(t.pl ?? 0) > 0 ? "text-accent" : (t.pl ?? 0) < 0 ? "text-danger" : "text-muted-foreground"}`}>
                      {t.pl != null ? `${(t.pl ?? 0) >= 0 ? "+" : ""}${(t.pl ?? 0).toFixed(2)}$` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                      {t.timestamp ? new Date(t.timestamp).toLocaleDateString("ro-RO") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Logs */}
      {logs.length > 0 && (
        <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              🖥️ Bot Logs
              <span className="flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400 font-mono">LIVE</span>
              </span>
            </h2>
            <span className="text-xs text-muted-foreground">last {logs.length} events</span>
          </div>
          <div className="space-y-0.5 font-mono text-xs max-h-[220px] overflow-y-auto scrollbar-hide">
            {logs.map((log: any) => (
              <div key={log.id} className={`flex gap-3 py-1 border-b border-border-subtle/30 ${log.level === "ERROR" ? "text-destructive" : log.level === "WARNING" ? "text-warning" : "text-muted-foreground"}`}>
                <span className="text-muted-foreground/60 shrink-0">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--"}
                </span>
                <span className={`shrink-0 px-1.5 rounded text-[10px] border ${log.level === "ERROR" ? "text-destructive border-destructive/20 bg-destructive/10" : log.level === "WARNING" ? "text-warning border-warning/20 bg-warning/10" : "text-blue-400 border-blue-400/20 bg-blue-400/10"}`}>
                  {log.level}
                </span>
                <span className="truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
