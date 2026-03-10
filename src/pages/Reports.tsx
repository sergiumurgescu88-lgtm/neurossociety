import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { formatCurrency } from "@/lib/format";

// ─── DATE ISTORICE SALVATE — Martie 2026 (contul $100k) ───────────────────
const REPORT_MARCH_2026 = {
  period: "01 Mar 2026 — 10 Mar 2026",
  account: "Paper Trading $100,000",
  totalTrades: 282,
  buyOrders: 255,
  sellOrders: 27,
  wins: 25,
  losses: 2,
  winRate: 92.6,
  totalPl: 311.34,
  bestTrade: { symbol: "SOXX", pl: 87.12 },
  worstTrade: { symbol: "SOXX", pl: -13.47 },
  startingCapital: 100000,
  finalEquity: 100311.34,
  roi: 0.31,
  cycles: 151,
};

const PIE_COLORS = ["hsl(160,84%,39%)", "hsl(0,84%,60%)"];

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-mono font-semibold ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const r = REPORT_MARCH_2026;
  const winRateSegments = 10;
  const filledSegments = Math.round((r.winRate / 100) * winRateSegments);

  const pieData = [
    { name: "Wins", value: r.wins },
    { name: "Losses", value: r.losses },
  ];

  const plBarData = [
    { name: "SOXX #1", pl: 87.12 },
    { name: "SMH", pl: 51.20 },
    { name: "SOXL", pl: 39.44 },
    { name: "AMD", pl: 10.66 },
    { name: "SOFI", pl: 12.06 },
    { name: "HOOD", pl: 9.80 },
    { name: "RBLX", pl: 1.76 },
    { name: "XLK", pl: 1.56 },
    { name: "SOXL #2", pl: 23.00 },
    { name: "SOXX #2", pl: -13.47 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-xl font-bold">📊 Rapoarte Istorice</h1>
        <p className="text-sm text-muted-foreground">Rezultate salvate din sesiunile anterioare de trading</p>
      </div>

      {/* Report Card Header */}
      <div className="bg-card border border-accent/20 rounded-xl p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <div>
            <h2 className="font-heading text-base font-bold flex items-center gap-2">
              🗂 Sesiunea 1 — Paper Trading $100K
            </h2>
            <p className="text-xs text-muted-foreground mt-1">📅 {r.period}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-secondary px-3 py-1.5 rounded-full font-mono">{r.account}</span>
            <span className="text-xs bg-accent-dim text-accent px-3 py-1.5 rounded-full font-mono">ARHIVAT</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Capital Inițial" value="$100,000" sub="Paper Trading" />
        <StatCard label="Equity Final" value="$100,311.34" sub="+$311.34" color="text-accent" />
        <StatCard label="ROI" value="+0.31%" color="text-accent" sub="în 9 zile" />
        <StatCard label="Total Trades" value={r.totalTrades.toString()} sub={`${r.buyOrders} BUY · ${r.sellOrders} SELL`} />
        <StatCard label="Cicluri Rulate" value={r.cycles.toString()} sub="~5 min/ciclu" />
        <StatCard label="Win Rate" value={`${r.winRate}%`} sub={`${r.wins}W / ${r.losses}L`} color="text-accent" />
      </div>

      {/* Win Rate + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Win Rate Visual */}
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <h3 className="font-heading text-sm font-semibold mb-4">🎯 Win Rate</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Rată de succes</span>
            <span className="font-mono text-lg font-semibold text-accent">{r.winRate}%</span>
          </div>
          <div className="flex gap-1 mb-1">
            {Array.from({ length: winRateSegments }).map((_, i) => (
              <div key={i} className={`h-4 flex-1 rounded-sm ${i < filledSegments ? "bg-accent" : "bg-secondary"}`} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
          <div className="border-t border-border-subtle mt-4 pt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">✅ Wins</p>
              <p className="font-mono text-xl font-bold text-accent">{r.wins}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">❌ Losses</p>
              <p className="font-mono text-xl font-bold text-danger">{r.losses}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">📊 Total</p>
              <p className="font-mono text-xl font-bold">{r.sellOrders}</p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
          <h3 className="font-heading text-sm font-semibold mb-4">📈 Distribuție Rezultate</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="100%" height={180} className="max-w-[180px]">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                  {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(217,33%,11%)", border: "1px solid hsl(215,19%,17%)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-accent" />
                <span className="text-sm">Wins: <span className="font-mono font-semibold text-accent">{r.wins}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-danger" />
                <span className="text-sm">Losses: <span className="font-mono font-semibold text-danger">{r.losses}</span></span>
              </div>
              <div className="border-t border-border-subtle pt-3">
                <p className="text-xs text-muted-foreground">P&L Total Realizat</p>
                <p className="font-mono text-lg font-bold text-accent">{formatCurrency(r.totalPl)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* P&L per Trade Chart */}
      <div className="bg-card border border-border-subtle rounded-xl p-5 shadow-lg shadow-black/20">
        <h3 className="font-heading text-sm font-semibold mb-4">💰 P&L per Trade (SELL-uri închise)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={plBarData}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(218,11%,65%)" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "hsl(217,33%,11%)", border: "1px solid hsl(215,19%,17%)", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [formatCurrency(v), "P&L"]}
            />
            <Bar dataKey="pl" radius={[4, 4, 0, 0]}>
              {plBarData.map((entry, idx) => (
                <Cell key={idx} fill={entry.pl >= 0 ? "hsl(160,84%,39%)" : "hsl(0,84%,60%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best / Worst + Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-accent/20 rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground mb-1">🏆 Best Trade</p>
          <p className="font-heading text-xl font-bold">{r.bestTrade.symbol}</p>
          <p className="font-mono text-2xl font-bold text-accent">{formatCurrency(r.bestTrade.pl)}</p>
        </div>
        <div className="bg-card border border-danger/20 rounded-xl p-5 shadow-lg shadow-black/20">
          <p className="text-xs text-muted-foreground mb-1">💀 Worst Trade</p>
          <p className="font-heading text-xl font-bold">{r.worstTrade.symbol}</p>
          <p className="font-mono text-2xl font-bold text-danger">{formatCurrency(r.worstTrade.pl)}</p>
        </div>
      </div>

      {/* Note */}
      <div className="bg-secondary/50 border border-border-subtle rounded-xl p-4">
        <p className="text-xs text-muted-foreground">
          ℹ️ Aceste date reprezintă rezultatele sesiunii anterioare de paper trading pe contul cu capital $100,000, 
          arhivate pe <strong>10 Martie 2026</strong> la resetarea către noul cont de $10,000. 
          Toate tranzacțiile sunt simulate (paper trading) — fără bani reali implicați.
        </p>
      </div>
    </div>
  );
}
