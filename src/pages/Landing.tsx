import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatCurrencyPlain, formatNumber } from "@/lib/format";

const SUPABASE_URL = "https://lgrllhsfgvnngtmlwwug.supabase.co";
const SUPABASE_KEY = "sb_publishable_KtQkZ2_nx8rR65ypG9ZWSw_AjVWWX-N";

export default function LandingPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/portfolio_snapshot?select=*`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data?.[0] ?? null))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-pattern opacity-[0.03]" />

      {/* Radial glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-heading text-xl font-bold tracking-tight">
            Neuro<span className="text-accent">SS</span>ociety
          </span>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors duration-150"
        >
          Open Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-3xl">
          <h1 className="font-heading text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Your AI Trading Bot.{" "}
            <span className="text-accent">Running 24/7.</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground font-body leading-relaxed mb-10 max-w-2xl">
            NeuroSSociety analyzes 8 stocks across 8 news sources using Google Gemini AI, executes trades automatically, and protects your capital with smart risk management.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors duration-150 shadow-lg shadow-accent/20"
            >
              View Live Dashboard →
            </Link>
            <a
              href="#features"
              className="px-6 py-3 rounded-xl border border-border-subtle text-muted-foreground font-medium text-sm hover:bg-card-hover transition-colors duration-150"
            >
              Learn More ↓
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              emoji: "🤖",
              title: "AI-Powered Analysis",
              desc: "Google Gemini 2.0 Flash analyzes news sentiment + RSI + MACD + EMA every 15 minutes",
            },
            {
              emoji: "🛡",
              title: "Smart Risk Management",
              desc: "Automatic Stop Loss (-5%), Take Profit (+12%), and Trailing Stop (-4%) protect every position",
            },
            {
              emoji: "📱",
              title: "Real-Time Control",
              desc: "Monitor your portfolio live and receive instant Telegram notifications for every trade",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border-subtle rounded-xl p-6 shadow-lg shadow-black/20 hover:bg-card-hover transition-colors duration-150"
            >
              <span className="text-3xl mb-4 block">{f.emoji}</span>
              <h3 className="font-heading text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-accent tracking-wider uppercase">Live Data</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Current Equity", value: stats?.equity != null ? formatCurrencyPlain(stats.equity) : "—" },
            { label: "Total Trades", value: stats?.total_trades != null ? formatNumber(stats.total_trades) : "—" },
            { label: "Active Since", value: stats?.cycle != null ? `Cycle #${stats.cycle}` : "—" },
            {
              label: "Market Status",
              value: (stats?.market_trend ?? "—").toUpperCase(),
            },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
              <p className="text-xs text-muted-foreground mb-1 font-body">{s.label}</p>
              <p className="text-xl font-mono font-semibold">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="flex flex-wrap justify-center gap-3">
          {["Python 3.12", "Google Gemini AI", "Alpaca Markets", "Supabase", "8 News Sources"].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border-subtle"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-subtle py-8 text-center">
        <p className="text-sm text-muted-foreground font-body">
          NeuroSSociety v2.0 — AI Trading. Automated. 24/7.
        </p>
        <Link to="/dashboard" className="text-xs text-accent hover:underline mt-2 inline-block">
          Open Dashboard →
        </Link>
      </footer>
    </div>
  );
}
