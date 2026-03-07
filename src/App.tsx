import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [opacity, setOpacity] = useState(1);
  const prevKey = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevKey.current) {
      setOpacity(0);
      const t = setTimeout(() => {
        setDisplayChildren(children);
        setOpacity(1);
        prevKey.current = location.pathname;
      }, 150);
      return () => clearTimeout(t);
    } else {
      setDisplayChildren(children);
    }
  }, [location.pathname, children]);

  return (
    <div className="transition-opacity duration-150" style={{ opacity }}>
      {displayChildren}
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
        <PageTransition>
          <AppRoutes />
        </PageTransition>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
