import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are an expert quantitative trading analyst. Given a list of stock symbols and optional market context, produce a JSON array of trading signals.

Each signal MUST follow this exact schema:
{
  "symbol": "<TICKER>",
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": <number 0-100>,
  "reasoning": "<1-3 sentence explanation>",
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "rsi": <number or null>,
  "macd": "bullish" | "bearish" | "neutral" | null,
  "ema_trend": "bullish" | "bearish" | "neutral" | null
}

Rules:
- Confidence must be between 0 and 100.
- Be conservative: only use BUY/SELL when confidence >= 65.
- Provide reasoning based on technical and fundamental factors.
- Return ONLY a valid JSON array. No markdown, no commentary.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { symbols, marketContext } = await req.json();

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: "symbols must be a non-empty array of ticker strings" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cap at 20 symbols per request
    const tickers = symbols.slice(0, 20).map((s: string) => s.toUpperCase());

    const userMessage = [
      `Analyze these symbols: ${tickers.join(", ")}`,
      marketContext ? `Market context: ${marketContext}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content ?? "[]";

    // Parse the JSON array from the AI response
    let signals: any[];
    try {
      // Strip potential markdown fences
      const cleaned = rawContent.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      signals = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: rawContent }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add timestamps and validate
    const now = Date.now();
    const validated = signals.map((s: any) => ({
      symbol: String(s.symbol ?? ""),
      action: ["BUY", "SELL", "HOLD"].includes(s.action) ? s.action : "HOLD",
      confidence: Math.max(0, Math.min(100, Number(s.confidence) || 50)),
      reasoning: String(s.reasoning ?? ""),
      risk_level: ["LOW", "MEDIUM", "HIGH"].includes(s.risk_level) ? s.risk_level : "MEDIUM",
      rsi: s.rsi != null ? Number(s.rsi) : null,
      macd: s.macd ?? null,
      ema_trend: s.ema_trend ?? null,
      timestamp: now,
    }));

    return new Response(
      JSON.stringify({
        signals: validated,
        model: MODEL,
        generatedAt: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-signals error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
