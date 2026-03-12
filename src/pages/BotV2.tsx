import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatCurrencyPlain, formatPercent } from "@/lib/format";

// Bot V2 — VPS /opt/neurotrade-v2, Supabase propriu
const SB_URL = "https://qvzupovzynuqqmcmdvou.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2enVwb3Z6eW51cXFtY21kdm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxNTMzMSwiZXhwIjoyMDg4NzkxMzMxfQ.pd9SqoI3V0Q4qLc_R64pSaF_sexqeb9MT-9vFKRETt0";

async function fetchTable<T>(table: string, order?: string, limit?: number): Promise<T[]> {
  let url = `${SB_URL}/rest/v1/${table}?select=*`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  const res = await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!res.ok) return [];
  return res.json();
}

const STOCKS = ["AAPL","MSFT","NVDA","TSLA","GOOGL","AMZN","META","AMD","NFLX","CRM","PLTR","COIN","HOOD","SOFI","QQQ","SOXL","TQQQ","ARKK"];
const CRYPTO = ["BTC/USD","ETH/USD","SOL/USD"];

const STEPS = [
  { emoji: "💹", title: "Prețuri live", desc: "La fiecare 5 minute prețurile sunt fetched pentru toate 21 simboluri (18 stocks + 3 crypto) de pe Alpaca Market Data cu pauze de 0.2s între apeluri." },
  { emoji: "📐", title: "Analiză tehnică", desc: "50 de candele de 1H per simbol. Calculează RSI, MACD (12/26/9), Bollinger Bands (20/2), EMA-20. Dacă RSI > 65 simbolul este skipat complet." },
  { emoji: "🧠", title: "Gemini decide", desc: "Gemini 2.0 Flash primește datele tehnice și returnează BUY/SELL/HOLD + confidence % + reasoning. Fără știri, decizie pur tehnică." },
  { emoji: "🛡️", title: "Risk exits automate", desc: "Stop Loss -4% și Take Profit +8% verificate la fiecare ciclu fără intervenția AI. Ordinele de exit sunt plasate imediat dacă pragul e atins." },
  { emoji: "📏", title: "Kelly position sizing", desc: "Mărimea poziției = 5–12% din cash disponibil, în funcție de confidence-ul Gemini. Niciodată mai mult de 15% per trade." },
  { emoji: "🔄", title: "Risk cap 85%", desc: "Dacă capitalul deployed depășește 85% din equity, botul oprește scanarea și nu mai plasează ordine noi până se eliberează cash." },
];

const SPECS = [
  { label: "Simboluri stocks", value: "18" },
  { label: "Simboluri crypto", value: "3 (BTC, ETH, SOL)" },
  { label: "Ciclu", value: "5 minute" },
  { label: "AI Model", value: "Gemini 2.0 Flash" },
  { label: "Date input", value: "RSI + MACD + BB + EMA" },
  { label: "Crypto 24/7", value: "Da" },
  { label: "Confidence prag", value: "≥ 55%" },
  { label: "Stop Loss", value: "-4%" },
  { label: "Take Profit", value: "+8%" },
  { label: "Max poziții", value: "12" },
  { label: "Risk cap", value: "85% equity" },
  { label: "Max pierdere zilnică", value: "5%" },
];

