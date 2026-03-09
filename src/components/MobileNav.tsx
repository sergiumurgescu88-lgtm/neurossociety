import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  { path: "/live-trading", label: "Live", emoji: "📺", isLive: true },
  { path: "/dashboard", label: "Dashboard", emoji: "📊" },
  { path: "/positions", label: "Positions", emoji: "📈" },
  { path: "/signals", label: "Signals", emoji: "🤖" },
  { path: "/trades", label: "Trades", emoji: "📋" },
] as const;

export default function MobileNav() {
  const location = useLocation();

  // Don't show on landing page
  if (location.pathname === "/") return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border-subtle flex justify-around py-2 px-1">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 ${'isLive' in tab && tab.isLive ? 'relative' : ''}`}
          >
            {'isLive' in tab && tab.isLive && (
              <span className="absolute -top-0.5 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
            )}
            <span className={`text-lg w-10 h-7 flex items-center justify-center rounded-full transition-colors duration-150 ${isActive ? "bg-accent-dim" : ""}`}>
              {tab.emoji}
            </span>
            <span className={`text-[10px] font-body ${'isLive' in tab && tab.isLive ? 'text-accent font-medium' : isActive ? "text-accent font-medium" : "text-muted-foreground"}`}>
              {tab.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
