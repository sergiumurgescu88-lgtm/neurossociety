import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatCurrencyPlain, formatPercent } from "@/lib/format";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const SB_URL = "https://zawhuoshdefyznqmjphh.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2h1b3NoZGVmeXpucW1qcGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyNDU3NywiZXhwIjoyMDg4OTAwNTc3fQ.WK6J0-FIBndW1nb-XgS60bunFxwQFN2K3kzQ7E9X0g4";

async function fetchTable<T>(table: string, order?: string, limit?: number): Promise<T[]> {
  let url = `${SB_URL}/rest/v1/${table}?select=*`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  const res = await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!res.ok) return [];
  return res.json();
}

const SYMBOLS_V3 = [
  "AAPL","MSFT","NVDA","TSLA","GOOGL","AMZN","META","AMD",
  "NFLX","CRM","PLTR","COIN","HOOD","SOFI","MSTR","IONQ",
  "QQQ","SOXL","TQQQ","ARKK","SPY","IWM","GLD","SLV","USO",
  "BTC/USD","ETH/USD","SOL/USD"
];

const STEPS = [
  { emoji: "📰", title: "Știri + Tehnic combinat", desc: "v3 combină ambele strategii anterioare: NewsAPI pentru sentiment + RSI/MACD/BB/EMA pentru confirmare tehnică. Un semnal trebuie validat de ambele surse." },
  { emoji: "📊", title: "27 simboluri", desc: "Universe extins: 24 stocks/ETF-uri + 3 crypto. Include sectoare noi: metals (GLD, SLV), energy (USO), broad market (SPY, IWM) pentru diversificare maximă." },
  { emoji: "🌡️", title: "VIX Safe Mode", desc: "Botul monitorizează VIX în timp real. Dacă VIX > 30 (panică) → safe mode activat automat, nicio cumpărare nouă. Dacă VIX < 20 → full aggressive mode." },
  { emoji: "📐", title: "Kelly Sizing avansat", desc: "Position sizing bazat pe formula Kelly completă: f* = (bp - q) / b. Confidence-ul Gemini influențează direct mărimea pozițiilor în mod matematic." },
  { emoji: "🔗", title: "Multi-timeframe", desc: "Analiză pe 3 timeframe-uri simultan: 1H pentru entry, 4H pentru trend, 1D pentru macro context. Un trade e plasat doar când cele 3 confirme se aliniază." },
  { emoji: "🎯", title: "Trailing Stop dinamic", desc: "Stop loss dinamic care urmărește prețul în sus: -3% de la peak. Se actualizează la fiecare ciclu. Preia profitul fără a ieși prematur din trending moves." },
  { emoji: "🏦", title: "Market Regime Detection", desc: "SPY analizat la fiecare ciclu: Bull (trend up), Bear (trend down), Volatile (range). Strategia se adaptează automat: mai agresiv în bull, conservator în bear." },
  { emoji: "⚡", title: "Higher frequency", desc: "Cicluri la fiecare 2 minute în loc de 5. Mai multe oportunități captate, reacție mai rapidă la breakout-uri și știri flash." },
];

const SPECS = [
  { label: "Simboluri stocks/ETF", value: "24" },
  { label: "Simboluri crypto", value: "3 (BTC, ETH, SOL)" },
  { label: "Ciclu", value: "2 minute" },
  { label: "AI Model", value: "Gemini 2.0 Flash" },
  { label: "Date input", value: "Știri + RSI + MACD + BB + EMA" },
  { label: "VIX Safe Mode", value: "Da (>30)" },
  { label: "Multi-timeframe", value: "1H + 4H + 1D" },
  { label: "Trailing Stop", value: "-3% de la peak" },
  { label: "Confidence prag", value: "≥ 60%" },
  { label: "Stop Loss", value: "-3%" },
  { label: "Take Profit", value: "+10%" },
  { label: "Max poziții", value: "15" },
  { label: "Risk cap", value: "80% equity" },
  { label: "Market Regime", value: "Bull/Bear/Volatile" },
];

