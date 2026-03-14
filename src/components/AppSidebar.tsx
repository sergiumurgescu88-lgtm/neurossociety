import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
const NAV = [
  { path: "/",           label: "Fleet Overview", emoji: "🚀" },
  { path: "/bot-omega",  label: "OMEGA",          emoji: "⚡" },
  { path: "/bot-zeus",   label: "ZEUS",           emoji: "⚡" },
  { path: "/bot-apollo", label: "APOLLO",         emoji: "🌙" },
  { path: "/bot-hermes", label: "HERMES",         emoji: "💨" },
  { path: "/bot-z1",     label: "Z1 / V5",        emoji: "🧠" },
];
export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-card border-r border-border-subtle">
      <div className="px-5 py-6 border-b border-border-subtle">
        <h1 className="font-heading font-bold text-lg">Neurossociety</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Trading Fleet v2</p>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ path, label, emoji }) => (
          <Link key={path} to={path} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-body transition-colors", pathname === path ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-card-hover hover:text-foreground")}>
            <span className="text-base">{emoji}</span>{label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border-subtle">
        <p className="text-[10px] text-muted-foreground font-mono">Paper Trading Mode</p>
      </div>
    </aside>
  );
}
