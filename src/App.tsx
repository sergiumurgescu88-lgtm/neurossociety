import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import FleetOverview from "@/pages/FleetOverview";
import BotOmega  from "@/pages/BotOmega";
import BotZeus   from "@/pages/BotZeus";
import BotApollo from "@/pages/BotApollo";
import BotHermes from "@/pages/BotHermes";
import BotZ1     from "@/pages/BotZ1";
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background text-foreground">
        <AppSidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/"           element={<FleetOverview />} />
            <Route path="/bot-omega"  element={<BotOmega />}  />
            <Route path="/bot-zeus"   element={<BotZeus />}   />
            <Route path="/bot-apollo" element={<BotApollo />} />
            <Route path="/bot-hermes" element={<BotHermes />} />
            <Route path="/bot-z1"     element={<BotZ1 />}    />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
