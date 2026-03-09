import { useState, useEffect } from "react";
import { useSharedData } from "@/contexts/SupabaseDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatPercent } from "@/lib/format";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, RefreshCw } from "lucide-react";

interface LiveTradingProps {
  loading?: boolean;
}

// Mock real-time data for demo purposes
const generateMockPrice = (base: number) => {
  const volatility = 0.02;
  const change = (Math.random() - 0.5) * volatility;
  return Math.max(base + (base * change), 0.01);
};

const symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN", "META", "AMD"];

export default function LiveTrading({ loading = false }: LiveTradingProps) {
  const data = useSharedData();
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [isLive, setIsLive] = useState(true);
  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: any[]; asks: any[] }>({ bids: [], asks: [] });

  // Initialize market data
  useEffect(() => {
    const initialData: Record<string, any> = {};
    symbols.forEach(symbol => {
      const basePrice = Math.random() * 200 + 50;
      initialData[symbol] = {
        symbol,
        price: basePrice,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        bid: basePrice - 0.01,
        ask: basePrice + 0.01,
        high: basePrice * 1.05,
        low: basePrice * 0.95,
        open: basePrice * 1.02,
      };
    });
    setMarketData(initialData);

    // Initialize chart data
    const initialChart = Array.from({ length: 50 }, (_, i) => ({
      time: new Date(Date.now() - (50 - i) * 60000).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      price: initialData[selectedSymbol]?.price || 100,
      volume: Math.floor(Math.random() * 10000) + 1000,
    }));
    setChartData(initialChart);

    // Initialize order book
    const currentPrice = initialData[selectedSymbol]?.price || 100;
    setOrderBook({
      bids: Array.from({ length: 10 }, (_, i) => ({
        price: currentPrice - (i + 1) * 0.01,
        size: Math.floor(Math.random() * 1000) + 100,
      })),
      asks: Array.from({ length: 10 }, (_, i) => ({
        price: currentPrice + (i + 1) * 0.01,
        size: Math.floor(Math.random() * 1000) + 100,
      })),
    });
  }, [selectedSymbol]);

  // Live data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setMarketData(prev => {
        const updated = { ...prev };
        symbols.forEach(symbol => {
          if (updated[symbol]) {
            const newPrice = generateMockPrice(updated[symbol].price);
            const change = newPrice - updated[symbol].open;
            updated[symbol] = {
              ...updated[symbol],
              price: newPrice,
              change,
              changePercent: (change / updated[symbol].open) * 100,
              bid: newPrice - 0.01,
              ask: newPrice + 0.01,
            };
          }
        });
        return updated;
      });

      // Update chart data
      setChartData(prev => {
        const newDataPoint = {
          time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
          price: marketData[selectedSymbol]?.price || 100,
          volume: Math.floor(Math.random() * 10000) + 1000,
        };
        return [...prev.slice(-49), newDataPoint];
      });

      // Update order book
      const currentPrice = marketData[selectedSymbol]?.price || 100;
      setOrderBook({
        bids: Array.from({ length: 10 }, (_, i) => ({
          price: currentPrice - (i + 1) * 0.01,
          size: Math.floor(Math.random() * 1000) + 100,
        })),
        asks: Array.from({ length: 10 }, (_, i) => ({
          price: currentPrice + (i + 1) * 0.01,
          size: Math.floor(Math.random() * 1000) + 100,
        })),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, selectedSymbol, marketData]);

  const currentData = marketData[selectedSymbol] || {};
  const isPositive = (currentData.change || 0) >= 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-6 bg-muted rounded mb-1" />
                <div className="h-3 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-pulse">
            <CardContent className="p-6">
              <div className="h-80 bg-muted rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-80 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {symbols.map(symbol => (
                <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-sm font-medium">
              {isLive ? 'LIVE' : 'PAUZAT'}
            </span>
          </div>
        </div>

        <Button
          variant={isLive ? "destructive" : "default"}
          onClick={() => setIsLive(!isLive)}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLive ? 'animate-spin' : ''}`} />
          {isLive ? 'Oprește Live' : 'Pornește Live'}
        </Button>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preț Curent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(currentData.price || 0)}
            </div>
            <div className={`text-xs flex items-center ${isPositive ? 'text-accent' : 'text-danger'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {formatCurrency(Math.abs(currentData.change || 0))} ({formatPercent(Math.abs(currentData.changePercent || 0) / 100)})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volum</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {(currentData.volume || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Acțiuni tranzacționate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bid/Ask</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm font-mono">
                <span className="text-danger">Bid: {formatCurrency(currentData.bid || 0)}</span>
              </div>
              <div className="text-sm font-mono">
                <span className="text-accent">Ask: {formatCurrency(currentData.ask || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spread</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(Math.abs((currentData.ask || 0) - (currentData.bid || 0)))}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(Math.abs((currentData.ask || 0) - (currentData.bid || 0)) / (currentData.price || 1) * 100)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Grafic Preț - {selectedSymbol}</span>
              <Badge variant={isPositive ? "default" : "destructive"}>
                {isPositive ? "↗" : "↘"} {formatPercent(Math.abs(currentData.changePercent || 0) / 100)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "hsl(var(--accent))" : "hsl(var(--destructive))"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isPositive ? "hsl(var(--accent))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Timp</span>
                              <span className="font-bold">{label}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Preț</span>
                              <span className="font-bold text-accent">
                                {formatCurrency(payload[0].value as number)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
                <ReferenceLine y={currentData.open} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Book */}
        <Card>
          <CardHeader>
            <CardTitle>Order Book - {selectedSymbol}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Asks */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Ask (Vânzare)</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {orderBook.asks.slice(0, 5).reverse().map((ask, i) => (
                    <div key={i} className="flex justify-between text-sm font-mono">
                      <span className="text-danger">{formatCurrency(ask.price)}</span>
                      <span className="text-muted-foreground">{ask.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Price */}
              <div className="border-y py-2">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Preț curent</div>
                  <div className={`font-bold font-mono ${isPositive ? 'text-accent' : 'text-danger'}`}>
                    {formatCurrency(currentData.price || 0)}
                  </div>
                </div>
              </div>

              {/* Bids */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Bid (Cumpărare)</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {orderBook.bids.slice(0, 5).map((bid, i) => (
                    <div key={i} className="flex justify-between text-sm font-mono">
                      <span className="text-accent">{formatCurrency(bid.price)}</span>
                      <span className="text-muted-foreground">{bid.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Prezentare generală piața</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {symbols.map(symbol => {
              const symbolData = marketData[symbol] || {};
              const symbolIsPositive = (symbolData.change || 0) >= 0;
              return (
                <div 
                  key={symbol}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/10 ${
                    selectedSymbol === symbol ? 'border-accent bg-accent/5' : 'border-border'
                  }`}
                  onClick={() => setSelectedSymbol(symbol)}
                >
                  <div className="text-sm font-medium">{symbol}</div>
                  <div className="font-mono text-sm">{formatCurrency(symbolData.price || 0)}</div>
                  <div className={`text-xs flex items-center ${symbolIsPositive ? 'text-accent' : 'text-danger'}`}>
                    {symbolIsPositive ? '↗' : '↘'} {formatPercent(Math.abs(symbolData.changePercent || 0) / 100)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Volum - {selectedSymbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Timp</span>
                            <span className="font-bold">{label}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Volum</span>
                            <span className="font-bold text-accent">
                              {(payload[0].value as number).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="volume" fill="hsl(var(--accent))" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}