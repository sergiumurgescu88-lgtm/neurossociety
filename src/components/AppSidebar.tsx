import { NavLink, useLocation } from "react-router-dom";
import { formatCurrencyPlain, formatCurrency } from "@/lib/format";
import logo from "@/assets/logo.png";
import { LogOut } from "lucide-react";

interface SidebarProps {
  portfolio: { equity?: number; pnl?: number; pnl_pct?: number; updated_at?: string } | null;
  userEmail?: string;
  onSignOut?: () => void;
}

const navItems = [
  { path: "/live-trading", label: "Live Trading", emoji: "📺", isLive: true },
  { path: "/dashboard", label: "Dashboard", emoji: "📊" },
  { path: "/positions", label: "Positions", emoji: "📈" },
  { path: "/signals", label: "AI Signals", emoji: "🤖" },
  { path: "/trades", label: "Trade History", emoji: "📋" },
  { path: "/settings", label: "Settings", emoji: "⚙️" },
] as const;

export default function AppSidebar({ portfolio, userEmail, onSignOut }: SidebarProps) {
  const location = useLocation();
  const isFresh = portfolio?.updated_at
    ? (Date.now() - new Date(portfolio.updated_at).getTime()) < 30000
    : false;

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-background border-r border-border-subtle fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2">
          <img src={logo} alt="NeuroSSociety Logo" className="w-8 h-8 object-contain" />
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Neuro<span className="text-accent">SS</span>ociety
          </h1>
        </div>
        <p className="text-[12px] text-muted-foreground mt-1 font-body">
          AI Trading. Automated. 24/7.
        </p>
      </div>

      <div className="mx-4 border-t border-border-subtle" />

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isLive = 'isLive' in item && item.isLive;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors duration-150 ${
                isLive
                  ? isActive
                    ? "bg-accent/20 text-accent border-l-[3px] border-accent shadow-[0_0_12px_hsl(var(--accent)/0.3)]"
                    : "text-accent hover:bg-accent/10 hover:shadow-[0_0_12px_hsl(var(--accent)/0.2)]"
                  : isActive
                    ? "bg-accent-dim text-accent border-l-[3px] border-accent"
                    : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
              }`}
            >
              {isLive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
              )}
              <span className="text-base">{item.emoji}</span>
              <span className={`font-medium ${isLive ? 'animate-pulse' : ''}`}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mini portfolio */}
      <div className="p-4 border-t border-border-subtle">
        <div className="bg-card rounded-xl p-4 border border-border-subtle">
          <p className="text-xs text-muted-foreground font-body">Portfolio Value</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xl font-mono font-semibold text-foreground">
              {portfolio?.equity != null ? formatCurrencyPlain(portfolio.equity) : "—"}
            </p>
            {isFresh && (
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </div>
          {portfolio?.pnl != null && (
            <p className={`text-sm font-mono mt-0.5 ${(portfolio.pnl ?? 0) >= 0 ? "text-accent" : "text-danger"}`}>
              {(portfolio.pnl ?? 0) >= 0 ? "↑" : "↓"} {formatCurrency(portfolio.pnl)} ({portfolio.pnl_pct?.toFixed(2)}%)
            </p>
          )}
        </div>

        {/* User section */}
        {userEmail && (
          <>
            <div className="my-3 border-t border-border-subtle" />
            <p className="text-[11px] text-muted-foreground truncate mb-2 font-body">{userEmail}</p>
            <button
              onClick={onSignOut}
              className="w-full py-1.5 text-xs rounded-lg border border-border-subtle text-muted-foreground hover:bg-card-hover hover:text-foreground transition-colors duration-150 flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
