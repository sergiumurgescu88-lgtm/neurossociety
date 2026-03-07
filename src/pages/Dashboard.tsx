import { formatCurrencyPlain, formatCurrency, formatPercent } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Link } from "react-router-dom";

interface DashboardProps {
  portfolio: any;
  positions: any[];
  signals: any[];
  trades: any[];
  equityHistory: number[];
  loading: boolean;
}

function SkeletonCard() {
  return <div className="bg-card border border-border-subtle rounded-xl p-6 animate-pulse"><div className="h-4 bg-card-hover rounded w-24 mb-3" /><div className="h-8 bg-card-hover rounded w-32 mb-2" /><div className="h-3 bg-card-hover rounded w-20" /></div>;
}

export default function Dashboard({ portfolio, positions, signals, trades, equityHistory, loading }: DashboardProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4"><div className="lg:col-span-3"><SkeletonCard /></div><div className="lg:col-span-2"><SkeletonCard /></div></div>
      </div>
    );
  }

  const equity = portfolio?.equity ?? 0;
  const pnl = portfolio?.pnl ?? 0;
  const pnlPct = portfolio?.pnl_pct ?? 0;
  const cash = portfolio?.cash ?? 0;
  const cashRatio = equity > 0 ? (cash / equity) * 100 : 0;
  const totalTrades = portfolio?.total_trades ?? 0;
  const totalPl = portfolio?.total_pl ?? 0;

  // Win rate from trades
  const sellTrades = trades.filter((t: any) => t.action === "SELL");
  const wins = sellTrades.filter((t: any) => (t.pl ?? 0) > 0).length;
  const losses = sellTrades.filter((t: any) => (t.pl ?? 0) <= 0).length;
  const winRate = sellTrades.length > 0 ? (wins / sellTrades.length) * 100 : 0;

  const chartData = equityHistory.map((v, i) => ({ idx: i, equity: v }));
  const eqMin = Math.min(...equityHistory);
  const eqMax = Math.max(...equityHistory);
  const allSame = eqMin === eqMax;

  const topSignals = [...signals].sort((a: any, b: any) => (b.confidence ?? 0) - (a.confidence ?? 0)).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Equity */}
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground font-body mb-1">Total Equity</p>
          <p className="text-2xl font-mono font-semibold">{formatCurrencyPlain(equity)}</p>
          <p className={`text-sm font-mono mt-1 flex items-center gap-1 ${pnl >= 0 ? "text-accent" : "text-danger"}`}>
            {pnl >= 0 ? "↑" : "↓"} {formatCurrency(pnl)} ({formatPercent(pnlPct)})
          </p>
        </div>

        {/* Cash */}
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground font-body mb-1">Available Cash</p>
          <p className="text-2xl font-mono font-semibold">{formatCurrencyPlain(cash)}</p>
          <p className="text-xs text-muted-foreground mt-1">{cashRatio.toFixed(1)}% of portfolio</p>
          <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${Math.min(cashRatio, 100)}%` }} />
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground font-body mb-1">Win Rate</p>
          <p className={`text-2xl font-mono font-semibold ${sellTrades.length === 0 ? "text-muted-foreground" : winRate >= 50 ? "text-accent" : winRate >= 40 ? "text-warning" : "text-danger"}`}>
            {winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">{sellTrades.length === 0 ? "No closed trades yet" : `${wins}W / ${losses}L / ${sellTrades.length} Total`}</p>
        </div>

        {/* Realized P&L */}
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground font-body mb-1">Realized P&L</p>
          <p className={`text-2xl font-mono font-semibold ${totalPl >= 0 ? "text-accent" : "text-danger"}`}>
            {formatCurrency(totalPl)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">from {totalTrades} closed trades</p>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Equity Curve */}
        <div className="lg:col-span-3 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <div className="mb-4">
            <h3 className="font-heading text-base font-semibold">Equity Curve</h3>
            <p className="text-xs text-muted-foreground">Last {equityHistory.length} cycles</p>
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
                <YAxis domain={[eqMin * 0.999, eqMax * 1.001]} hide />
                <XAxis dataKey="idx" hide />
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

        {/* Market Status */}
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <h3 className="font-heading text-base font-semibold mb-4">Market Status</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">SPY Change</span>
              <span className={`font-mono text-sm ${(portfolio?.spy_change_pct ?? 0) >= 0 ? "text-accent" : "text-danger"}`}>
                {(portfolio?.spy_change_pct ?? 0) >= 0 ? "↑" : "↓"} {formatPercent(portfolio?.spy_change_pct)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Market Trend</span>
              <TrendBadge trend={portfolio?.market_trend} />
            </div>

            {portfolio?.safe_mode && (
              <div className="bg-warning-dim border border-warning/20 rounded-lg p-3 flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-warning text-xs font-medium">SAFE MODE ACTIVE — Not buying</span>
              </div>
            )}
          </div>

          <div className="border-t border-border-subtle my-4" />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Current Cycle</p>
              <p className="font-mono font-semibold">#{portfolio?.cycle ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open Positions</p>
              <p className="font-mono font-semibold">{portfolio?.open_positions ?? 0}/6</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bot Status</p>
              <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /><span className="text-accent text-xs">Active</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Cycle</p>
              <p className="font-mono text-xs">~14 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signals Table */}
      <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-base font-semibold">Latest AI Signals</h3>
            <p className="text-xs text-muted-foreground">Current cycle analysis</p>
          </div>
          <Link to="/signals" className="text-xs text-accent hover:underline">View all signals →</Link>
        </div>

        {topSignals.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No signals yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs text-muted-foreground">
                  <th className="text-left pb-3 font-medium">Symbol</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                  <th className="text-left pb-3 font-medium">Confidence</th>
                  <th className="text-left pb-3 font-medium hidden md:table-cell">RSI</th>
                  <th className="text-left pb-3 font-medium hidden lg:table-cell">EMA Trend</th>
                  <th className="text-left pb-3 font-medium">Executed</th>
                </tr>
              </thead>
              <tbody>
                {topSignals.map((s: any) => (
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
                    <td className="py-3 hidden md:table-cell">
                      <span className={`font-mono text-xs ${(s.rsi ?? 50) < 30 ? "text-accent" : (s.rsi ?? 50) > 70 ? "text-danger" : "text-muted-foreground"}`}>
                        {s.rsi?.toFixed(1) ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <span className={`text-xs ${s.ema_trend === "bullish" ? "text-accent" : s.ema_trend === "bearish" ? "text-danger" : "text-muted-foreground"}`}>
                        {s.ema_trend ?? "—"}
                      </span>
                    </td>
                    <td className="py-3">
                      {s.executed ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-accent-dim text-accent px-2 py-0.5 rounded-full">✓</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    BUY: "bg-accent-dim text-accent",
    SELL: "bg-danger-dim text-danger",
    HOLD: "bg-secondary text-muted-foreground",
  };
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[action] ?? styles.HOLD}`}>{action}</span>;
}

function TrendBadge({ trend }: { trend?: string }) {
  const t = (trend ?? "NEUTRAL").toUpperCase();
  const styles: Record<string, string> = {
    BULL: "bg-accent-dim text-accent",
    BULLISH: "bg-accent-dim text-accent",
    BEAR: "bg-danger-dim text-danger",
    BEARISH: "bg-danger-dim text-danger",
    VOLATILE: "bg-warning-dim text-warning",
    NEUTRAL: "bg-secondary text-muted-foreground",
  };
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[t] ?? styles.NEUTRAL}`}>{t}</span>;
}
