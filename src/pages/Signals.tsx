import { useState } from "react";
import { format } from "date-fns";
import { formatCurrencyPlain, timeAgo } from "@/lib/format";
import useAiSignals, { type AiSignal } from "@/hooks/useAiSignals";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface SignalsPageProps {
  signals: any[];
  loading: boolean;
}

export default function SignalsPage({ signals, loading }: SignalsPageProps) {
  const [filter, setFilter] = useState("ALL");
  const [symbolFilter, setSymbolFilter] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const { aiSignals, loading: aiLoading, analyzing, runAnalysis } = useAiSignals();

  if (loading && aiLoading) {
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
  
  // Get unique symbols for filter dropdown
  const uniqueSymbols = [...new Set([...signals.map(s => s.symbol), ...aiSignals.map(s => s.symbol)])].sort();
  
  // Apply filters
  const applyFilters = (signalsList: any[]) => {
    return signalsList.filter(s => {
      // Action filter
      if (filter !== "ALL" && s.action !== filter) return false;
      
      // Symbol filter
      if (symbolFilter !== "ALL" && s.symbol !== symbolFilter) return false;
      
      // Date range filter
      if (fromDate || toDate) {
        const signalDate = new Date(s.created_at || s.updated_at);
        if (fromDate && signalDate < fromDate) return false;
        if (toDate && signalDate > toDate) return false;
      }
      
      return true;
    });
  };
  
  const filteredSignals = applyFilters(allSignals);
  const filteredAiSignals = applyFilters(aiSignals);
  
  const filters = ["ALL", "BUY", "SELL", "HOLD"];
  const counts: Record<string, number> = { ALL: filteredSignals.length };
  filters.slice(1).forEach(f => { counts[f] = filteredSignals.filter(s => s.action === f).length; });

  const avgConfidence = filteredSignals.length > 0
    ? (filteredSignals.reduce((sum, s) => sum + (s.confidence ?? 0), 0) / filteredSignals.length).toFixed(1)
    : "0.0";

  const clearFilters = () => {
    setFilter("ALL");
    setSymbolFilter("ALL");
    setFromDate(undefined);
    setToDate(undefined);
  };

  const hasActiveFilters = filter !== "ALL" || symbolFilter !== "ALL" || fromDate || toDate;

  // Group AI signals by batch (created_at within same minute)
  const latestBatchTime = aiSignals[0]?.created_at;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold">AI Signals</h1>
        <p className="text-sm text-muted-foreground">Gemini 2.5 Flash analysis — persisted across sessions</p>
      </div>

      {/* AI Analysis button */}
      <div className="flex items-center gap-3">
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {analyzing ? "Analyzing…" : "🤖 Run AI Analysis"}
        </button>
        {latestBatchTime && (
          <span className="text-xs text-muted-foreground">Last: {new Date(latestBatchTime).toLocaleTimeString()}</span>
        )}
        {aiSignals.length > 0 && (
          <span className="text-xs text-accent font-medium">{aiSignals.length} saved signals</span>
        )}
      </div>

      {/* AI Signals Section */}
      {filteredAiSignals.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-semibold text-accent">AI-Generated Signals (Persisted)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAiSignals.map((s) => (
              <AiSignalCard key={s.id} signal={s} />
            ))}
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="bg-card border border-border-subtle rounded-xl p-4 shadow-lg shadow-black/20 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Total:</span>
          <span className="font-mono text-sm font-semibold">{filteredSignals.length}</span>
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
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Symbol Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Simbol:</span>
            <Select value={symbolFilter} onValueChange={setSymbolFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Toate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toate</SelectItem>
                {uniqueSymbols.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">De la:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-32 justify-start text-left font-normal text-xs", !fromDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {fromDate ? format(fromDate, "dd/MM/yyyy") : "Selectează"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Până la:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-32 justify-start text-left font-normal text-xs", !toDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {toDate ? format(toDate, "dd/MM/yyyy") : "Selectează"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs gap-1"
            >
              <X className="h-3 w-3" />
              Șterge filtrele
            </Button>
          )}
        </div>

        {/* Action Filters */}
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
      </div>

      {filteredSignals.length === 0 ? (
        <div className="bg-card border border-border-subtle rounded-xl p-12 text-center">
          <p className="text-muted-foreground">Nu există semnale care să corespundă filtrelor</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSignals.map((s: any) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function AiSignalCard({ signal: s }: { signal: AiSignal }) {
  const [expanded, setExpanded] = useState(false);
  const confColor = s.confidence >= 80 ? "bg-accent" : s.confidence >= 65 ? "bg-warning" : "bg-danger";
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

  return (
    <div className="relative bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20 hover:bg-card-hover transition-colors duration-150">
      <div className="flex items-center justify-between mb-4">
        <span className="font-heading text-lg font-bold">{s.symbol}</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${actionStyles[s.action] ?? actionStyles.HOLD}`}>{s.action}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">AI Confidence</span>
          <span className="font-mono">{s.confidence}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${confColor}`} style={{ width: `${s.confidence}%` }} />
        </div>
      </div>

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

      <div className="flex items-center justify-between mb-2">
        {s.risk_level && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${riskColors[s.risk_level.toUpperCase()] ?? riskColors.MEDIUM}`}>
            {s.risk_level.toUpperCase()} RISK
          </span>
        )}
        <span className="text-xs text-muted-foreground">{timeAgo(s.created_at)}</span>
      </div>

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-heading text-lg font-bold">{s.symbol}</span>
          <span className="ml-2 font-mono text-sm text-muted-foreground">{formatCurrencyPlain(s.price)}</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${actionStyles[s.action] ?? actionStyles.HOLD}`}>{s.action}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">AI Confidence</span>
          <span className="font-mono">{s.confidence}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${confColor}`} style={{ width: `${s.confidence ?? 0}%` }} />
        </div>
      </div>

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

      {s.executed && (
        <div className="mt-3 bg-accent-dim text-accent text-xs rounded-lg px-3 py-2 font-medium">✓ Trade Executed</div>
      )}
      {s.block_reason && (
        <p className="mt-2 text-xs text-danger">⛔ {s.block_reason}</p>
      )}

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
