import { formatCurrencyPlain, formatCurrency, formatPercent } from "@/lib/format";

interface PositionsPageProps {
  positions: any[];
  loading: boolean;
}

export default function PositionsPage({ positions, loading }: PositionsPageProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-card border border-border-subtle rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-card-hover rounded w-20 mb-3" />
            <div className="h-4 bg-card-hover rounded w-full mb-2" />
            <div className="h-4 bg-card-hover rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const totalUnrealized = positions.reduce((sum, p) => sum + (p.unrealized_pl ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-xl font-bold">Open Positions</h1>
          <p className="text-sm text-muted-foreground">{positions.length} positions open</p>
        </div>
        <span className={`font-mono text-sm font-semibold px-3 py-1 rounded-full ${totalUnrealized >= 0 ? "bg-accent-dim text-accent" : "bg-danger-dim text-danger"}`}>
          Unrealized: {formatCurrency(totalUnrealized)}
        </span>
      </div>

      {positions.length === 0 ? (
        <div className="bg-card border border-border-subtle rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-heading text-lg font-semibold mb-2">No Open Positions</h3>
          <p className="text-sm text-muted-foreground mb-4">The bot is monitoring the market and waiting for signals.</p>
          <span className="inline-flex items-center gap-2 text-xs text-accent">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
            Bot actively scanning
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((pos) => {
            const isProfit = (pos.unrealized_pl ?? 0) >= 0;
            const plProgress = pos.take_profit && pos.avg_entry
              ? Math.min(Math.max(((pos.current_price - pos.avg_entry) / (pos.take_profit - pos.avg_entry)) * 100, 0), 100)
              : 0;

            // Distance to SL and TP
            const slDistance = pos.current_price && pos.stop_loss ? pos.current_price - pos.stop_loss : null;
            const tpDistance = pos.current_price && pos.take_profit ? pos.take_profit - pos.current_price : null;

            return (
              <div
                key={pos.id}
                className={`bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20 border-l-[3px] ${isProfit ? "border-l-accent" : "border-l-danger"}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Symbol */}
                  <div className="lg:w-28">
                    <p className="font-heading text-xl font-bold">{pos.symbol}</p>
                    <p className="text-xs text-muted-foreground">{pos.qty} shares</p>
                  </div>

                  {/* Data points */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Current</p>
                      <p className="font-mono font-semibold">{formatCurrencyPlain(pos.current_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Entry</p>
                      <p className="font-mono text-muted-foreground">{formatCurrencyPlain(pos.avg_entry)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Market Value</p>
                      <p className="font-mono">{formatCurrencyPlain(pos.market_value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Unrealized P&L</p>
                      <p className={`font-mono font-semibold ${isProfit ? "text-accent" : "text-danger"}`}>{formatCurrency(pos.unrealized_pl)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">P&L %</p>
                      <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${isProfit ? "bg-accent-dim text-accent" : "bg-danger-dim text-danger"}`}>
                        {formatPercent(pos.unrealized_pct)}
                      </span>
                    </div>
                  </div>

                  {/* SL/TP with distance */}
                  <div className="lg:w-44 flex lg:flex-col gap-3 lg:gap-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-danger font-mono">SL: {formatCurrencyPlain(pos.stop_loss)}</span>
                      {slDistance != null && (
                        <span className="text-danger/70 font-mono">(-{formatCurrencyPlain(Math.abs(slDistance))} away)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-accent font-mono">TP: {formatCurrencyPlain(pos.take_profit)}</span>
                      {tpDistance != null && (
                        <span className="text-accent/70 font-mono">(+{formatCurrencyPlain(Math.abs(tpDistance))} away)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${plProgress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
