import { RefreshCw, Menu } from "lucide-react";
import { timeAgo } from "@/lib/format";

interface HeaderProps {
  title: string;
  cycle?: number;
  lastUpdate: Date | null;
  isSyncing: boolean;
  onRefresh: () => void;
  onMenuToggle?: () => void;
}

export default function AppHeader({ title, cycle, lastUpdate, isSyncing, onRefresh, onMenuToggle }: HeaderProps) {
  const isLive = lastUpdate && (Date.now() - lastUpdate.getTime()) < 30000;

  return (
    <header className="h-16 border-b border-border-subtle flex items-center justify-between px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-card-hover transition-colors duration-150">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isLive ? "bg-accent animate-pulse-slow" : "bg-muted-foreground"}`} />
          <span className={`font-body text-xs ${isLive ? "text-accent" : "text-muted-foreground"}`}>
            {isLive ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        {cycle != null && (
          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">Cycle #{cycle}</span>
        )}

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
