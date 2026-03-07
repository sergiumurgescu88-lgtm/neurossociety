import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import logo from "@/assets/logo.png";

// Stock logos
import logoAAPL from "@/assets/logos/aapl.png";
import logoMSFT from "@/assets/logos/msft.png";
import logoNVDA from "@/assets/logos/nvda.png";
import logoTSLA from "@/assets/logos/tsla.png";
import logoGOOGL from "@/assets/logos/googl.png";
import logoAMZN from "@/assets/logos/amzn.png";
import logoMETA from "@/assets/logos/meta.png";
import logoAMD from "@/assets/logos/amd.png";

// Feature icons
import iconShield from "@/assets/icons/shield.png";
import iconChart from "@/assets/icons/chart-bars.png";
import iconGlobe from "@/assets/icons/globe.png";
import iconTrailing from "@/assets/icons/trailing.png";
import iconSizing from "@/assets/icons/sizing.png";
import iconBell from "@/assets/icons/bell.png";

/* ── Animated counter hook ── */
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as any, { once: true, margin: "-50px" });
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView || !inView || started.current) return;
    started.current = true;
    const steps = 60;
    const inc = end / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += inc;
      if (current >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [inView, end, duration, startOnView]);

  return { count, ref };
}

/* ── Section wrapper with scroll reveal ── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Data ── */
const symbols = [
  { ticker: "AAPL", name: "Apple Inc.", logo: logoAAPL, bg: "bg-[#1a1a1a]" },
  { ticker: "MSFT", name: "Microsoft", logo: logoMSFT, bg: "bg-[#00a4ef]/10" },
  { ticker: "NVDA", name: "NVIDIA", logo: logoNVDA, bg: "bg-[#76b900]/10" },
  { ticker: "TSLA", name: "Tesla Inc.", logo: logoTSLA, bg: "bg-[#cc0000]/10" },
  { ticker: "GOOGL", name: "Alphabet", logo: logoGOOGL, bg: "bg-[#4285f4]/10" },
  { ticker: "AMZN", name: "Amazon", logo: logoAMZN, bg: "bg-[#ff9900]/10" },
  { ticker: "META", name: "Meta Platforms", logo: logoMETA, bg: "bg-[#1877f2]/10" },
  { ticker: "AMD", name: "AMD Inc.", logo: logoAMD, bg: "bg-[#ed1c24]/10" },
];

const howItWorks = [
  { emoji: "📰", title: "Colectare Știri", desc: "NewsAPI, Yahoo Finance, Google News, Finviz, Seeking Alpha — agregate în timp real pentru fiecare simbol." },
  { emoji: "🧠", title: "Analiză Gemini AI", desc: "Sentiment analysis, confidence score, reasoning detaliat — totul procesat de Google Gemini 2.0 Flash." },
  { emoji: "⚡", title: "Execuție Automată", desc: "RSI + MACD + EMA + Kelly position sizing → ordine trimise automat prin Alpaca Markets." },
];

const features = [
  { icon: iconShield, title: "Stop Loss / Take Profit", desc: "Fiecare poziție protejată automat cu SL -5% și TP +12%." },
  { icon: iconChart, title: "RSI + MACD + EMA", desc: "Indicatori tehnici calculați în timp real pentru semnale precise." },
  { icon: iconGlobe, title: "Market Regime Detection", desc: "Analiză SPY pentru detectare trend: Bull, Bear, Volatile." },
  { icon: iconTrailing, title: "Trailing Stop Dinamic", desc: "Urmărește prețul și vinde automat la -4% de la maxim." },
  { icon: iconSizing, title: "Kelly Position Sizing", desc: "Mărimea pozițiilor calculată matematic pentru randament optim." },
  { icon: iconBell, title: "Notificări Telegram", desc: "Alerte instant pentru fiecare tranzacție și event important." },
];

