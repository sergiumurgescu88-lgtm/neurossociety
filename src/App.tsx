import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { SupabaseDataProvider, useSharedData } from "@/contexts/SupabaseDataContext";
import useAuth from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import PositionsPage from "@/pages/Positions";
import SignalsPage from "@/pages/Signals";
import TradesPage from "@/pages/Trades";
import LiveTrading from "@/pages/LiveTrading";
import SettingsPage from "@/pages/Settings";
import ReportsPage from "@/pages/Reports";
import NotFound from "./pages/NotFound";
import BotV1 from "@/pages/BotV1";
import BotV2 from "@/pages/BotV2";
import BotV3 from "@/pages/BotV3";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      setVisible(false);
      const t = setTimeout(() => {
        setVisible(true);
        prevPath.current = location.pathname;
      }, 150);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  return (
    <div className="transition-opacity duration-150" style={{ opacity: visible ? 1 : 0 }}>
      <AppRoutes />
    </div>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const data = useSharedData();
  const { user, signOut } = useAuth();

  return (
    <Layout
      portfolio={data.portfolio}
      lastUpdate={data.lastUpdate}
      isSyncing={data.isSyncing}
      onRefresh={data.refresh}
      connectionError={data.connectionError}
      userEmail={user?.email}
      onSignOut={signOut}
    >
      {children}
    </Layout>
  );
}

function DashboardContent() {
  const data = useSharedData();
  return (
    <Dashboard
      portfolio={data.portfolio}
      positions={data.positions}
      signals={data.signals}
      trades={data.trades}
      logs={data.logs}
      equityHistory={data.equityHistory}
      loading={data.loading}
    />
  );
}

function PositionsContent() {
  const data = useSharedData();
  return <PositionsPage positions={data.positions} loading={data.loading} />;
}

function SignalsContent() {
  const data = useSharedData();
  return <SignalsPage signals={data.signals} loading={data.loading} />;
}

function TradesContent() {
  const data = useSharedData();
  return <TradesPage trades={data.trades} loading={data.loading} />;
}

function LiveTradingContent() {
  const data = useSharedData();
  return <LiveTrading />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  const protect = (children: React.ReactNode) => (
    <ProtectedRoute user={user} loading={loading}>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardShell><DashboardContent /></DashboardShell>} />
      <Route path="/positions" element={<DashboardShell><PositionsContent /></DashboardShell>} />
      <Route path="/signals" element={<DashboardShell><SignalsContent /></DashboardShell>} />
      <Route path="/trades" element={<DashboardShell><TradesContent /></DashboardShell>} />
      <Route path="/live-trading" element={<DashboardShell><LiveTradingContent /></DashboardShell>} />
      <Route path="/settings" element={protect(<SettingsPage />)} />
      <Route path="/reports" element={<DashboardShell><ReportsPage /></DashboardShell>} />
      <Route path="/bot-v1" element={<DashboardShell><BotV1 /></DashboardShell>} />
      <Route path="/bot-v2" element={<DashboardShell><BotV2 /></DashboardShell>} />
      <Route path="/bot-v3" element={<DashboardShell><BotV3 /></DashboardShell>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SupabaseDataProvider>
          <AnimatedRoutes />
        </SupabaseDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
