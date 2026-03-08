// ─── Gemini API Types ────────────────────────────────────────────
export interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
  }>;
}

// ─── Trading Signal Types ────────────────────────────────────────
export type SignalAction = "BUY" | "SELL" | "HOLD";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface TradingSignal {
  symbol: string;
  action: SignalAction;
  confidence: number;
  reasoning: string;
  timestamp: number;
  price?: number;
  rsi?: number;
  macd?: string;
  ema_trend?: string;
  risk_level?: RiskLevel;
}

// ─── Edge Function Request / Response ────────────────────────────
export interface AnalyzeSignalsRequest {
  symbols: string[];
  marketContext?: string;
}

export interface AnalyzeSignalsResponse {
  signals: TradingSignal[];
  model: string;
  generatedAt: string;
}

export interface SignalError {
  error: string;
  status?: number;
}
