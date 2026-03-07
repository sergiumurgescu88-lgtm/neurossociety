export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <Card title="Trading Parameters">
            <SettingsTable rows={[
              ["Cycle Interval", "15 minutes"],
              ["Symbols", "AAPL · MSFT · NVDA · TSLA · GOOGL · AMZN · META · AMD"],
              ["Min Confidence", "65%"],
              ["Max Positions", "6 simultaneous"],
              ["Max Position Size", "$7,000"],
            ]} />
          </Card>

          <Card title="Risk Management">
            <SettingsTable rows={[
              ["Stop Loss", "-5% from entry", "text-danger"],
              ["Take Profit", "+12% from entry", "text-accent"],
              ["Trailing Stop", "-4% from peak", "text-warning"],
              ["Safe Mode Trigger", "SPY drops >3% in 24h", "text-warning"],
            ]} />
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card title="Data Sources — News">
            <div className="flex flex-wrap gap-2">
              {["NewsAPI", "Yahoo Finance", "Seeking Alpha", "Finviz", "Benzinga", "MarketWatch", "Google News", "CNBC"].map(src => (
                <span key={src} className="inline-flex items-center gap-1.5 text-xs bg-secondary px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {src}
                </span>
              ))}
            </div>
          </Card>

          <Card title="Infrastructure">
            <SettingsTable rows={[
              ["Broker", "Alpaca Markets — Paper Trading"],
              ["AI Engine", "Google Gemini 2.0 Flash"],
              ["Database", "Supabase"],
              ["Strategy", "Momentum + Sentiment + Technical"],
            ]} />
          </Card>

          <Card title="Live Connection Status">
            <div className="space-y-3">
              {[
                ["Alpaca API", true],
                ["Gemini AI", true],
                ["Supabase", true],
                ["News Sources", true],
              ].map(([name, connected]) => (
                <div key={name as string} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{name as string}</span>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${connected ? "bg-accent" : "bg-danger"}`} />
                    <span className={`text-xs ${connected ? "text-accent" : "text-danger"}`}>
                      {connected ? "CONNECTED" : "DISCONNECTED"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Last checked: just now</span>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-card-hover transition-colors duration-150">
                Check Now
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* About section */}
      <Card title="About NeuroSSociety">
        <p className="text-sm text-muted-foreground mb-4">
          NeuroSSociety is an automated AI trading system that analyzes market data 24/7 and executes trades based on AI signals combined with technical analysis.
        </p>
        <SettingsTable rows={[
          ["Version", "2.0.0"],
          ["Built with", "Python 3.12 · Google Gemini 2.0 Flash · Alpaca Markets · Supabase"],
          ["News Sources", "8 active feeds"],
        ]} />
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
      <h3 className="font-heading text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SettingsTable({ rows }: { rows: (string | undefined)[][] }) {
  return (
    <div className="space-y-3">
      {rows.map(([label, value, color]) => (
        <div key={label} className="flex items-start justify-between gap-4 text-sm">
          <span className="text-muted-foreground shrink-0">{label}</span>
          <span className={`font-mono text-xs text-right ${color ?? ""}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}
