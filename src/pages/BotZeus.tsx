import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatCurrencyPlain, formatPercent } from "@/lib/format";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const SB_URL = "https://kabpblepskchkhucbper.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthYnBibGVwc2tjaGtodWNicGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ3NjU4MywiZXhwIjoyMDg5MDUyNTgzfQ.AxjpJD8JPx_KJYOZCWqFEU-gmra7DsrpsXe62YSbkUI";

async function fetchTable<T>(table: string, order?: string, limit?: number): Promise<T[]> {
  let url = `${SB_URL}/rest/v1/${table}?select=*`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  const res = await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!res.ok) return [];
  return res.json();
}

export default function BotZeus() {
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
      if (eh?.length > 0) setEquityHistory(eh.map((e: any) => e.equity ?? e.value ?? 0));
      else if (p?.[0]?.equity) setEquityHistory(prev => [...prev.slice(-59), p[0].equity]);
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
  const sellTrades = trades.filter(t => t.action === "SELL");
  const wins = sellTrades.filter(t => (t.pl ?? 0) > 0).length;
  const winRate = sellTrades.length > 0 ? (wins / sellTrades.length) * 100 : 0;
  const totalPl = portfolio?.total_pl ?? 0;
  const chartData = equityHistory.map((v, i) => ({ idx: i, equity: v }));
  const eqMin = equityHistory.length > 1 ? Math.min(...equityHistory) : 0;
  const eqMax = equityHistory.length > 1 ? Math.max(...equityHistory) : 0;

  return (
    <div className="space-y-8">
      <div className="bg-card border border-blue-500/20 rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl">⚡</div>
            <div>
              <h1 className="text-2xl font-heading font-bold">NeuroTrade <span className="text-blue-400">ZEUS</span></h1>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400" />
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">LIVE</span>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400">Paper</span>
            {lastUpdate && <span className="text-xs text-muted-foreground font-mono hidden sm:block">{lastUpdate.toLocaleTimeString("ro-RO")}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Equity", val: equity > 0 ? formatCurrencyPlain(equity) : "—", sub: <span className={`text-sm font-mono ${pnl>=0?"text-accent":"text-danger"}`}>{pnl>=0?"↑":"↓"} {formatCurrency(pnl)} ({formatPercent(pnlPct)})</span> },
          { label: "Cash", val: equity > 0 ? formatCurrencyPlain(cash) : "—", sub: <span className="text-xs text-muted-foreground">{equity>0?`${((cash/equity)*100).toFixed(1)}%`:"—"}</span> },
          { label: "Poziții", val: `${openPos}/10`, sub: <span className="text-xs text-muted-foreground">{totalTrades} total</span> },
          { label: "Win Rate", val: sellTrades.length>0?`${winRate.toFixed(0)}%`:"—", color: winRate>=50?"text-accent":winRate>=40?"text-yellow-400":sellTrades.length===0?"":"text-danger", sub: <span className="text-xs text-muted-foreground">P&L: <span className={totalPl>=0?"text-accent":"text-danger"}>{totalPl>=0?"+":""}{totalPl.toFixed(2)}$</span></span> },
        ].map((c,i) => (
          <div key={i} className="bg-card border border-border-subtle rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
            {loading ? <div className="h-7 bg-card-hover rounded animate-pulse w-28" /> : <>
              <p className={`text-2xl font-mono font-semibold ${(c as any).color??""}`}>{c.val}</p>
              <div className="mt-1">{c.sub}</div>
            </>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-card border border-border-subtle rounded-xl p-5">
          <h3 className="font-heading text-base font-semibold mb-4">Equity Curve</h3>
          {chartData.length < 2
            ? <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">Collecting data...</div>
            : <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs><linearGradient id="gBotZeus" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#888" stopOpacity={0.15}/><stop offset="100%" stopColor="#888" stopOpacity={0}/></linearGradient></defs>
                  <YAxis domain={[eqMin*0.9995, eqMax*1.0005]} hide/><XAxis dataKey="idx" hide/>
                  <Tooltip contentStyle={{ background:"hsl(217,33%,11%)", border:"1px solid hsl(215,19%,17%)", borderRadius:8, fontSize:12 }} labelStyle={{display:"none"}} formatter={(v:number)=>[formatCurrencyPlain(v),"Equity"]}/>
                  <Area type="monotone" dataKey="equity" stroke="#888" strokeWidth={2} fill="url(#gBotZeus)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
          }
        </div>
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl p-5">
          <h3 className="font-heading text-base font-semibold mb-4">Semnale</h3>
          {loading
            ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-8 bg-card-hover rounded animate-pulse"/>)}</div>
            : signals.length===0
              ? <p className="text-muted-foreground text-sm">Niciun semnal.</p>
              : <div className="space-y-2">{signals.map((s:any)=>(
                  <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border-subtle/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">{s.symbol}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${s.action==="BUY"?"bg-blue-500/10 text-blue-400":s.action==="SELL"?"bg-danger/10 text-danger":"bg-secondary text-muted-foreground"}`}>{s.action}</span>
                    </div>
                    <span className="text-xs font-mono text-blue-400">{s.confidence??""}%</span>
                  </div>
                ))}</div>
          }
        </div>
      </div>

      <div className="bg-card border border-border-subtle rounded-2xl p-6">
        <h2 className="text-lg font-heading font-semibold mb-4">Ultimele trades</h2>
        {loading
          ? <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-12 bg-card-hover rounded-lg animate-pulse"/>)}</div>
          : trades.length===0
            ? <div className="text-center py-8"><p className="text-2xl mb-2">⚡</p><p className="text-muted-foreground text-sm">BotZeus rulează. Piața e închisă sau confidence-ul nu a fost atins.</p></div>
            : <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-border-subtle">{["Simbol","Acțiune","Preț","Qty","P&L","Data"].map(h=><th key={h} className={`py-2 px-3 text-xs text-muted-foreground font-normal ${["Preț","P&L","Data"].includes(h)?"text-right":"text-left"} ${h==="Data"?"hidden sm:table-cell":""}`}>{h}</th>)}</tr></thead>
                <tbody>{trades.map(t=>(
                  <tr key={t.id} className="border-b border-border-subtle/50 hover:bg-card-hover/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold">{t.symbol}</td>
                    <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded text-xs font-mono ${t.action==="BUY"?"bg-blue-500/10 text-blue-400":"bg-danger/10 text-danger"}`}>{t.action}</span></td>
                    <td className="py-2.5 px-3 text-right font-mono">${(t.price??0).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{t.qty??"—"}</td>
                    <td className={`py-2.5 px-3 text-right font-mono ${(t.pl??0)>0?"text-accent":(t.pl??0)<0?"text-danger":"text-muted-foreground"}`}>{t.pl!=null?`${(t.pl??0)>=0?"+":""}${(t.pl??0).toFixed(2)}$`:"—"}</td>
                    <td className="py-2.5 px-3 text-right text-xs text-muted-foreground hidden sm:table-cell">{t.timestamp?new Date(t.timestamp).toLocaleDateString("ro-RO"):"—"}</td>
                  </tr>
                ))}</tbody>
              </table></div>
        }
      </div>

      {logs.length > 0 && (
        <div className="bg-card border border-border-subtle rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              🖥️ Bot Logs
              <span className="flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/>
                <span className="text-xs text-blue-400 font-mono">LIVE</span>
              </span>
            </h2>
            <span className="text-xs text-muted-foreground">last {logs.length} events</span>
          </div>
          <div className="space-y-0.5 font-mono text-xs max-h-[220px] overflow-y-auto scrollbar-hide">
            {logs.map((log:any)=>(
              <div key={log.id} className={`flex gap-3 py-1 border-b border-border-subtle/30 ${log.level==="ERROR"?"text-destructive":log.level==="WARNING"?"text-warning":"text-muted-foreground"}`}>
                <span className="text-muted-foreground/60 shrink-0">{log.timestamp?new Date(log.timestamp).toLocaleTimeString("ro-RO",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"--"}</span>
                <span className={`shrink-0 px-1.5 rounded text-[10px] border ${log.level==="ERROR"?"text-destructive border-destructive/20 bg-destructive/10":log.level==="WARNING"?"text-warning border-warning/20 bg-warning/10":"text-blue-400 border-blue-400/20 bg-blue-400/10"}`}>{log.level}</span>
                <span className="truncate">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
