import { NavLink, useLocation } from "react-router-dom";
import { formatCurrencyPlain, formatCurrency } from "@/lib/format";

interface SidebarProps {
  portfolio: { equity?: number; pnl?: number; pnl_pct?: number; updated_at?: string } | null;
}

const navItems = [
  { path: "/dashboard", label: "Dashboard", emoji: "📊" },
  { path: "/positions", label: "Positions", emoji: "📈" },
  { path: "/signals", label: "AI Signals", emoji: "🤖" },
  { path: "/trades", label: "Trade History", emoji: "📋" },
  { path: "/settings", label: "Settings", emoji: "⚙️" },
];

export default function AppSidebar({ portfolio }: SidebarProps) {
  const location = useLocation();
  const isFresh = portfolio?.updated_at
    ? (Date.now() - new Date(portfolio.updated_at).getTime()) < 30000
    : false;

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-background border-r border-border-subtle fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
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
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors duration-150 ${
                isActive
                  ? "bg-accent-dim text-accent border-l-[3px] border-accent"
                  : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              <span className="font-medium">{item.label}</span>
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
      </div>
    </aside>
  );
}