export default function BotV2() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [p, pos, t, s] = await Promise.all([
        fetchTable<any>("portfolio_snapshot"),
        fetchTable<any>("open_positions"),
        fetchTable<any>("trades", "timestamp.desc", 20),
        fetchTable<any>("signals", "updated_at.desc", 10),
      ]);
      setPortfolio(p?.[0] ?? null);
      setPositions(pos ?? []);
      setTrades(t ?? []);
      setSignals(s ?? []);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">⚡</div>
            <div>
              <h1 className="text-2xl font-heading font-bold">NeuroTrade <span className="text-accent">v2.0</span></h1>
              <p className="text-sm text-muted-foreground font-body">Technical Analysis Bot · 18 Stocks + 3 Crypto · 24/7</p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-accent/10 border border-accent/20 text-accent">🟢 LIVE</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">Paper Trading</span>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground font-mono hidden sm:block">
                sync {lastUpdate.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground font-body leading-relaxed">
          A doua generație NeuroTrade. Renunță la știri în favoarea analizei tehnice pure — RSI, MACD, Bollinger Bands, EMA calculați 
          în timp real pe 50 candele de 1H. Gemini AI primește datele tehnice și decide BUY/SELL/HOLD. Adaugă crypto 24/7, 
          stop loss/take profit automatizate, Kelly position sizing și risk cap la 85% equity.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground font-body mb-1">Equity</p>
          {loading ? <div className="h-7 bg-card-hover rounded animate-pulse w-28 mb-1" /> : (
            <>
              <p className="text-2xl font-mono font-semibold">{equity > 0 ? formatCurrencyPlain(equity) : "—"}</p>
              <p className={`text-sm font-mono mt-1 ${pnl >= 0 ? "text-accent" : "text-danger"}`}>
                {pnl >= 0 ? "↑" : "↓"} {formatCurrency(pnl)} ({formatPercent(pnlPct)})
              </p>
            </>
          )}
        </div>
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground font-body mb-1">Cash disponibil</p>
          {loading ? <div className="h-7 bg-card-hover rounded animate-pulse w-24 mb-1" /> : (
            <>
              <p className="text-2xl font-mono font-semibold">{equity > 0 ? formatCurrencyPlain(cash) : "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">{equity > 0 ? `${((cash/equity)*100).toFixed(1)}% din portfolio` : "—"}</p>
            </>
          )}
        </div>
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground font-body mb-1">Poziții deschise</p>
          {loading ? <div className="h-7 bg-card-hover rounded animate-pulse w-16 mb-1" /> : (
            <>
              <p className="text-2xl font-mono font-semibold">{openPos}<span className="text-muted-foreground text-base">/12</span></p>
              <p className="text-xs text-muted-foreground mt-1">{totalTrades} total trades</p>
            </>
          )}
        </div>
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground font-body mb-1">Win Rate</p>
          {loading ? <div className="h-7 bg-card-hover rounded animate-pulse w-16 mb-1" /> : (
            <>
              <p className={`text-2xl font-mono font-semibold ${winRate >= 50 ? "text-accent" : winRate >= 40 ? "text-yellow-400" : "text-danger"}`}>
                {sellTrades.length > 0 ? `${winRate.toFixed(0)}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">P&L total: <span className={totalPl >= 0 ? "text-accent" : "text-danger"}>{totalPl >= 0 ? "+" : ""}{totalPl.toFixed(2)}$</span></p>
            </>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
        <h2 className="text-lg font-heading font-semibold mb-5">Cum funcționează v2.0</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-background/50 border border-border-subtle rounded-xl p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-lg flex-shrink-0">{step.emoji}</div>
              <div>
                <p className="text-sm font-semibold font-heading mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specs + Symbols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-heading font-semibold mb-4">Parametri tehnici</h2>
          <div className="space-y-0">
            {SPECS.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                <span className="text-sm text-muted-foreground font-body">{s.label}</span>
                <span className="text-sm font-mono font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-heading font-semibold mb-4">Universe — 21 simboluri</h2>
          <p className="text-xs text-muted-foreground font-body mb-3">Stocks (Luni–Vineri 16:30–23:00 RO)</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {STOCKS.map((sym) => (
              <span key={sym} className="px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-mono">{sym}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-body mb-3">Crypto (24/7)</p>
          <div className="flex flex-wrap gap-1.5">
            {CRYPTO.map((sym) => (
              <span key={sym} className="px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono">{sym}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      {!loading && positions.length > 0 && (
        <div className="bg-card border border-border-subtle rounded-2xl p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-heading font-semibold mb-4">Poziții deschise</h2>
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
          <p className="text-muted-foreground text-sm font-body">Niciun trade înregistrat încă. Botul rulează — primul trade va apărea când piața se deschide.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-body font-normal">Simbol</th>
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-body font-normal">Acțiune</th>
                  <th className="text-right py-2 px-3 text-xs text-muted-foreground font-body font-normal">Preț</th>
                  <th className="text-right py-2 px-3 text-xs text-muted-foreground font-body font-normal">Qty</th>
                  <th className="text-right py-2 px-3 text-xs text-muted-foreground font-body font-normal">P&L</th>
                  <th className="text-right py-2 px-3 text-xs text-muted-foreground font-body font-normal hidden sm:table-cell">Tip</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border-subtle/50 hover:bg-card-hover/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold">{t.symbol}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${t.action === "BUY" ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"}`}>
                        {t.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">${(t.price ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{t.qty}</td>
                    <td className={`py-2.5 px-3 text-right font-mono ${(t.pl ?? 0) > 0 ? "text-accent" : (t.pl ?? 0) < 0 ? "text-danger" : "text-muted-foreground"}`}>
                      {t.pl != null ? `${(t.pl ?? 0) >= 0 ? "+" : ""}${(t.pl ?? 0).toFixed(2)}$` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right hidden sm:table-cell">
                      {t.close_type ? <span className="text-xs text-muted-foreground font-mono">{t.close_type}</span> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
