import { supabase } from "@/lib/supabase";
import type { AnalyzeSignalsRequest, AnalyzeSignalsResponse, SignalError } from "@/lib/gemini-types";

/**
 * Calls the secure analyze-signals edge function.
 * API keys never leave the backend.
 */
export async function analyzeSignals(
  request: AnalyzeSignalsRequest
): Promise<AnalyzeSignalsResponse> {
  const { data, error } = await supabase.functions.invoke<AnalyzeSignalsResponse>(
    "analyze-signals",
    { body: request }
  );

  if (error) {
    throw new Error(error.message ?? "Failed to analyze signals");
  }

  if (!data) {
    throw new Error("No data returned from signal analysis");
  }

  return data;
}

/**
 * Analyze signals for the default watchlist symbols.
 */
export async function analyzeWatchlist(
  symbols: string[] = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AMD"],
  marketContext?: string
): Promise<AnalyzeSignalsResponse> {
  return analyzeSignals({ symbols, marketContext });
}
