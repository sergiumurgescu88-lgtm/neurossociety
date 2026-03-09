import { ReactNode, useState } from "react";
import logo from "@/assets/logo.png";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import MobileNav from "./MobileNav";
import { formatCurrencyPlain, formatCurrency } from "@/lib/format";

interface LayoutProps {
  children: ReactNode;
  portfolio: any;
  lastUpdate: Date | null;
  isSyncing: boolean;
  onRefresh: () => void;
  connectionError?: boolean;
  userEmail?: string;
  onSignOut?: () => void;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/positions": "Positions",
  "/signals": "AI Signals",
  "/trades": "Trade History",
  "/live-trading": "Live Trading",
  "/settings": "Settings",
};

const navItems = [
  { path: "/dashboard", label: "Dashboard", emoji: "📊" },
  { path: "/positions", label: "Positions", emoji: "📈" },
  { path: "/signals", label: "AI Signals", emoji: "🤖" },
  { path: "/trades", label: "Trade History", emoji: "📋" },
  { path: "/live-trading", label: "Live Trading", emoji: "📺" },
  { path: "/settings", label: "Settings", emoji: "⚙️" },
];

export default function Layout({ children, portfolio, lastUpdate, isSyncing, onRefresh, connectionError, userEmail, onSignOut }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || "Dashboard";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    onSignOut?.();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern opacity-[0.03]" />

      <AppSidebar portfolio={portfolio} userEmail={userEmail} onSignOut={handleSignOut} />

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 h-full bg-background border-r border-border-subtle flex flex-col">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-2">
                <img src={logo} alt="NeuroSSociety Logo" className="w-8 h-8 object-contain" />
                <h1 className="font-heading text-xl font-bold tracking-tight">
                  Neuro<span className="text-accent">SS</span>ociety
                </h1>
              </div>
              <p className="text-[12px] text-muted-foreground mt-1">AI Trading. Automated. 24/7.</p>
            </div>
            <div className="mx-4 border-t border-border-subtle" />
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                      isActive ? "bg-accent-dim text-accent border-l-[3px] border-accent" : "text-muted-foreground hover:bg-card-hover"
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border-subtle">
              <div className="bg-card rounded-xl p-4 border border-border-subtle">
                <p className="text-xs text-muted-foreground">Portfolio Value</p>
                <p className="text-xl font-mono font-semibold text-foreground mt-1">
                  {portfolio?.equity != null ? formatCurrencyPlain(portfolio.equity) : "—"}
                </p>
                {portfolio?.pnl != null && (
                  <p className={`text-sm font-mono mt-0.5 ${(portfolio.pnl ?? 0) >= 0 ? "text-accent" : "text-danger"}`}>
                    {(portfolio.pnl ?? 0) >= 0 ? "↑" : "↓"} {formatCurrency(portfolio.pnl)}
                  </p>
                )}
              </div>
              {/* User section (mobile) */}
              {userEmail && (
                <>
                  <div className="my-3 border-t border-border-subtle" />
                  <p className="text-[11px] text-muted-foreground truncate mb-2">{userEmail}</p>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-1.5 text-xs rounded-lg border border-border-subtle text-muted-foreground hover:bg-card-hover transition-colors duration-150"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      <div className="lg:ml-60 min-h-screen flex flex-col relative z-10">
        <AppHeader
          title={title}
          cycle={portfolio?.cycle}
          lastUpdate={lastUpdate}
          isSyncing={isSyncing}
          onRefresh={onRefresh}
          onMenuToggle={() => setMobileMenuOpen(true)}
          marketTrend={portfolio?.market_trend}
        />

        {connectionError && (
          <div className="mx-4 lg:mx-6 mt-4 bg-warning-dim border border-warning/20 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
            <span>⚠️</span>
            <span className="text-warning text-sm font-medium">Connection issue — retrying...</span>
          </div>
        )}

        {portfolio?.safe_mode && (
          <div className="mx-4 lg:mx-6 mt-4 bg-warning-dim border border-warning/20 rounded-lg p-3 flex items-center gap-2">
            <span>⚠️</span>
            <span className="text-warning text-sm font-medium">SAFE MODE ACTIVE — Market conditions unfavorable. Bot is not buying.</span>
          </div>
        )}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
