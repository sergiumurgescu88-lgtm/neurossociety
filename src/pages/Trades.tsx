import { useState } from "react";
import { formatCurrencyPlain, formatCurrency } from "@/lib/format";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TradesPageProps {
  trades: any[];
  loading: boolean;
}

export default function TradesPage({ trades, loading }: TradesPageProps) {
  const [page, setPage] = useState(0);
  const perPage = 20;

  if (loading) {
    return (
      <div className="bg-card border border-border-subtle rounded-xl p-6 animate-pulse">
        {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-card-hover rounded mb-2" />)}
      </div>
    );
  }

  const sorted = [...trades].sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime());
  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice(page * perPage, (page + 1) * perPage);

  const buyTrades = trades.filter(t => t.action === "BUY");
  const sellTrades = trades.filter(t => t.action === "SELL");
  const totalInvested = buyTrades.reduce((s, t) => s + (t.value || (t.qty ?? 0) * (t.price ?? 0)), 0);
  const totalReturned = sellTrades.reduce((s, t) => s + (t.value || (t.qty ?? 0) * (t.price ?? 0)), 0);
  const netBalance = totalReturned - totalInvested;
  const wins = sellTrades.filter(t => (t.pl ?? 0) > 0).length;
  const winRate = sellTrades.length > 0 ? (wins / sellTrades.length * 100) : 0;
  const totalPl = sellTrades.reduce((s, t) => s + (t.pl ?? 0), 0);
  const bestTrade = sellTrades.length > 0 ? Math.max(...sellTrades.map(t => t.pl ?? 0)) : 0;

  // P&L chart data - last 10 sell trades
  const plChartData = [...sellTrades]
    .sort((a, b) => new Date(a.timestamp ?? 0).getTime() - new Date(b.timestamp ?? 0).getTime())
    .slice(-10)
    .map((t, i) => ({
      name: t.symbol ?? `#${i + 1}`,
      pl: t.pl ?? 0,
    }));

  const typeColors: Record<string, string> = {
    SIGNAL: "bg-blue-500/10 text-blue-400",
    STOP_LOSS: "bg-danger-dim text-danger",
    TAKE_PROFIT: "bg-accent-dim text-accent",
    TRAILING_STOP: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
        <h3 className="font-heading text-sm font-semibold mb-3">Sumar Financiar <span className="text-[9px] text-accent/60 font-normal">(calculat din trade-uri)</span></h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Investit (BUY)</p>
            <p className="font-mono text-lg font-semibold">{formatCurrency(totalInvested)}</p>
            <p className="text-[10px] text-muted-foreground">{buyTrades.length} tranzacții</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Returnat (SELL)</p>
            <p className="font-mono text-lg font-semibold">{formatCurrency(totalReturned)}</p>
            <p className="text-[10px] text-muted-foreground">{sellTrades.length} tranzacții</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Balanță Netă</p>
            <p className={`font-mono text-lg font-semibold ${netBalance >= 0 ? "text-accent" : "text-danger"}`}>{formatCurrency(netBalance)}</p>
            <p className="text-[10px] text-muted-foreground">returnat − investit</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Trades", value: trades.length.toString() },
          { label: "Win Rate", value: `${winRate.toFixed(1)}%` },
          { label: "Realized P&L", value: formatCurrency(totalPl), color: totalPl >= 0 ? "text-accent" : "text-danger" },
          { label: "Best Trade", value: formatCurrency(bestTrade), color: "text-accent" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border-subtle rounded-xl p-4 shadow-lg shadow-black/20">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`font-mono text-lg font-semibold ${s.color ?? ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* P&L Bar Chart */}
      {plChartData.length > 0 && (
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <h3 className="font-heading text-sm font-semibold mb-3">P&L per Trade (Last 10)</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={plChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(218,11%,65%)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "hsl(217,33%,11%)", border: "1px solid hsl(215,19%,17%)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v), "P&L"]}
              />
              <Bar dataKey="pl" radius={[4, 4, 0, 0]}>
                {plChartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.pl >= 0 ? "hsl(160,84%,39%)" : "hsl(0,84%,60%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border-subtle rounded-xl shadow-lg shadow-black/20 overflow-hidden">
        {paged.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No trades yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs text-muted-foreground">
                  <th className="text-left p-4 font-medium">Time</th>
                  <th className="text-left p-4 font-medium">Symbol</th>
                  <th className="text-left p-4 font-medium">Action</th>
                  <th className="text-left p-4 font-medium">Qty @ Price</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Value</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Type</th>
                  <th className="text-left p-4 font-medium">P&L</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((t) => {
                  const hasQty = t.qty != null && t.qty > 0;
                  const computedValue = hasQty && t.price ? t.qty * t.price : 0;
                  const displayValue = computedValue > 0 ? formatCurrencyPlain(computedValue) : t.value ? formatCurrencyPlain(t.value) : "—";

                  return (
                    <tr
                      key={t.id}
                      className={`border-b border-border-subtle/50 hover:bg-card-hover transition-colors duration-150 border-l-[3px] ${
                        t.action === "BUY" ? "border-l-accent/30" : "border-l-danger/30"
                      }`}
                    >
                      <td className="p-4 text-muted-foreground text-xs">
                        {t.timestamp ? format(new Date(t.timestamp), "MMM d, HH:mm") : "—"}
                      </td>
                      <td className="p-4 font-heading font-semibold">{t.symbol}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.action === "BUY" ? "bg-accent-dim text-accent" : "bg-danger-dim text-danger"}`}>
                          {t.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {hasQty ? `${t.qty} @ ` : ""}{formatCurrencyPlain(t.price)}
                      </td>
                      <td className="p-4 font-mono text-xs hidden md:table-cell">
                        {displayValue}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {t.close_type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[t.close_type] ?? "bg-secondary text-muted-foreground"}`}>
                            {t.close_type}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {t.action === "SELL" && t.pl != null && hasQty ? (
                          <span className={`font-mono font-semibold ${t.pl >= 0 ? "text-accent" : "text-danger"}`}>{formatCurrency(t.pl)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {t.confidence != null && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: `${t.confidence}%` }} />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">{t.confidence}%</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border-subtle">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs rounded-lg border border-border-subtle hover:bg-card-hover transition-colors duration-150 disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-border-subtle hover:bg-card-hover transition-colors duration-150 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
