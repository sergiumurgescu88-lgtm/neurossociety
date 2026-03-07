import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatCurrencyPlain, formatNumber } from "@/lib/format";

const SUPABASE_URL = "https://lgrllhsfgvnngtmlwwug.supabase.co";
const SUPABASE_KEY = "sb_publishable_KtQkZ2_nx8rR65ypG9ZWSw_AjVWWX-N";

const faqs = [
  { q: "Do I need trading experience?", a: "No! NeuroSSociety is fully automated. You connect your Alpaca account, fund it, and the bot handles everything else. Zero trading knowledge required." },
  { q: "How much capital do I need?", a: "We recommend starting with at least $1,000. Alpaca has a $2,000 minimum for pattern day trading, but you can start smaller with swing trading mode." },
  { q: "What's the typical return?", a: "Past performance doesn't guarantee future results. Our backtests show 15-25% annual returns, but actual results vary based on market conditions. Check our live dashboard for real-time performance." },
  { q: "Is my money safe?", a: "Your funds stay in your own Alpaca brokerage account — NeuroSSociety only has trading permissions. We never hold your money. Plus, Alpaca is SIPC-insured up to $500,000." },
  { q: "Can I stop the bot anytime?", a: "Yes! You have full control. Pause the bot, modify settings, or cancel your subscription anytime. No lock-in periods." },
  { q: "What stocks does it trade?", a: "Currently 8 major tech stocks: AMD, NVDA, TSLA, GOOGL, AAPL, MSFT, META, AMZN. We chose these for liquidity and news coverage. Enterprise plans can customize the stock universe." },
];

const problems = [
  { emoji: "⏰", title: "Market Never Sleeps", desc: "The stock market is open 24/5. It's impossible to monitor constantly without burning out." },
  { emoji: "📰", title: "Information Overload", desc: "Thousands of news articles daily. How do you filter signal from noise?" },
  { emoji: "😰", title: "Emotional Decisions", desc: "Fear and greed destroy profits. Most traders lose money because of emotions." },
];

const steps = [
  { n: 1, title: "Continuous Scanning", desc: "Monitors 8 tech stocks (AMD, NVDA, TSLA, GOOGL, AAPL, MSFT, META, AMZN) every 15 minutes." },
  { n: 2, title: "Multi-Source Data Collection", desc: "Aggregates news from 8 sources (NewsAPI, Yahoo Finance, Finviz, Seeking Alpha, Google News, etc.) + technical indicators (RSI, MACD, EMA)." },
  { n: 3, title: "AI-Powered Analysis", desc: "Google Gemini 2.0 Flash evaluates sentiment, technical signals, and risk level to generate BUY/SELL/HOLD signals with confidence scores." },
  { n: 4, title: "Automated Execution", desc: "Executes trades via Alpaca Markets with automatic stop-loss (-5%), take-profit (+12%), and trailing stops (-4%)." },
  { n: 5, title: "Real-Time Monitoring", desc: "Sends instant Telegram notifications for every trade, monitors all positions with trailing stops, and activates Safe Mode if daily loss reaches -3%." },
];

const features = [
  { emoji: "🤖", title: "AI-Powered Analysis", desc: "Google Gemini 2.0 Flash processes news sentiment, technical indicators (RSI, MACD, EMA), and market context to generate high-confidence trading signals." },
  { emoji: "🛡️", title: "Smart Risk Management", desc: "Every position protected with automatic Stop Loss (-5%), Take Profit (+12%), Trailing Stop (-4%), and Safe Mode activation at -3% daily loss." },
  { emoji: "⚡", title: "100% Automated", desc: "Zero human intervention required. The bot runs 24/7, executes trades automatically, and manages positions without emotional decision-making." },
  { emoji: "📊", title: "Real-Time Dashboard", desc: "Track your portfolio, positions, signals, trades, and performance in real-time with a beautiful, public dashboard." },
  { emoji: "📱", title: "Instant Notifications", desc: "Receive Telegram alerts for every trade execution, position update, and risk event. Stay informed without watching charts 24/7." },
  { emoji: "💎", title: "Transparent & Scalable", desc: "Public dashboard, open-source code (coming soon), and scalable from $1,000 to $1,000,000+ capital. Join the community." },
];

const techStack = [
  { name: "Python 3.12", icon: "🐍" },
  { name: "Google Gemini AI", icon: "🤖" },
  { name: "Alpaca Markets", icon: "📈" },
  { name: "Supabase", icon: "🗄️" },
  { name: "NewsAPI", icon: "📰" },
  { name: "Yahoo Finance", icon: "💹" },
  { name: "Telegram Bot", icon: "📱" },
  { name: "React + Tailwind", icon: "⚛️" },
];

