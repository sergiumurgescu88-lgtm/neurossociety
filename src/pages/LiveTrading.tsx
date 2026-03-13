import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatCurrencyPlain } from "@/lib/format";

// ─── Supabase instances ───────────────────────────────────────────────────────
const SB = {
  v1: { url: "https://lgrllhsfgvnngtmlwwug.supabase.co", key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncmxsaHNmZ3Zubmd0bWx3d3VnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU5NTM4NiwiZXhwIjoyMDg3MTcxMzg2fQ.zXnxQ9C6xuOWibkmXRcVelUKmuQNqNxFvv4d7bp2ZHw" },
  v2: { url: "https://qvzupovzynuqqmcmdvou.supabase.co", key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2enVwb3Z6eW51cXFtY21kdm91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxNTMzMSwiZXhwIjoyMDg4NzkxMzMxfQ.pd9SqoI3V0Q4qLc_R64pSaF_sexqeb9MT-9vFKRETt0" },
  v3: { url: "https://zawhuoshdefyznqmjphh.supabase.co", key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphd2h1b3NoZGVmeXpucW1qcGhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyNDU3NywiZXhwIjoyMDg4OTAwNTc3fQ.WK6J0-FIBndW1nb-XgS60bunFxwQFN2K3kzQ7E9X0g4" },
};

async function sbFetch(sb: { url: string; key: string }, table: string, order?: string, limit?: number) {
  let url = `${sb.url}/rest/v1/${table}?select=*`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  try {
    const res = await fetch(url, { headers: { apikey: sb.key, Authorization: `Bearer ${sb.key}` } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

// ─── Bot config ───────────────────────────────────────────────────────────────
const BOT_CONFIG = {
  v1: {
    emoji: "🤖", name: "NeuroTrade v1.0", subtitle: "News Sentiment Bot",
    status: "live" as const, statusLabel: "🟢 LIVE",
    color: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", badge: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
    strategy: [
      { icon: "📰", title: "Colectare Știri", desc: "NewsAPI agregă titluri financiare de pe Yahoo Finance, Google News, Finviz și Seeking Alpha la fiecare 5 minute pentru fiecare simbol din watchlist." },
      { icon: "🧠", title: "Analiză Gemini AI", desc: "Titlurile sunt trimise la Google Gemini 2.0 Flash care calculează scor sentiment (0–100) și reasoning detaliat per simbol." },
      { icon: "📊", title: "Filtru RSI", desc: "RSI calculat pe bare de 1H. RSI > 65 → skip buy. RSI < 35 → semnal potențial. MACD și EMA confirmă direcția." },
      { icon: "⚡", title: "Execuție Automată", desc: "Confidence ≥ 55% și RSI valid → ordin plasat automat pe Alpaca Paper Trading, zero intervenție umană." },
      { icon: "🛡️", title: "Risk Management", desc: "Stop Loss -5%, Take Profit +12%. Max 10 poziții simultane. Pierdere zilnică max 5% din equity." },
      { icon: "📲", title: "Notificări Telegram", desc: "Fiecare trade, semnal și eroare trimisă instant pe Telegram @SergiuOLXbot." },
    ],
    specs: [
      { k: "Simboluri", v: "10 stocks" }, { k: "Ciclu", v: "5 minute" },
      { k: "AI Model", v: "Gemini 2.0 Flash" }, { k: "Input", v: "Știri + RSI" },
      { k: "Crypto", v: "Nu" }, { k: "Confidence prag", v: "≥ 55%" },
      { k: "Stop Loss", v: "-5%" }, { k: "Take Profit", v: "+12%" },
      { k: "Max poziții", v: "10" }, { k: "Broker", v: "Alpaca Paper" },
    ],
    maxPos: "10",
    universe: ["AAPL","MSFT","NVDA","TSLA","GOOGL","AMZN","META","PLTR","COIN","AMD"],
  },
  v2: {
    emoji: "⚡", name: "NeuroTrade v2.0", subtitle: "Technical Analysis Bot",
    status: "live" as const, statusLabel: "🟢 LIVE",
    color: { border: "border-accent/30", bg: "bg-accent/10", text: "text-accent", badge: "bg-accent/10 border-accent/20 text-accent" },
    strategy: [
      { icon: "💹", title: "Prețuri Live", desc: "La fiecare 5 minute: fetch prețuri pentru 21 simboluri (18 stocks + 3 crypto) de pe Alpaca Market Data cu pauze 0.2s între apeluri." },
      { icon: "📐", title: "Analiză Tehnică", desc: "50 candele 1H per simbol. Calculează RSI, MACD (12/26/9), Bollinger Bands (20/2), EMA-20. RSI > 65 → simbol skipat complet." },
      { icon: "🧠", title: "Gemini Decide", desc: "Gemini 2.0 Flash primește datele tehnice și returnează BUY/SELL/HOLD + confidence % + reasoning. Decizie pur tehnică, fără știri." },
      { icon: "🛡️", title: "Risk Exits Automate", desc: "Stop Loss -4% și Take Profit +8% verificate la fiecare ciclu fără AI. Ordinele de exit sunt plasate imediat la atingerea pragului." },
      { icon: "📏", title: "Kelly Position Sizing", desc: "Mărimea poziției = 5–12% din cash disponibil în funcție de confidence-ul Gemini. Niciodată mai mult de 15% per trade." },
      { icon: "🔄", title: "Risk Cap 85%", desc: "Capital deployed > 85% din equity → botul oprește scanarea și nu mai plasează ordine noi până se eliberează cash." },
    ],
    specs: [
      { k: "Stocks", v: "18 simboluri" }, { k: "Crypto", v: "BTC, ETH, SOL" },
      { k: "Ciclu", v: "5 minute" }, { k: "AI Model", v: "Gemini 2.0 Flash" },
      { k: "Input", v: "RSI + MACD + BB + EMA" }, { k: "Crypto 24/7", v: "Da" },
      { k: "Confidence prag", v: "≥ 55%" }, { k: "Stop Loss", v: "-4%" },
      { k: "Take Profit", v: "+8%" }, { k: "Max poziții", v: "12" },
      { k: "Risk cap", v: "85% equity" }, { k: "Pierdere zilnică max", v: "5%" },
    ],
    maxPos: "12",
    universe: ["AAPL","MSFT","NVDA","TSLA","GOOGL","AMZN","META","AMD","NFLX","CRM","PLTR","COIN","HOOD","SOFI","QQQ","SOXL","TQQQ","ARKK","BTC/USD","ETH/USD","SOL/USD"],
  },
  v3: {
    emoji: "🚀", name: "NeuroTrade v3.0", subtitle: "Full Stack Bot",
    status: "live" as const, statusLabel: "🟢 LIVE",
    color: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", badge: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
    strategy: [
      { icon: "📰", title: "Știri + Tehnic Combinat", desc: "v3 combină ambele strategii: NewsAPI pentru sentiment + RSI/MACD/BB/EMA pentru confirmare. Un semnal trebuie validat de ambele surse simultan." },
      { icon: "🌡️", title: "VIX Safe Mode", desc: "Monitorizează VIX în timp real. VIX > 30 → safe mode automat, zero cumpărări noi. VIX < 20 → full aggressive mode." },
      { icon: "🔗", title: "Multi-Timeframe", desc: "Analiză simultană pe 3 TF-uri: 1H pentru entry, 4H pentru trend, 1D pentru macro context. Trade plasat doar când cele 3 confirmări se aliniază." },
      { icon: "🎯", title: "Trailing Stop Dinamic", desc: "Stop loss urmărește prețul în sus: -3% de la peak. Se actualizează la fiecare ciclu. Preia profitul fără a ieși prematur din trending moves." },
      { icon: "🏦", title: "Market Regime Detection", desc: "SPY analizat la fiecare ciclu: Bull/Bear/Volatile. Strategia se adaptează automat: agresiv în bull, conservator în bear." },
      { icon: "⚡", title: "Higher Frequency", desc: "Cicluri la 2 minute în loc de 5. Mai multe oportunități captate, reacție mai rapidă la breakout-uri și știri flash." },
      { icon: "📐", title: "Kelly Sizing Avansat", desc: "Formula Kelly completă: f* = (bp - q) / b. Confidence-ul Gemini influențează direct mărimea pozițiilor matematic." },
      { icon: "📊", title: "27 Simboluri", desc: "Universe extins: 15 stocks + 9 ETF-uri (incl. SPY, QQQ, GLD, SLV, USO) + 3 crypto 24/7 pentru diversificare maximă." },
    ],
    specs: [
      { k: "Stocks/ETF", v: "24 simboluri" }, { k: "Crypto", v: "BTC, ETH, SOL" },
      { k: "Ciclu", v: "2 minute" }, { k: "AI Model", v: "Gemini 2.0 Flash" },
      { k: "Input", v: "Știri + RSI + MACD + BB + EMA" }, { k: "VIX Safe Mode", v: "Da (>30)" },
      { k: "Multi-TF", v: "1H + 4H + 1D" }, { k: "Trailing Stop", v: "-3% de la peak" },
      { k: "Confidence prag", v: "≥ 60%" }, { k: "Stop Loss", v: "-3%" },
      { k: "Take Profit", v: "+10%" }, { k: "Max poziții", v: "15" },
      { k: "Risk cap", v: "80% equity" }, { k: "Market Regime", v: "Bull/Bear/Volatile" },
    ],
    maxPos: "15",
    universe: ["AAPL","MSFT","NVDA","TSLA","GOOGL","AMZN","META","AMD","NFLX","CRM","PLTR","COIN","HOOD","SOFI","MSTR","IONQ","QQQ","SOXL","TQQQ","ARKK","SPY","IWM","GLD","SLV","USO","BTC/USD","ETH/USD","SOL/USD"],
  },
};

type BotKey = "v1" | "v2" | "v3";
type TabKey = "live" | "trades" | "rezultate" | "strategie";

interface BotData { portfolio: any; trades: any[]; positions: any[]; signals: any[]; }

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${active ? "bg-accent/20 text-accent border border-accent/30" : "text-muted-foreground hover:bg-card-hover border border-transparent"}`}>
      {children}
    </button>
  );
}

function KPI({ label, value, sub, color }: { label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div className="bg-background/50 border border-border-subtle rounded-xl p-4">
      <p className="text-xs text-muted-foreground font-body mb-1">{label}</p>
      <p className={`text-xl font-mono font-bold ${color ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5 font-body">{sub}</p>}
    </div>
  );
}

function LiveTab({ data, cfg, loading }: { data: BotData; cfg: typeof BOT_CONFIG.v1; loading: boolean }) {
  const eq = data.portfolio?.equity ?? 0;
  const pnl = data.portfolio?.pnl ?? 0;
  const pnlPct = data.portfolio?.pnl_pct ?? 0;
  const openPos = data.portfolio?.open_positions ?? data.positions.length;
  const totalTrades = data.portfolio?.total_trades ?? data.trades.length;
  const cash = data.portfolio?.cash ?? (eq - data.positions.reduce((s: number, p: any) => s + (p.market_value ?? 0), 0));
  const safeMode = data.portfolio?.safe_mode ?? false;
  const sellTrades = data.trades.filter(t => t.action === "SELL");
  const wins = sellTrades.filter(t => (t.pl ?? 0) > 0).length;
  const winRate = sellTrades.length > 0 ? (wins / sellTrades.length) * 100 : 0;
  const totalPl = data.portfolio?.total_pl ?? 0;

  if (loading) return <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-card-hover rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      {safeMode && <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-center gap-2"><span>⚠️</span><span className="text-yellow-400 text-sm font-body">SAFE MODE ACTIV — VIX ridicat, botul nu plasează ordine noi.</span></div>}
      {(cfg as any).status === "deprecated" && <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl"><p className="text-yellow-400 text-sm font-body">⏸ Bot oprit — versiune deprecată. Datele istorice sunt disponibile în tab-urile Trades, Rezultate și Strategie.</p></div>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI label="Equity" value={eq > 0 ? formatCurrencyPlain(eq) : "—"} sub={`${pnl >= 0 ? "↑" : "↓"} ${formatCurrency(pnl)} (${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%)`} color={pnl >= 0 ? "text-accent" : "text-danger"} />
        <KPI label="Cash disponibil" value={eq > 0 ? formatCurrencyPlain(cash) : "—"} sub={eq > 0 ? `${((cash / eq) * 100).toFixed(1)}% din portfolio` : "—"} />
        <KPI label="Poziții deschise" value={<>{openPos}<span className="text-muted-foreground text-sm">/{cfg.maxPos}</span></>} sub={`${totalTrades} total trades`} />
        <KPI label="Win Rate" value={sellTrades.length > 0 ? `${winRate.toFixed(0)}%` : "—"} sub={`P&L total: ${totalPl >= 0 ? "+" : ""}${totalPl.toFixed(2)}$`} color={winRate >= 50 ? "text-accent" : winRate >= 40 ? "text-yellow-400" : "text-danger"} />
      </div>

      {data.positions.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold mb-3">📈 Poziții Deschise ({data.positions.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border-subtle">{["Simbol","Qty","Entry","Preț curent","Market Value","P&L nerealizat"].map(h => <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-body font-normal last:text-right">{h}</th>)}</tr></thead>
              <tbody>
                {data.positions.map((p, i) => (
                  <tr key={p.id ?? i} className="border-b border-border-subtle/50 hover:bg-card-hover/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold">{p.symbol}</td>
                    <td className="py-2.5 px-3 font-mono">{p.qty}</td>
                    <td className="py-2.5 px-3 font-mono">${(p.avg_entry ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">${(p.current_price ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">{formatCurrencyPlain(p.market_value ?? 0)}</td>
                    <td className={`py-2.5 px-3 font-mono text-right ${(p.unrealized_pl ?? 0) >= 0 ? "text-accent" : "text-danger"}`}>{(p.unrealized_pl ?? 0) >= 0 ? "+" : ""}{(p.unrealized_pl ?? 0).toFixed(2)}$</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.signals.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold mb-3">📡 Semnale AI Active ({data.signals.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
            {data.signals.map((s, i) => (
              <div key={s.id ?? i} className={`p-3 rounded-xl ${cfg.color.bg} border ${cfg.color.border}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-mono font-bold ${cfg.color.text}`}>{s.symbol}</span>
                  {s.action && <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${s.action === "BUY" ? "bg-accent/20 text-accent" : s.action === "SELL" ? "bg-danger/20 text-danger" : "bg-muted/20 text-muted-foreground"}`}>{s.action}</span>}
                </div>
                {s.confidence != null && <p className="text-xs text-muted-foreground font-mono">conf: {s.confidence}%</p>}
                {s.reasoning && <p className="text-[10px] text-muted-foreground font-body mt-1 line-clamp-2">{s.reasoning}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.trades.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold mb-3">🔴 Ultimele 5 Tranzacții</h3>
          <div className="space-y-1.5">
            {data.trades.slice(0, 5).map((t, i) => (
              <div key={t.id ?? i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border-subtle/50 hover:bg-card-hover/30 transition-colors">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${t.action === "BUY" ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"}`}>{t.action}</span>
                <span className={`font-mono font-bold text-sm ${cfg.color.text}`}>{t.symbol}</span>
                <span className="font-mono text-sm">${(t.price ?? 0).toFixed(2)}</span>
                {t.qty && <span className="text-xs text-muted-foreground font-mono">×{t.qty}</span>}
                {t.pl != null && <span className={`ml-auto font-mono text-sm font-bold ${(t.pl ?? 0) >= 0 ? "text-accent" : "text-danger"}`}>{(t.pl ?? 0) >= 0 ? "+" : ""}{(t.pl ?? 0).toFixed(2)}$</span>}
                {t.timestamp && <span className="text-xs text-muted-foreground font-mono hidden sm:block">{new Date(t.timestamp).toLocaleString("ro-RO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TradesTab({ data, loading }: { data: BotData; loading: boolean }) {
  if (loading) return <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-card-hover rounded-lg animate-pulse" />)}</div>;
  if (data.trades.length === 0) return <div className="text-center py-12"><p className="text-3xl mb-2">📋</p><p className="text-muted-foreground font-body text-sm">Niciun trade înregistrat.</p></div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border-subtle">{["Simbol","Acțiune","Preț","Qty","P&L","Conf.","Tip exit","Data"].map(h => <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-body font-normal">{h}</th>)}</tr></thead>
        <tbody>
          {data.trades.map((t, i) => (
            <tr key={t.id ?? i} className="border-b border-border-subtle/50 hover:bg-card-hover/30 transition-colors">
              <td className="py-2.5 px-3 font-mono font-bold">{t.symbol}</td>
              <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded text-xs font-mono ${t.action === "BUY" ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"}`}>{t.action}</span></td>
              <td className="py-2.5 px-3 font-mono">${(t.price ?? 0).toFixed(2)}</td>
              <td className="py-2.5 px-3 font-mono">{t.qty ?? "—"}</td>
              <td className={`py-2.5 px-3 font-mono ${(t.pl ?? 0) > 0 ? "text-accent" : (t.pl ?? 0) < 0 ? "text-danger" : "text-muted-foreground"}`}>{t.pl != null ? `${(t.pl ?? 0) >= 0 ? "+" : ""}${(t.pl ?? 0).toFixed(2)}$` : "—"}</td>
              <td className="py-2.5 px-3 font-mono text-muted-foreground">{t.confidence != null ? `${t.confidence}%` : "—"}</td>
              <td className="py-2.5 px-3 text-xs text-muted-foreground">{t.close_type ?? "—"}</td>
              <td className="py-2.5 px-3 text-xs text-muted-foreground">{t.timestamp ? new Date(t.timestamp).toLocaleString("ro-RO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RezultateTab({ data, loading }: { data: BotData; loading: boolean }) {
  const sellTrades = data.trades.filter(t => t.action === "SELL" && t.pl != null);
  const wins = sellTrades.filter(t => (t.pl ?? 0) > 0);
  const losses = sellTrades.filter(t => (t.pl ?? 0) < 0);
  const winRate = sellTrades.length > 0 ? (wins.length / sellTrades.length) * 100 : 0;
  const totalPl = sellTrades.reduce((s, t) => s + (t.pl ?? 0), 0);
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pl ?? 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + (t.pl ?? 0), 0) / losses.length : 0;
  const profitFactor = Math.abs(avgLoss) > 0 ? Math.abs(avgWin / avgLoss) : 0;
  const best = sellTrades.length > 0 ? sellTrades.reduce((b, t) => (t.pl ?? 0) > (b.pl ?? 0) ? t : b, sellTrades[0]) : null;
  const worst = sellTrades.length > 0 ? sellTrades.reduce((w, t) => (t.pl ?? 0) < (w.pl ?? 0) ? t : w, sellTrades[0]) : null;

  if (loading) return <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-card-hover rounded-xl animate-pulse" />)}</div>;

  const bySymbol = sellTrades.reduce((acc: Record<string, { wins: number; losses: number; pl: number }>, t) => {
    if (!acc[t.symbol]) acc[t.symbol] = { wins: 0, losses: 0, pl: 0 };
    if ((t.pl ?? 0) > 0) acc[t.symbol].wins++; else acc[t.symbol].losses++;
    acc[t.symbol].pl += t.pl ?? 0;
    return acc;
  }, {});
  const sortedSymbols = Object.entries(bySymbol).sort((a, b) => (b[1] as any).pl - (a[1] as any).pl) as [string, { wins: number; losses: number; pl: number }][];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KPI label="Win Rate" value={sellTrades.length > 0 ? `${winRate.toFixed(1)}%` : "—"} sub={`${wins.length}W / ${losses.length}L din ${sellTrades.length} trades închise`} color={winRate >= 50 ? "text-accent" : "text-danger"} />
        <KPI label="P&L Total realizat" value={sellTrades.length > 0 ? `${totalPl >= 0 ? "+" : ""}${totalPl.toFixed(2)}$` : "—"} color={totalPl >= 0 ? "text-accent" : "text-danger"} />
        <KPI label="Profit Factor" value={profitFactor > 0 ? profitFactor.toFixed(2) : "—"} sub="Avg win / |Avg loss|" color={profitFactor >= 1.5 ? "text-accent" : profitFactor >= 1 ? "text-yellow-400" : "text-danger"} />
        <KPI label="Câștig mediu / trade" value={avgWin > 0 ? `+${avgWin.toFixed(2)}$` : "—"} color="text-accent" />
        <KPI label="Pierdere medie / trade" value={avgLoss < 0 ? `${avgLoss.toFixed(2)}$` : "—"} color="text-danger" />
        <KPI label="Equity curent" value={data.portfolio?.equity > 0 ? formatCurrencyPlain(data.portfolio.equity) : "—"} sub={data.portfolio?.pnl != null ? `P&L nerealizat: ${data.portfolio.pnl >= 0 ? "+" : ""}${formatCurrency(data.portfolio.pnl)}` : ""} />
      </div>

      {(best || worst) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {best && <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl"><p className="text-xs text-muted-foreground font-body mb-2">🏆 Best Trade</p><div className="flex justify-between"><span className="font-mono font-bold">{best.symbol}</span><span className="text-accent font-mono font-bold">+{(best.pl ?? 0).toFixed(2)}$</span></div>{best.timestamp && <p className="text-xs text-muted-foreground mt-1">{new Date(best.timestamp).toLocaleDateString("ro-RO")}</p>}</div>}
          {worst && <div className="p-4 bg-danger/5 border border-danger/20 rounded-xl"><p className="text-xs text-muted-foreground font-body mb-2">📉 Worst Trade</p><div className="flex justify-between"><span className="font-mono font-bold">{worst.symbol}</span><span className="text-danger font-mono font-bold">{(worst.pl ?? 0).toFixed(2)}$</span></div>{worst.timestamp && <p className="text-xs text-muted-foreground mt-1">{new Date(worst.timestamp).toLocaleDateString("ro-RO")}</p>}</div>}
        </div>
      )}

      {sortedSymbols.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold mb-3">Performanță per Simbol</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border-subtle">{["Simbol","Wins","Losses","P&L total","Win %"].map(h => <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-body font-normal">{h}</th>)}</tr></thead>
              <tbody>
                {sortedSymbols.map(([sym, stat]) => {
                  const wr = (stat.wins / (stat.wins + stat.losses)) * 100;
                  return (
                    <tr key={sym} className="border-b border-border-subtle/50 hover:bg-card-hover/30">
                      <td className="py-2 px-3 font-mono font-bold">{sym}</td>
                      <td className="py-2 px-3 text-accent font-mono">{stat.wins}</td>
                      <td className="py-2 px-3 text-danger font-mono">{stat.losses}</td>
                      <td className={`py-2 px-3 font-mono ${stat.pl >= 0 ? "text-accent" : "text-danger"}`}>{stat.pl >= 0 ? "+" : ""}{stat.pl.toFixed(2)}$</td>
                      <td className={`py-2 px-3 font-mono ${wr >= 50 ? "text-accent" : "text-danger"}`}>{wr.toFixed(0)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StrategieTab({ cfg }: { cfg: typeof BOT_CONFIG.v1 }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cfg.strategy.map((step, i) => (
          <div key={i} className={`p-4 rounded-xl ${cfg.color.bg} border ${cfg.color.border} flex gap-3`}>
            <div className="w-9 h-9 rounded-lg bg-background/50 flex items-center justify-center text-lg flex-shrink-0">{step.icon}</div>
            <div>
              <p className={`text-sm font-heading font-semibold mb-1 ${cfg.color.text}`}>{step.title}</p>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-heading font-semibold mb-3">⚙️ Parametri Tehnici</h3>
          <div className="space-y-0">
            {cfg.specs.map((s, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border-subtle last:border-0">
                <span className="text-sm text-muted-foreground font-body">{s.k}</span>
                <span className="text-sm font-mono font-semibold">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-heading font-semibold mb-3">📋 Universe Simboluri ({cfg.universe.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {cfg.universe.map(sym => {
              const isCrypto = sym.includes("/");
              const isETF = ["QQQ","SOXL","TQQQ","ARKK","SPY","IWM","GLD","SLV","USO"].includes(sym);
              return (
                <span key={sym} className={`px-2 py-1 rounded-lg text-xs font-mono border ${isCrypto ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : isETF ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : `${cfg.color.bg} ${cfg.color.border} ${cfg.color.text}`}`}>{sym}</span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveTrading() {
  const [bots, setBots] = useState<Record<BotKey, BotData>>({
    v1: { portfolio: null, trades: [], positions: [], signals: [] },
    v2: { portfolio: null, trades: [], positions: [], signals: [] },
    v3: { portfolio: null, trades: [], positions: [], signals: [] },
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activeBot, setActiveBot] = useState<BotKey>("v2");
  const [activeTab, setActiveTab] = useState<TabKey>("live");

  const fetchAll = useCallback(async () => {
    const [p1,t1,s1,p2,pos2,t2,s2,p3,pos3,t3,s3] = await Promise.all([
      sbFetch(SB.v1,"portfolio_snapshot"), sbFetch(SB.v1,"trades","timestamp.desc",100), sbFetch(SB.v1,"signals","updated_at.desc",12),
      sbFetch(SB.v2,"portfolio_snapshot"), sbFetch(SB.v2,"open_positions"), sbFetch(SB.v2,"trades","timestamp.desc",100), sbFetch(SB.v2,"signals","updated_at.desc",12),
      sbFetch(SB.v3,"portfolio_snapshot"), sbFetch(SB.v3,"open_positions"), sbFetch(SB.v3,"trades","timestamp.desc",100), sbFetch(SB.v3,"signals","updated_at.desc",12),
    ]);
    setBots({
      v1: { portfolio: p1?.[0]??null, trades: t1??[], positions: [], signals: s1??[] },
      v2: { portfolio: p2?.[0]??null, trades: t2??[], positions: pos2??[], signals: s2??[] },
      v3: { portfolio: p3?.[0]??null, trades: t3??[], positions: pos3??[], signals: s3??[] },
    });
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); const iv = setInterval(fetchAll, 10000); return () => clearInterval(iv); }, [fetchAll]);

  const cfg = BOT_CONFIG[activeBot];
  const data = bots[activeBot];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "live", label: "📡 Live" },
    { key: "trades", label: "📋 Toate Tradele" },
    { key: "rezultate", label: "📊 Rezultate" },
    { key: "strategie", label: "🧠 Strategie" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-card border border-border-subtle rounded-2xl p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" /></span>
              <h1 className="font-heading font-bold text-xl">Live Trading — Cei 3 Boți</h1>
            </div>
            <p className="text-xs text-muted-foreground font-body">Tranzacții live · istoric complet · strategie detaliată · rezultate · refresh la 10s</p>
          </div>
          {lastUpdate && <p className="text-xs text-muted-foreground font-mono">sync {lastUpdate.toLocaleTimeString("ro-RO")}</p>}
        </div>
      </div>

      {/* Bot Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["v1","v2","v3"] as BotKey[]).map(key => {
          const c = BOT_CONFIG[key];
          const d = bots[key];
          const eq = d.portfolio?.equity ?? 0;
          const pnl = d.portfolio?.pnl ?? 0;
          const sell = d.trades.filter(t => t.action === "SELL");
          const wr = sell.length > 0 ? (sell.filter(t => (t.pl??0)>0).length / sell.length * 100) : 0;
          const isActive = activeBot === key;
          return (
            <button key={key} onClick={() => { setActiveBot(key); setActiveTab("live"); }}
              className={`text-left bg-card border rounded-2xl p-5 transition-all duration-200 shadow-lg shadow-black/20 ${isActive ? `${c.color.border} ring-1 ring-inset ${c.color.border}` : "border-border-subtle hover:border-border"}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl ${c.color.bg} border ${c.color.border} flex items-center justify-center text-xl`}>{c.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-body truncate">{c.subtitle}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${c.color.badge}`}>{c.statusLabel}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground font-body">Equity</p><p className="font-mono font-semibold">{eq > 0 ? formatCurrencyPlain(eq) : "—"}</p></div>
                <div><p className="text-muted-foreground font-body">P&L</p><p className={`font-mono font-semibold ${pnl >= 0 ? "text-accent" : "text-danger"}`}>{pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}</p></div>
                <div><p className="text-muted-foreground font-body">Trades total</p><p className="font-mono font-semibold">{d.trades.length}</p></div>
                <div><p className="text-muted-foreground font-body">Win Rate</p><p className={`font-mono font-semibold ${wr >= 50 ? "text-accent" : wr > 0 ? "text-yellow-400" : "text-muted-foreground"}`}>{sell.length > 0 ? `${wr.toFixed(0)}%` : "—"}</p></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      <div className="bg-card border border-border-subtle rounded-2xl shadow-lg shadow-black/20 overflow-hidden">
        {/* Panel Header + Tabs */}
        <div className={`px-6 py-4 border-b border-border-subtle ${cfg.color.bg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cfg.emoji}</span>
              <div>
                <h2 className={`font-heading font-bold ${cfg.color.text}`}>{cfg.name}</h2>
                <p className="text-xs text-muted-foreground font-body">{cfg.subtitle} · {cfg.universe.length} simboluri</p>
              </div>
            </div>
            <div className="sm:ml-auto flex gap-1.5 flex-wrap">
              {tabs.map(t => <Tab key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>{t.label}</Tab>)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "live" && <LiveTab data={data} cfg={cfg} loading={loading} />}
          {activeTab === "trades" && <TradesTab data={data} loading={loading} />}
          {activeTab === "rezultate" && <RezultateTab data={data} loading={loading} />}
          {activeTab === "strategie" && <StrategieTab cfg={cfg} />}
        </div>
      </div>

    </div>
  );
}