/* ── Mini sparkline SVG ── */
function Sparkline() {
  const points = Array.from({ length: 20 }, (_, i) => {
    const y = 20 + Math.sin(i * 0.8 + Math.random()) * 12 + (i > 12 ? -i * 0.5 : i * 0.3);
    return `${i * 5},${Math.max(2, Math.min(38, y))}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 95 40" className="w-full h-8 mt-2">
      <polyline fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round" points={points} opacity="0.7" />
    </svg>
  );
}

/* ── Mock dashboard preview ── */
function DashboardPreview() {
  const [eq, setEq] = useState(127843);
  useEffect(() => {
    const i = setInterval(() => {
      setEq((v) => v + Math.floor(Math.random() * 200 - 80));
    }, 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="bg-card/80 border border-border-subtle rounded-2xl p-5 backdrop-blur-sm shadow-2xl shadow-black/40 max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono text-accent uppercase tracking-wider">Live</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">Cycle #247</span>
      </div>
      <p className="text-xs text-muted-foreground font-body mb-1">Portfolio Equity</p>
      <p className="text-2xl font-mono font-bold text-foreground">${eq.toLocaleString()}</p>
      <div className="flex gap-3 mt-3">
        <span className="text-xs font-mono text-accent">+$2,847 (+2.27%)</span>
        <span className="text-xs font-mono text-muted-foreground">8 positions</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {["NVDA +3.2%", "AAPL +1.1%", "TSLA -0.8%"].map((s) => (
          <div key={s} className={`text-[10px] font-mono px-2 py-1 rounded-md text-center ${s.includes("-") ? "bg-[hsl(var(--danger-dim))] text-[hsl(var(--danger))]" : "bg-[hsl(var(--accent-dim))] text-accent"}`}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const c1 = useCounter(8);
  const c2 = useCounter(10);
  const c3 = useCounter(15);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#050810" }}>
      {/* ── Animated grid background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(hsl(160 84% 39% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 39% / 0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      <div className="fixed top-[-200px] right-[-200px] w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(160 84% 39% / 0.06) 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(200 90% 50% / 0.04) 0%, transparent 70%)" }} />

      {/* ═══ 1. NAVBAR ═══ */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="NeuroTrade" className="w-8 h-8 object-contain" />
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            Neuro<span className="text-accent">Trade</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-border-subtle text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card-hover transition-colors duration-150">
            Live Demo
          </Link>
          <Link to="/dashboard" className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors duration-150 shadow-lg shadow-accent/20">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* ═══ 2. HERO ═══ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent mb-6">
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>🤖</motion.span>
                Powered by Gemini AI
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-6 text-foreground"
            >
              Tranzacționează<br />
              Inteligent. Autonom.{" "}
              <span className="text-accent">24/7.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base lg:text-lg text-muted-foreground font-body leading-relaxed mb-8 max-w-xl"
            >
              Bot de trading AI care analizează știri în timp real, calculează indicatori tehnici și execută ordine automat pe piața americană.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-5"
            >
              <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-all duration-150 shadow-lg shadow-accent/25">
                Vezi Dashboard Live →
              </Link>
              <Link to="/dashboard" className="px-6 py-3 rounded-xl border-2 border-border-subtle text-muted-foreground font-semibold text-sm hover:bg-card-hover hover:text-foreground transition-all duration-150">
                Demo Gratuit
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body"
            >
              <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> Fără cont necesar</span>
              <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> Date în timp real</span>
              <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> Paper trading</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* ═══ 3. STATS BAR ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pb-28">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { ref: c1.ref, value: c1.count, suffix: " Simboluri", sub: "monitorizate", icon: "📡", gradient: "from-accent/20 to-accent/5" },
            { ref: c2.ref, value: c2.count, suffix: " min", sub: "ciclu de analiză", icon: "⏱️", gradient: "from-[hsl(200_90%_50%/0.2)] to-[hsl(200_90%_50%/0.05)]" },
            { ref: null, value: "~15", suffix: " știri", sub: "per simbol / ciclu", icon: "📰", gradient: "from-accent/20 to-accent/5", isStatic: true },
            { ref: null, value: "24/7", suffix: "", sub: "uptime continuu", icon: "🔋", gradient: "from-[hsl(200_90%_50%/0.2)] to-[hsl(200_90%_50%/0.05)]", isStatic: true },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="relative group overflow-hidden rounded-2xl border border-border-subtle bg-card/40 backdrop-blur-md p-6 hover:border-accent/40 transition-all duration-300">
                {/* Gradient glow top */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-lg mb-4">
                  {s.icon}
                </div>
                {/* Number */}
                <p className="font-heading text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-none" ref={s.ref as any}>
                  {s.isStatic ? s.value : s.value}
                  <span className="text-base lg:text-lg font-medium text-muted-foreground ml-1">{s.suffix}</span>
                </p>
                {/* Label */}
                <p className="text-xs text-muted-foreground font-body mt-2 uppercase tracking-wider">{s.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 4. CUM FUNCȚIONEAZĂ ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pb-24">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">Cum Funcționează</h2>
            <p className="text-muted-foreground font-body max-w-lg mx-auto">De la știri brute la tranzacții executate — în 3 pași automatizați.</p>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {howItWorks.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.15}>
              <div className="bg-card/60 border border-border-subtle rounded-xl p-6 backdrop-blur-sm hover:border-accent/40 transition-colors duration-200">
                <span className="text-4xl mb-4 block">{step.emoji}</span>
                <h3 className="font-heading text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 5. SIMBOLURI MONITORIZATE ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pb-24">
        <Reveal>
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-3">Simboluri Monitorizate</h2>
            <p className="text-muted-foreground font-body">8 acțiuni tech majore, analizate non-stop.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {symbols.map((s, i) => (
            <Reveal key={s.ticker} delay={i * 0.06}>
              <div className="bg-card/60 border border-border-subtle rounded-xl p-4 backdrop-blur-sm hover:border-accent/30 transition-colors duration-200">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center overflow-hidden`}>
                    <img src={s.logo} alt={s.ticker} className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-heading font-semibold text-foreground">{s.ticker}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{s.name}</p>
                  </div>
                </div>
                <Sparkline />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 6. FEATURES GRID ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pb-24">
        <Reveal>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-center text-foreground mb-12">Features</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="bg-card/60 border border-border-subtle rounded-xl p-6 backdrop-blur-sm hover:border-accent/40 transition-colors duration-200 h-full">
                <img src={f.icon} alt={f.title} className="w-10 h-10 object-contain mb-4" />
                <h3 className="font-heading text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 7. LIVE DEMO CTA ═══ */}
      <Reveal>
        <section className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 pb-24">
          <div className="rounded-2xl p-10 lg:p-16 text-center relative overflow-hidden" style={{
            background: "linear-gradient(135deg, hsl(160 84% 39% / 0.15) 0%, hsl(200 90% 50% / 0.1) 100%)",
            border: "1px solid hsl(160 84% 39% / 0.25)",
          }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "radial-gradient(circle, hsl(160 84% 39%) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />
            <h2 className="font-heading text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4 relative z-10">
              Explorează Dashboard-ul Live
            </h2>
            <p className="text-muted-foreground font-body mb-8 max-w-md mx-auto relative z-10">
              Date reale, bot activ, fără înregistrare necesară.
            </p>
            <Link to="/dashboard" className="inline-flex px-8 py-4 rounded-xl bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/90 transition-all duration-150 shadow-xl shadow-accent/30 relative z-10">
              Deschide Dashboard →
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ═══ 8. FOOTER ═══ */}
      <footer className="relative z-10 border-t border-border-subtle py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="NeuroTrade" className="w-6 h-6 object-contain opacity-60" />
            <span className="text-xs text-muted-foreground font-body">NeuroTrade © 2026</span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 font-body text-center">
            Paper Trading Only. Nu reprezintă consultanță financiară.
          </p>
        </div>
      </footer>
    </div>
  );
}
