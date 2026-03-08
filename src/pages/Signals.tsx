import { useState } from "react";
import { formatCurrencyPlain, timeAgo } from "@/lib/format";
import { analyzeWatchlist } from "@/lib/gemini-service";
import { toast } from "sonner";

interface SignalsPageProps {
  signals: any[];
  loading: boolean;
}

export default function SignalsPage({ signals, loading }: SignalsPageProps) {
  const [filter, setFilter] = useState("ALL");
  const [aiSignals, setAiSignals] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeWatchlist();
      setAiSignals(result.signals);
      setLastAnalysis(result.generatedAt);
      toast.success(`AI analyzed ${result.signals.length} symbols via ${result.model}`);
    } catch (err: any) {
      toast.error(err.message || "AI analysis failed");
      console.error("AI analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-card border border-border-subtle rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-card-hover rounded w-24 mb-4" />
            <div className="h-3 bg-card-hover rounded w-full mb-2" />
            <div className="h-3 bg-card-hover rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const allSignals = signals;
  const filters = ["ALL", "BUY", "SELL", "HOLD"];
  const counts: Record<string, number> = { ALL: allSignals.length };
  filters.slice(1).forEach(f => { counts[f] = allSignals.filter(s => s.action === f).length; });

  const filtered = filter === "ALL" ? allSignals : allSignals.filter(s => s.action === filter);

  const avgConfidence = allSignals.length > 0
    ? (allSignals.reduce((sum, s) => sum + (s.confidence ?? 0), 0) / allSignals.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold">AI Signals</h1>
        <p className="text-sm text-muted-foreground">Gemini 2.0 Flash analysis — refreshes every cycle</p>
      </div>

      {/* AI Analysis button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {analyzing ? "Analyzing…" : "🤖 Run AI Analysis"}
        </button>
        {lastAnalysis && (
          <span className="text-xs text-muted-foreground">Last: {new Date(lastAnalysis).toLocaleTimeString()}</span>
        )}
        {aiSignals.length > 0 && (
          <span className="text-xs text-accent font-medium">{aiSignals.length} AI signals</span>
        )}
      </div>

      {/* AI Signals Section */}
      {aiSignals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-semibold text-accent">AI-Generated Signals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSignals.map((s: any, i: number) => (
              <SignalCard key={`ai-${i}`} signal={{ ...s, id: `ai-${i}`, price: 0, updated_at: lastAnalysis }} />
            ))}
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="bg-card border border-border-subtle rounded-xl p-4 shadow-lg shadow-black/20 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total:</span>
          <span className="font-mono text-sm font-semibold">{allSignals.length}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-dim text-accent font-medium">BUY {counts.BUY ?? 0}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-danger-dim text-danger font-medium">SELL {counts.SELL ?? 0}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">HOLD {counts.HOLD ?? 0}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Avg Confidence:</span>
          <span className="font-mono text-sm font-semibold">{avgConfidence}%</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
              filter === f ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-card-hover"
            }`}
          >
            {f} <span className="ml-1 opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border-subtle rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No signals match this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s: any) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal: s }: { signal: any }) {
  const [expanded, setExpanded] = useState(false);
  const confColor = (s.confidence ?? 0) >= 80 ? "bg-accent" : (s.confidence ?? 0) >= 65 ? "bg-warning" : "bg-danger";
  const actionStyles: Record<string, string> = {
    BUY: "bg-accent-dim text-accent",
    SELL: "bg-danger-dim text-danger",
    HOLD: "bg-secondary text-muted-foreground",
  };
  const riskColors: Record<string, string> = {
    LOW: "bg-accent-dim text-accent",
    MEDIUM: "bg-warning-dim text-warning",
    HIGH: "bg-danger-dim text-danger",
  };

  const isLowConfHold = s.action === "HOLD" && (s.confidence ?? 0) < 65;

  return (
    <div className={`relative bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20 hover:bg-card-hover transition-colors duration-150 ${isLowConfHold ? "opacity-60" : ""}`}>
      {/* Top */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-heading text-lg font-bold">{s.symbol}</span>
          <span className="ml-2 font-mono text-sm text-muted-foreground">{formatCurrencyPlain(s.price)}</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${actionStyles[s.action] ?? actionStyles.HOLD}`}>{s.action}</span>
      </div>

      {/* Confidence */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">AI Confidence</span>
          <span className="font-mono">{s.confidence}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${confColor}`} style={{ width: `${s.confidence ?? 0}%` }} />
        </div>
      </div>

      {/* Technical pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-md bg-secondary font-mono ${(s.rsi ?? 50) < 30 ? "text-accent" : (s.rsi ?? 50) > 70 ? "text-danger" : "text-muted-foreground"}`}>
          RSI {s.rsi?.toFixed(1) ?? "—"}
        </span>
        <span className={`text-xs px-2 py-1 rounded-md bg-secondary ${s.macd === "bullish" ? "text-accent" : s.macd === "bearish" ? "text-danger" : "text-muted-foreground"}`}>
          MACD {s.macd ?? "—"}
        </span>
        <span className={`text-xs px-2 py-1 rounded-md bg-secondary ${s.ema_trend === "bullish" ? "text-accent" : s.ema_trend === "bearish" ? "text-danger" : "text-muted-foreground"}`}>
          EMA {s.ema_trend ?? "—"}
        </span>
      </div>

      {/* Risk + Timestamp */}
      <div className="flex items-center justify-between mb-2">
        {s.risk_level && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${riskColors[s.risk_level?.toUpperCase()] ?? riskColors.MEDIUM}`}>
            {s.risk_level.toUpperCase()} RISK
          </span>
        )}
        {s.updated_at && (
          <span className="text-xs text-muted-foreground">Updated {timeAgo(s.updated_at)}</span>
        )}
      </div>

      {/* Executed / Blocked */}
      {s.executed && (
        <div className="mt-3 bg-accent-dim text-accent text-xs rounded-lg px-3 py-2 font-medium">✓ Trade Executed</div>
      )}
      {s.block_reason && (
        <p className="mt-2 text-xs text-danger">⛔ {s.block_reason}</p>
      )}

      {/* Reasoning */}
      {s.reasoning && (
        <div className="mt-3">
          <p className={`text-xs text-muted-foreground italic whitespace-pre-line ${expanded ? "" : "line-clamp-2"}`}>{s.reasoning}</p>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-accent mt-1 hover:underline">
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      )}
    </div>
  );
}
