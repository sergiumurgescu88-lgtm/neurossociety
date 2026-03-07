import { useState } from "react";
import { formatCurrencyPlain, formatCurrency, formatPercent } from "@/lib/format";
import { timeAgo } from "@/lib/format";
import { ArrowUpDown, TrendingUp, TrendingDown, Wallet, BarChart3, Shield } from "lucide-react";

interface Position {
  id: string;
  symbol: string;
  qty: number;
  avg_entry: number;
  current_price: number;
  market_value: number;
  unrealized_pl: number;
  unrealized_pct: number;
  stop_loss: number;
  take_profit: number;
  updated_at?: string;
}

interface PositionsPageProps {
  positions: Position[];
  loading: boolean;
}

type SortKey = "symbol" | "unrealized_pl" | "unrealized_pct" | "market_value" | "current_price";

export default function PositionsPage({ positions, loading }: PositionsPageProps) {
  const [sortKey, setSortKey] = useState<SortKey>("unrealized_pl");
  const [sortAsc, setSortAsc] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Summary skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border-subtle rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-card-hover rounded w-16 mb-3" />
              <div className="h-6 bg-card-hover rounded w-24" />
            </div>
          ))}
        </div>
        {/* Position cards skeleton */}
        {[1, 2, 3].map((i) => (
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
  const totalMarketValue = positions.reduce((sum, p) => sum + (p.market_value ?? 0), 0);
  const totalShares = positions.reduce((sum, p) => sum + (p.qty ?? 0), 0);
  const winnersCount = positions.filter((p) => (p.unrealized_pl ?? 0) > 0).length;
  const losersCount = positions.filter((p) => (p.unrealized_pl ?? 0) < 0).length;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sortedPositions = [...positions].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold">Open Positions</h1>
          <p className="text-sm text-muted-foreground">
            {positions.length} active position{positions.length !== 1 ? "s" : ""} · {totalShares} total shares
          </p>
        </div>
        {positions.length > 0 && (
          <span
            className={`font-mono text-sm font-semibold px-3 py-1.5 rounded-full ${
              totalUnrealized >= 0 ? "bg-accent-dim text-accent" : "bg-danger-dim text-danger"
            }`}
          >
            Unrealized: {formatCurrency(totalUnrealized)}
          </span>
        )}
      </div>

      {/* Summary cards */}
      {positions.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            icon={<Wallet className="w-4 h-4 text-muted-foreground" />}
            label="Market Value"
            value={formatCurrencyPlain(totalMarketValue)}
          />
          <SummaryCard
            icon={
              totalUnrealized >= 0 ? (
                <TrendingUp className="w-4 h-4 text-accent" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger" />
              )
            }
            label="Total P&L"
            value={formatCurrency(totalUnrealized)}
            valueColor={totalUnrealized >= 0 ? "text-accent" : "text-danger"}
          />
          <SummaryCard
            icon={<BarChart3 className="w-4 h-4 text-muted-foreground" />}
            label="Winners / Losers"
            value={`${winnersCount} / ${losersCount}`}
            valueColor="text-foreground"
          />
          <SummaryCard
            icon={<Shield className="w-4 h-4 text-muted-foreground" />}
            label="Positions"
            value={`${positions.length}`}
            valueColor="text-foreground"
          />
        </div>
      )}

      {/* Sort controls */}
      {positions.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          {(
            [
              { key: "symbol", label: "Symbol" },
              { key: "unrealized_pl", label: "P&L" },
              { key: "unrealized_pct", label: "P&L %" },
              { key: "market_value", label: "Value" },
            ] as { key: SortKey; label: string }[]
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => handleSort(item.key)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors duration-150 flex items-center gap-1 ${
                sortKey === item.key
                  ? "bg-accent-dim text-accent border-accent/30"
                  : "border-border-subtle text-muted-foreground hover:bg-card-hover"
              }`}
            >
              {item.label}
              {sortKey === item.key && <ArrowUpDown className="w-3 h-3" />}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {positions.length === 0 ? (
        <div className="bg-card border border-border-subtle rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-lg font-semibold mb-2">No Open Positions</h3>
          <p className="text-sm text-muted-foreground mb-1">The AI bot is actively monitoring the market.</p>
          <p className="text-sm text-muted-foreground mb-6">New positions will appear here when high-confidence signals are detected.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-dim border border-accent/20">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent">Bot scanning for opportunities</span>
          </div>
        </div>
      ) : (
        /* Position cards */
        <div className="space-y-3">
          {sortedPositions.map((pos) => (
            <PositionCard key={pos.id} pos={pos} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  valueColor = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`font-mono text-lg font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
}

function PositionCard({ pos }: { pos: Position }) {
  const isProfit = (pos.unrealized_pl ?? 0) >= 0;

  // Progress from entry towards TP (clamped 0-100)
  const plProgress =
    pos.take_profit && pos.avg_entry
      ? Math.min(Math.max(((pos.current_price - pos.avg_entry) / (pos.take_profit - pos.avg_entry)) * 100, 0), 100)
      : 0;

  // Distances
  const slDistance = pos.current_price && pos.stop_loss ? Math.abs(pos.current_price - pos.stop_loss) : null;
  const tpDistance = pos.current_price && pos.take_profit ? Math.abs(pos.take_profit - pos.current_price) : null;
  const slPct = pos.stop_loss && pos.current_price ? ((pos.current_price - pos.stop_loss) / pos.current_price) * 100 : null;
  const tpPct = pos.take_profit && pos.current_price ? ((pos.take_profit - pos.current_price) / pos.current_price) * 100 : null;

  // Price change from entry
  const priceChange = pos.current_price - pos.avg_entry;

  return (
    <div
      className={`bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20 border-l-[3px] transition-colors duration-150 hover:bg-card-hover/50 ${
        isProfit ? "border-l-accent" : "border-l-danger"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-heading text-xl font-bold">{pos.symbol}</p>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  isProfit ? "bg-accent-dim text-accent" : "bg-danger-dim text-danger"
                }`}
              >
                {isProfit ? "PROFIT" : "LOSS"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pos.qty} shares · Entry {formatCurrencyPlain(pos.avg_entry)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-mono text-lg font-bold ${isProfit ? "text-accent" : "text-danger"}`}>
            {formatCurrency(pos.unrealized_pl)}
          </p>
          <span
            className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
              isProfit ? "bg-accent-dim text-accent" : "bg-danger-dim text-danger"
            }`}
          >
            {formatPercent(pos.unrealized_pct)}
          </span>
        </div>
      </div>

      {/* Price & value grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Current Price</p>
          <p className="font-mono font-semibold">{formatCurrencyPlain(pos.current_price)}</p>
          <p className={`font-mono text-[10px] ${priceChange >= 0 ? "text-accent" : "text-danger"}`}>
            {priceChange >= 0 ? "↑" : "↓"} {formatCurrencyPlain(Math.abs(priceChange))} from entry
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Market Value</p>
          <p className="font-mono font-semibold">{formatCurrencyPlain(pos.market_value)}</p>
          <p className="font-mono text-[10px] text-muted-foreground">
            Cost: {formatCurrencyPlain(pos.avg_entry * pos.qty)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Stop Loss</p>
          <p className="font-mono font-semibold text-danger">{formatCurrencyPlain(pos.stop_loss)}</p>
          {slDistance != null && (
            <p className="font-mono text-[10px] text-danger/70">
              {formatCurrencyPlain(slDistance)} away ({slPct?.toFixed(1)}%)
            </p>
          )}
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground mb-0.5">Take Profit</p>
          <p className="font-mono font-semibold text-accent">{formatCurrencyPlain(pos.take_profit)}</p>
          {tpDistance != null && (
            <p className="font-mono text-[10px] text-accent/70">
              {formatCurrencyPlain(tpDistance)} away ({tpPct?.toFixed(1)}%)
            </p>
          )}
        </div>
      </div>

      {/* Progress bar: SL ← current → TP */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span className="text-danger">SL</span>
          <span>{plProgress.toFixed(0)}% to target</span>
          <span className="text-accent">TP</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isProfit ? "bg-accent" : "bg-danger"}`}
            style={{ width: `${plProgress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      {pos.updated_at && (
        <p className="text-[10px] text-muted-foreground/60 mt-3 text-right">
          Updated {timeAgo(pos.updated_at)}
        </p>
      )}
    </div>
  );
}
