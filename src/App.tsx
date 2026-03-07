import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useSupabaseData from "@/hooks/useSupabaseData";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import PositionsPage from "@/pages/Positions";
import SignalsPage from "@/pages/Signals";
import TradesPage from "@/pages/Trades";
import SettingsPage from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const data = useSupabaseData();

  return (
    <Layout
      portfolio={data.portfolio}
      lastUpdate={data.lastUpdate}
      isSyncing={data.isSyncing}
      onRefresh={data.refresh}
    >
      <Routes>
        <Route path="/" element={
          <Dashboard
            portfolio={data.portfolio}
            positions={data.positions}
            signals={data.signals}
            trades={data.trades}
            equityHistory={data.equityHistory}
            loading={data.loading}
          />
        } />
        <Route path="/positions" element={<PositionsPage positions={data.positions} loading={data.loading} />} />
        <Route path="/signals" element={<SignalsPage signals={data.signals} loading={data.loading} />} />
        <Route path="/trades" element={<TradesPage trades={data.trades} loading={data.loading} />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
