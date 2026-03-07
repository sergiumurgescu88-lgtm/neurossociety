import { useState } from "react";
import { formatCurrencyPlain, formatCurrency } from "@/lib/format";
import { format } from "date-fns";

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

  const sellTrades = trades.filter(t => t.action === "SELL");
  const wins = sellTrades.filter(t => (t.pl ?? 0) > 0).length;
  const winRate = sellTrades.length > 0 ? (wins / sellTrades.length * 100) : 0;
  const totalPl = sellTrades.reduce((s, t) => s + (t.pl ?? 0), 0);
  const bestTrade = sellTrades.length > 0 ? Math.max(...sellTrades.map(t => t.pl ?? 0)) : 0;

  const typeColors: Record<string, string> = {
    SIGNAL: "bg-blue-500/10 text-blue-400",
    STOP_LOSS: "bg-danger-dim text-danger",
    TAKE_PROFIT: "bg-accent-dim text-accent",
    TRAILING_STOP: "bg-purple-500/10 text-purple-400",
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Trades", value: trades.length.toString() },
          { label: "Win Rate", value: `${winRate.toFixed(1)}%` },
          { label: "Total P&L", value: formatCurrency(totalPl), color: totalPl >= 0 ? "text-accent" : "text-danger" },
          { label: "Best Trade", value: formatCurrency(bestTrade), color: "text-accent" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border-subtle rounded-xl p-4 shadow-lg shadow-black/20">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`font-mono text-lg font-semibold ${s.color ?? ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

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
                {paged.map((t) => (
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
                      {t.qty ? `${t.qty} @ ` : ""}{formatCurrencyPlain(t.price)}
                    </td>
                    <td className="p-4 font-mono text-xs hidden md:table-cell">
                      {(t.qty && t.price) ? formatCurrencyPlain(t.qty * t.price) : t.value ? formatCurrencyPlain(t.value) : "—"}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {t.close_type && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[t.close_type] ?? "bg-secondary text-muted-foreground"}`}>
                          {t.close_type}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {t.action === "SELL" && t.pl != null ? (
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
                ))}
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