const testimonials = [
  { stars: 5, text: "Finally a bot that actually works. Made 18% in my first month without lifting a finger. The risk management is incredible.", name: "John D.", role: "Pro Plan Member", initials: "JD" },
  { stars: 5, text: "I was skeptical at first, but the transparency sold me. Being able to see every trade in real-time on the dashboard is a game-changer.", name: "Sarah M.", role: "Starter Plan Member", initials: "SM" },
  { stars: 5, text: "The Safe Mode feature saved me during the last market crash. While everyone was panicking, my bot calmly protected my capital.", name: "Alex K.", role: "Pro Plan Member", initials: "AK" },
];

export default function LandingPage() {
  const [stats, setStats] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-heading text-xl font-bold tracking-tight">
            Neuro<span className="text-accent">SS</span>ociety
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block">Pricing</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block">FAQ</a>
          <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors duration-150">
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-3xl">
          <h1 className="font-heading text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Stop Losing Money to{" "}
            <span className="text-accent">Emotional Trading</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground font-body leading-relaxed mb-8 max-w-2xl">
            NeuroSSociety is an AI-powered trading bot that analyzes 8 stocks across 8 news sources, executes trades automatically, and protects your capital 24/7.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground font-body">
            <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> 100% Automated</span>
            <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> AI-Powered Decisions</span>
            <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> Smart Risk Management</span>
          </div>
          <div className="flex flex-wrap gap-4 mb-8">
            <a href="#pricing" className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors duration-150 shadow-lg shadow-accent/20">
              Start Free Trial →
            </a>
            <Link to="/dashboard" className="px-6 py-3 rounded-xl border-2 border-border-subtle text-muted-foreground font-medium text-sm hover:bg-card-hover transition-colors duration-150">
              View Live Demo
            </Link>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            💎 Join 500+ traders already using NeuroSSociety
          </p>
        </div>
      </section>

      {/* ===== LIVE STATS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-medium text-accent tracking-wider uppercase">Live Performance</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Current Equity", value: stats?.equity != null ? formatCurrencyPlain(stats.equity) : "—" },
            { label: "Total Trades", value: stats?.total_trades != null ? formatNumber(stats.total_trades) : "—" },
            { label: "Active Since", value: stats?.cycle != null ? `Cycle #${stats.cycle}` : "—" },
            { label: "Market Status", value: (stats?.market_trend ?? "—").toUpperCase() },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
              <p className="text-xs text-muted-foreground mb-1 font-body">{s.label}</p>
              <p className="text-xl font-mono font-semibold">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROBLEMS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-center mb-12">
          The Problems with Manual Trading
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div key={p.title} className="bg-card border border-border-subtle rounded-xl p-6 shadow-lg shadow-black/20 text-center">
              <span className="text-4xl mb-4 block">{p.emoji}</span>
              <h3 className="font-heading text-base font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight mb-4">How NeuroSSociety Works</h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            A fully automated AI trading system that never sleeps, never panics, and makes data-driven decisions every 15 minutes.
          </p>
        </div>
        <div className="space-y-6 max-w-3xl mx-auto">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <span className="text-accent font-heading font-bold text-sm">{s.n}</span>
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-center mb-12">
          Why Choose NeuroSSociety
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card border border-border-subtle rounded-xl p-6 shadow-lg shadow-black/20 hover:border-accent/50 transition-colors duration-150">
              <span className="text-3xl mb-4 block">{f.emoji}</span>
              <h3 className="font-heading text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight mb-4">Built with Enterprise-Grade Technology</h2>
          <p className="text-muted-foreground font-body">Production-ready infrastructure designed for reliability, speed, and security.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <span key={tech.name} className="px-4 py-2 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border-subtle flex items-center gap-2">
              <span>{tech.icon}</span>{tech.name}
            </span>
          ))}
        </div>
      </section>

      {/* ===== RISK MANAGEMENT ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-center mb-12">
          Your Capital is Protected
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { emoji: "🔴", title: "Stop Loss -5%", desc: "Automatically closes position if you lose 5% to prevent catastrophic losses." },
            { emoji: "🟢", title: "Take Profit +12%", desc: "Locks in gains automatically when position reaches +12% profit." },
            { emoji: "📈", title: "Trailing Stop -4%", desc: "Follows the price upward and sells if it drops 4% from peak to maximize gains." },
          ].map((r) => (
            <div key={r.title} className="bg-card border border-border-subtle rounded-xl p-6 shadow-lg shadow-black/20 text-center">
              <span className="text-3xl mb-3 block">{r.emoji}</span>
              <h3 className="font-heading text-base font-semibold mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-warning-dim/30 border border-warning/30 rounded-xl p-6 flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-heading text-sm font-bold text-warning mb-1">SAFE MODE</h3>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              If daily portfolio loss reaches -3%, the bot automatically stops all new trades and closes risky positions to protect your capital.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto">
            Choose the plan that fits your trading goals. All plans include full features and 24/7 bot operation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter */}
          <div className="bg-card border border-border-subtle rounded-xl p-6 shadow-lg shadow-black/20 flex flex-col">
            <h3 className="font-heading text-lg font-semibold mb-4">Starter</h3>
            <div className="mb-6">
              <span className="text-4xl font-heading font-bold">$99</span>
              <span className="text-muted-foreground text-sm font-body">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {["Up to $10,000 capital", "8 stocks monitored", "Full risk management", "Telegram notifications", "Real-time dashboard"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-body"><span className="text-accent">✓</span>{f}</li>
              ))}
            </ul>
            <a href="#pricing" className="block w-full text-center px-6 py-3 rounded-lg border-2 border-border-subtle text-foreground font-semibold hover:bg-card-hover transition-colors text-sm">
              Get Started
            </a>
          </div>
          {/* Pro */}
          <div className="bg-card border-2 border-accent rounded-xl p-6 shadow-lg shadow-accent/10 flex flex-col relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full">MOST POPULAR</span>
            <h3 className="font-heading text-lg font-semibold mb-4">Pro</h3>
            <div className="mb-6">
              <span className="text-4xl font-heading font-bold">$299</span>
              <span className="text-muted-foreground text-sm font-body">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {["Up to $100,000 capital", "Everything in Starter", "Priority support", "Custom strategy tweaks", "Advanced analytics"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-body"><span className="text-accent">✓</span>{f}</li>
              ))}
            </ul>
            <a href="#pricing" className="block w-full text-center px-6 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors text-sm shadow-lg shadow-accent/20">
              Start Free Trial
            </a>
          </div>
          {/* Enterprise */}
          <div className="bg-card border border-border-subtle rounded-xl p-6 shadow-lg shadow-black/20 flex flex-col">
            <h3 className="font-heading text-lg font-semibold mb-4">Enterprise</h3>
            <div className="mb-6">
              <span className="text-4xl font-heading font-bold">Custom</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {["Unlimited capital", "Everything in Pro", "Dedicated account manager", "Custom stock universe", "White-label option"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-body"><span className="text-accent">✓</span>{f}</li>
              ))}
            </ul>
            <a href="mailto:contact@neurossociety.com" className="block w-full text-center px-6 py-3 rounded-lg border-2 border-border-subtle text-foreground font-semibold hover:bg-card-hover transition-colors text-sm">
              Contact Sales
            </a>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground font-body mt-8">
          💎 30-day money-back guarantee • Cancel anytime • No long-term contracts
        </p>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-center mb-12">
          What Traders Are Saying
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card border border-border-subtle rounded-xl p-6 shadow-lg shadow-black/20">
              <div className="text-accent text-sm mb-3">{"★".repeat(t.stars)}</div>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-xs font-heading font-bold text-accent">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-heading font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 pb-24">
        <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-card border border-border-subtle rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-4 flex items-center justify-between font-heading text-sm font-semibold hover:bg-card-hover transition-colors"
              >
                {f.q}
                <span className="text-muted-foreground ml-4 flex-shrink-0">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="bg-card border border-border-subtle rounded-2xl p-10 lg:p-16 text-center shadow-lg shadow-black/20">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Ready to Automate Your Trading?
          </h2>
          <p className="text-muted-foreground font-body max-w-xl mx-auto mb-8">
            Join hundreds of traders who've stopped stressing about markets and started making money with AI.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <a href="#pricing" className="px-8 py-3 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90 transition-colors duration-150 shadow-lg shadow-accent/20">
              Start Free 30-Day Trial →
            </a>
            <Link to="/dashboard" className="px-8 py-3 rounded-xl border-2 border-border-subtle text-muted-foreground font-medium text-sm hover:bg-card-hover transition-colors duration-150">
              View Live Dashboard
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground font-body">
            <span><span className="text-accent">✓</span> No credit card required</span>
            <span><span className="text-accent">✓</span> Cancel anytime</span>
            <span><span className="text-accent">✓</span> 30-day guarantee</span>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤖</span>
                <span className="font-heading text-base font-bold tracking-tight">
                  Neuro<span className="text-accent">SS</span>ociety
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-body">AI Trading. Automated. 24/7.</p>
            </div>
            {/* Product */}
            <div>
              <h4 className="font-heading text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Product</h4>
              <div className="space-y-2">
                <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-accent transition-colors font-body">Live Dashboard</Link>
                <a href="#features" className="block text-sm text-muted-foreground hover:text-accent transition-colors font-body">Features</a>
                <a href="#pricing" className="block text-sm text-muted-foreground hover:text-accent transition-colors font-body">Pricing</a>
              </div>
            </div>
            {/* Company */}
            <div>
              <h4 className="font-heading text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Company</h4>
              <div className="space-y-2">
                <a href="mailto:contact@neurossociety.com" className="block text-sm text-muted-foreground hover:text-accent transition-colors font-body">Contact</a>
              </div>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-heading text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors font-body">Privacy Policy</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors font-body">Terms of Service</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors font-body">Risk Disclaimer</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border-subtle pt-6 text-center">
            <p className="text-xs text-muted-foreground font-body">© 2026 NeuroSSociety. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/60 font-body mt-1">Trading involves risk. Past performance is not indicative of future results.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
