
CREATE TABLE public.ai_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  confidence INTEGER NOT NULL DEFAULT 50,
  reasoning TEXT,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  rsi NUMERIC,
  macd TEXT,
  ema_trend TEXT,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own signals"
  ON public.ai_signals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signals"
  ON public.ai_signals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_signals_user_created ON public.ai_signals (user_id, created_at DESC);