const IMPROVEMENTS = [
  { title: "vs v1", items: ["+ Analiză tehnică completă", "+ Crypto 24/7", "+ VIX safe mode", "+ Multi-timeframe", "+ Trailing stop dinamic"] },
  { title: "vs v2", items: ["+ Știri din nou (sentiment)", "+ 9 simboluri noi", "+ VIX monitoring", "+ Multi-timeframe (1H+4H+1D)", "+ Cicluri 2 min (era 5 min)", "+ Trailing stop (era fix SL)"] },
];

export default function BotV3() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [equityHistory, setEquityHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [p, pos, t, s, l, eh] = await Promise.all([
        fetchTable<any>("portfolio_snapshot"),
        fetchTable<any>("open_positions"),
        fetchTable<any>("trades", "timestamp.desc", 30),
        fetchTable<any>("signals", "updated_at.desc", 10),
        fetchTable<any>("bot_logs", "timestamp.desc", 40).catch(() => []),
        fetchTable<any>("equity_history", "created_at.asc", 60).catch(() => []),
      ]);
      setPortfolio(p?.[0] ?? null);
      setPositions(pos ?? []);
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
    const iv = setInterval(fetchAll, 10000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const equity = portfolio?.equity ?? 0;
  const pnl = portfolio?.pnl ?? 0;
  const pnlPct = portfolio?.pnl_pct ?? 0;
  const openPos = portfolio?.open_positions ?? positions.length;
  const totalTrades = portfolio?.total_trades ?? trades.length;
  const cash = equity - positions.reduce((s: number, p: any) => s + (p.market_value ?? 0), 0);
  const sellTrades = trades.filter((t) => t.action === "SELL");
  const wins = sellTrades.filter((t) => (t.pl ?? 0) > 0).length;
  const winRate = sellTrades.length > 0 ? (wins / sellTrades.length) * 100 : 0;
  const totalPl = portfolio?.total_pl ?? 0;
  const safeMode = portfolio?.safe_mode ?? false;
  const vix = portfolio?.vix ?? null;
  const marketRegime = portfolio?.market_regime ?? portfolio?.market_trend ?? null;

  const chartData = equityHistory.map((v, i) => ({ idx: i, equity: v }));
  const eqMin = equityHistory.length > 1 ? Math.min(...equityHistory) : 0;
  const eqMax = equityHistory.length > 1 ? Math.max(...equityHistory) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">🚀</div>
            <div>
              <h1 className="text-2xl font-heading font-bold">NeuroTrade <span className="text-purple-400">v3.0</span></h1>
              <p className="text-sm text-muted-foreground font-body">Full-Stack Bot · 27 Simboluri · Știri + Tehnic · VIX Safe Mode</p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
            {safeMode ? (
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">⚠️ SAFE MODE</span>
            ) : (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-400" />
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400">🟢 LIVE</span>
              </>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">Paper Trading</span>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                sync {lastUpdate.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {safeMode && (
          <div className="mt-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span className="text-yellow-400 text-sm">SAFE MODE ACTIV — VIX ridicat{vix ? ` (${vix.toFixed(1)})` : ""}, botul nu plasează ordine noi.</span>
          </div>
        )}

        <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
          Generația a treia NeuroTrade combină tot ce a funcționat din v1 și v2: sentiment din știri <em>și</em> analiză tehnică multi-timeframe.
          Universe extins la 27 simboluri, cicluri la 2 minute, VIX-based safe mode, trailing stop dinamic și market regime detection.
          Cel mai complet și mai rapid bot din serie.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Equity",
            val: equity > 0 ? formatCurrencyPlain(equity) : "—",
            sub: <span className={`text-sm font-mono mt-1 ${pnl >= 0 ? "text-accent" : "text-danger"}`}>{pnl >= 0 ? "↑" : "↓"} {formatCurrency(pnl)} ({formatPercent(pnlPct)})</span>
          },
          {
            label: "Cash disponibil",
            val: equity > 0 ? formatCurrencyPlain(cash) : "—",
            sub: <span className="text-xs text-muted-foreground">{equity > 0 ? `${((cash/equity)*100).toFixed(1)}% din portfolio` : "—"}</span>
          },
          {
            label: "Poziții deschise",
            val: String(openPos), sup: "/20",
            sub: <span className="text-xs text-muted-foreground">{totalTrades} total trades</span>
          },
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

      {/* Market Regime + VIX row */}
      {!loading && (vix || marketRegime) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vix !== null && (
            <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
              <p className="text-xs text-muted-foreground font-body mb-1">VIX (Fear Index)</p>
              <p className={`text-2xl font-mono font-semibold ${vix > 30 ? "text-danger" : vix > 20 ? "text-warning" : "text-accent"}`}>
                {vix.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {vix > 30 ? "🔴 Panică — Safe mode activ" : vix > 20 ? "🟡 Volatilitate ridicată" : "🟢 Piață calmă — Mod agresiv"}
              </p>
            </div>
          )}
          {marketRegime && (
            <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
              <p className="text-xs text-muted-foreground font-body mb-1">Market Regime</p>
              <p className={`text-2xl font-mono font-semibold ${
                marketRegime.toUpperCase().includes("BULL") ? "text-accent"
                : marketRegime.toUpperCase().includes("BEAR") ? "text-danger"
                : "text-warning"
              }`}>
                {marketRegime.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Detectat din analiza SPY</p>
            </div>
          )}
        </div>
      )}

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
                  <linearGradient id="eqGradV3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(270,80%,70%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(270,80%,70%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={[eqMin * 0.9995, eqMax * 1.0005]} hide />
                <XAxis dataKey="idx" hide />
                <Tooltip
                  contentStyle={{ background: "hsl(217,33%,11%)", border: "1px solid hsl(215,19%,17%)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ display: "none" }}
                  formatter={(v: number) => [formatCurrencyPlain(v), "Equity"]}
                />
                <Area type="monotone" dataKey="equity" stroke="hsl(270,80%,70%)" strokeWidth={2} fill="url(#eqGradV3)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <h3 className="font-heading text-base font-semibold mb-4">Ultimele semnale</h3>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-card-hover rounded animate-pulse" />)}</div>
          ) : signals.length === 0 ? (
            <p className="text-muted-foreground text-sm">Niciun semnal încă.</p>
          ) : (
            <div className="space-y-2">
              {signals.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border-subtle/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm">{s.symbol}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${s.action === "BUY" ? "bg-purple-500/10 text-purple-400" : s.action === "SELL" ? "bg-danger/10 text-danger" : "bg-secondary text-muted-foreground"}`}>
                      {s.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.rsi && <span className="text-xs text-muted-foreground font-mono">RSI {s.rsi.toFixed(0)}</span>}
                    <span className="text-xs font-mono text-purple-400">{s.confidence ?? "—"}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
        <h2 className="text-lg font-heading font-semibold mb-5">Cum funcționează v3.0</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-background/50 border border-border-subtle rounded-xl p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg flex-shrink-0">{step.emoji}</div>
              <div>
                <p className="text-sm font-semibold font-heading mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specs + Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-heading font-semibold mb-4">Parametri tehnici</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {SPECS.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                <span className="text-sm text-muted-foreground font-body">{s.label}</span>
                <span className="text-sm font-mono font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-heading font-semibold mb-4">Îmbunătățiri față de</h2>
          {IMPROVEMENTS.map((imp, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <p className="text-xs font-mono text-purple-400 mb-2">{imp.title}</p>
              <div className="space-y-1">
                {imp.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-accent text-xs mt-0.5">✓</span>
                    <span className="text-xs text-muted-foreground font-body">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symbols */}
      <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
        <h2 className="text-lg font-heading font-semibold mb-4">Universe — 27 simboluri</h2>
        <div className="flex flex-wrap gap-1.5">
          {SYMBOLS_V3.map((sym) => {
            const isCrypto = sym.includes("/");
            const isETF = ["QQQ","SOXL","TQQQ","ARKK","SPY","IWM","GLD","SLV","USO"].includes(sym);
            return (
              <span key={sym} className={`px-2 py-1 rounded-lg text-xs font-mono border ${
                isCrypto ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                isETF ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}>{sym}</span>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span><span className="text-xs text-muted-foreground">Stocks (15)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span><span className="text-xs text-muted-foreground">ETF-uri (9)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400"></span><span className="text-xs text-muted-foreground">Crypto 24/7 (3)</span></div>
        </div>
      </div>

      {/* Open Positions */}
      {!loading && positions.length > 0 && (
        <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-heading font-semibold mb-4">Poziții deschise — {positions.length}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  {["Simbol","Qty","Entry","Preț curent","Market Value","P&L"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-body font-normal last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.id} className="border-b border-border-subtle/50 hover:bg-card-hover/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold">{p.symbol}</td>
                    <td className="py-2.5 px-3 font-mono">{p.qty}</td>
                    <td className="py-2.5 px-3 font-mono">${(p.avg_entry ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">${(p.current_price ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">{formatCurrencyPlain(p.market_value ?? 0)}</td>
                    <td className={`py-2.5 px-3 font-mono text-right ${(p.unrealized_pl ?? 0) >= 0 ? "text-accent" : "text-danger"}`}>
                      {(p.unrealized_pl ?? 0) >= 0 ? "+" : ""}{(p.unrealized_pl ?? 0).toFixed(2)}$
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent trades */}
      <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
        <h2 className="text-lg font-heading font-semibold mb-4">Ultimele trades</h2>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-card-hover rounded-lg animate-pulse" />)}</div>
        ) : trades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🚀</p>
            <p className="text-muted-foreground text-sm">Botul v3 este activ și monitorizează piața.</p>
            <p className="text-muted-foreground text-xs mt-1">Primul trade va apărea când condițiile sunt îndeplinite.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  {["Simbol","Acțiune","Preț","Qty","P&L","Confidence","Data"].map(h => (
                    <th key={h} className={`py-2 px-3 text-xs text-muted-foreground font-body font-normal ${["Preț","P&L","Confidence","Data"].includes(h) ? "text-right" : "text-left"} ${h === "Data" ? "hidden sm:table-cell" : ""} ${h === "Confidence" ? "hidden sm:table-cell" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border-subtle/50 hover:bg-card-hover/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold">{t.symbol}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${t.action === "BUY" ? "bg-purple-500/10 text-purple-400" : "bg-danger/10 text-danger"}`}>
                        {t.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">${(t.price ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{t.qty}</td>
                    <td className={`py-2.5 px-3 text-right font-mono ${(t.pl ?? 0) > 0 ? "text-accent" : (t.pl ?? 0) < 0 ? "text-danger" : "text-muted-foreground"}`}>
                      {t.pl != null ? `${(t.pl ?? 0) >= 0 ? "+" : ""}${(t.pl ?? 0).toFixed(2)}$` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                      {t.confidence != null ? <span className="text-xs font-mono text-purple-400">{t.confidence}%</span> : "—"}
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
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs text-purple-400 font-mono">LIVE</span>
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
                <span className={`shrink-0 px-1.5 rounded text-[10px] border ${log.level === "ERROR" ? "text-destructive border-destructive/20 bg-destructive/10" : log.level === "WARNING" ? "text-warning border-warning/20 bg-warning/10" : "text-purple-400 border-purple-400/20 bg-purple-400/10"}`}>
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
