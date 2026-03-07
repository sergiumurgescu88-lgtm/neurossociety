import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import useSupabaseData from "@/hooks/useSupabaseData";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import PositionsPage from "@/pages/Positions";
import SignalsPage from "@/pages/Signals";
import TradesPage from "@/pages/Trades";
import SettingsPage from "@/pages/Settings";
import NotFound from "./pages/NotFound";

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

function AppRoutes() {
  const data = useSupabaseData();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <Layout portfolio={data.portfolio} lastUpdate={data.lastUpdate} isSyncing={data.isSyncing} onRefresh={data.refresh} connectionError={data.connectionError}>
            <Dashboard
              portfolio={data.portfolio}
              positions={data.positions}
              signals={data.signals}
              trades={data.trades}
              equityHistory={data.equityHistory}
              loading={data.loading}
            />
          </Layout>
        }
      />
      <Route path="/positions" element={
        <Layout portfolio={data.portfolio} lastUpdate={data.lastUpdate} isSyncing={data.isSyncing} onRefresh={data.refresh} connectionError={data.connectionError}>
          <PositionsPage positions={data.positions} loading={data.loading} />
        </Layout>
      } />
      <Route path="/signals" element={
        <Layout portfolio={data.portfolio} lastUpdate={data.lastUpdate} isSyncing={data.isSyncing} onRefresh={data.refresh} connectionError={data.connectionError}>
          <SignalsPage signals={data.signals} loading={data.loading} />
        </Layout>
      } />
      <Route path="/trades" element={
        <Layout portfolio={data.portfolio} lastUpdate={data.lastUpdate} isSyncing={data.isSyncing} onRefresh={data.refresh} connectionError={data.connectionError}>
          <TradesPage trades={data.trades} loading={data.loading} />
        </Layout>
      } />
      <Route path="/settings" element={
        <Layout portfolio={data.portfolio} lastUpdate={data.lastUpdate} isSyncing={data.isSyncing} onRefresh={data.refresh} connectionError={data.connectionError}>
          <SettingsPage />
        </Layout>
      } />
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
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
