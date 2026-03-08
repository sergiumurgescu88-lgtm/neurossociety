import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeWatchlist } from "@/lib/gemini-service";
import { toast } from "sonner";

export interface AiSignal {
  id: string;
  symbol: string;
  action: string;
  confidence: number;
  reasoning: string | null;
  risk_level: string | null;
  rsi: number | null;
  macd: string | null;
  ema_trend: string | null;
  model: string | null;
  created_at: string;
}

export default function useAiSignals() {
  const [aiSignals, setAiSignals] = useState<AiSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchSignals = useCallback(async () => {
    const { data, error } = await supabase
      .from("ai_signals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setAiSignals(data as unknown as AiSignal[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeWatchlist();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save AI signals");
        // Still show results even without saving
        const tempSignals: AiSignal[] = result.signals.map((s, i) => ({
          id: `temp-${i}`,
          symbol: s.symbol,
          action: s.action,
          confidence: s.confidence,
          reasoning: s.reasoning,
          risk_level: s.risk_level ?? null,
          rsi: s.rsi ?? null,
          macd: s.macd ?? null,
          ema_trend: s.ema_trend ?? null,
          model: result.model,
          created_at: result.generatedAt,
        }));
        setAiSignals(tempSignals);
        setAnalyzing(false);
        return;
      }

      // Persist to database
      const rows = result.signals.map((s) => ({
        user_id: user.id,
        symbol: s.symbol,
        action: s.action,
        confidence: s.confidence,
        reasoning: s.reasoning,
        risk_level: s.risk_level ?? null,
        rsi: s.rsi ?? null,
        macd: s.macd ?? null,
        ema_trend: s.ema_trend ?? null,
        model: result.model,
      }));

      const { error } = await supabase.from("ai_signals").insert(rows as any);
      if (error) {
        console.error("Failed to save signals:", error);
        toast.error("Signals generated but failed to save");
      } else {
        toast.success(`Saved ${rows.length} AI signals`);
      }

      await fetchSignals();
    } catch (err: any) {
      toast.error(err.message || "AI analysis failed");
      console.error("AI analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  }, [fetchSignals]);

  return { aiSignals, loading, analyzing, runAnalysis, refresh: fetchSignals };
}
