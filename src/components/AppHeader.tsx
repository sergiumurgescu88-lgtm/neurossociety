import { RefreshCw, Menu } from "lucide-react";
import { timeAgo } from "@/lib/format";

interface HeaderProps {
  title: string;
  cycle?: number;
  lastUpdate: Date | null;
  isSyncing: boolean;
  onRefresh: () => void;
  onMenuToggle?: () => void;
  marketTrend?: string;
}

export default function AppHeader({ title, cycle, lastUpdate, isSyncing, onRefresh, onMenuToggle, marketTrend }: HeaderProps) {
  const isLive = lastUpdate && (Date.now() - lastUpdate.getTime()) < 30000;
  const isStale = lastUpdate && (Date.now() - lastUpdate.getTime()) > 120000;

  const trendLabel = (marketTrend ?? "NEUTRAL").toUpperCase();
  const trendColor: Record<string, string> = {
    BULL: "bg-accent-dim text-accent",
    BULLISH: "bg-accent-dim text-accent",
    BEAR: "bg-danger-dim text-danger",
    BEARISH: "bg-danger-dim text-danger",
    VOLATILE: "bg-warning-dim text-warning",
    NEUTRAL: "bg-secondary text-muted-foreground",
  };

  return (
    <header className="h-16 border-b border-border-subtle flex items-center justify-between px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-card-hover transition-colors duration-150">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {/* Recording-style live indicator */}
        {isStale ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-warning-dim">
            <span className="text-xs">⚠️</span>
            <span className="text-xs font-medium text-warning">Stale</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-danger-dim">
            <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
            <span className="text-xs font-medium text-danger">Live</span>
          </div>
        )}

        {cycle != null && (
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">Cycle #{cycle}</span>
        )}

        {/* Market trend badge */}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline ${trendColor[trendLabel] ?? trendColor.NEUTRAL}`}>
          {trendLabel}
        </span>

        <span className="text-xs text-muted-foreground hidden sm:inline font-body">
          Updated {timeAgo(lastUpdate)}
        </span>

        <button
          onClick={onRefresh}
          disabled={isSyncing}
          className="p-2 rounded-lg border border-border-subtle hover:bg-card-hover transition-colors duration-150 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isSyncing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
}
