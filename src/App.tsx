import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import useSupabaseData from "@/hooks/useSupabaseData";
import useAuth from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
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

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const data = useSupabaseData();
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
  const data = useSupabaseData();
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
  const data = useSupabaseData();
  return <PositionsPage positions={data.positions} loading={data.loading} />;
}

function SignalsContent() {
  const data = useSupabaseData();
  return <SignalsPage signals={data.signals} loading={data.loading} />;
}

function TradesContent() {
  const data = useSupabaseData();
  return <TradesPage trades={data.trades} loading={data.loading} />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  const protect = (children: React.ReactNode) => (
    <ProtectedRoute user={user} loading={loading}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardLayout><DashboardContent /></DashboardLayout>} />
      <Route path="/positions" element={<DashboardLayout><PositionsContent /></DashboardLayout>} />
      <Route path="/signals" element={<DashboardLayout><SignalsContent /></DashboardLayout>} />
      <Route path="/trades" element={<DashboardLayout><TradesContent /></DashboardLayout>} />
      <Route path="/settings" element={protect(<SettingsPage />)} />
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
