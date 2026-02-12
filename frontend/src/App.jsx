import { BrowserRouter, Routes, Route } from "react-router-dom";

// CRITICAL FIX: Added missing import for PondProvider
import { PondProvider } from "./context/pondcontext"; 

// Layout Components
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

// Pages
import Dashboard from "./pages/Dashboard";
import FeedingAdvisor from "./pages/FeedingAdvisor";
import StockPulse from "./pages/StockPulse";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import HarvestSimulator from "./pages/HarvestSimulator";
import PondMap from "./pages/PondMap";

// Operational Pages
import Health from "./pages/Health";
import Economics from "./pages/Economics";
import Setup from "./pages/Setup";

/**
 * VANTAGE FRONTEND ARCHITECTURE
 * Layout: Flex container with Sticky Sidebar and Scrollable Content
 * State: PondProvider wraps the entire app for real-time telemetry access
 */
export default function App() {
  return (
    <PondProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-slate-50">
          
          {/* NAVIGATION: Left-anchored sidebar */}
          <Sidebar />

          {/* MAIN VIEWPORT: Occupies remaining width, manages inner scrolling */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            
            {/* TOPBAR: Global status and profile */}
            <Topbar />

            {/* CONTENT AREA: This is where pages render */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              <Routes>
                {/* Tactical Modules */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<PondMap />} />
                <Route path="/feeding" element={<FeedingAdvisor />} />
                <Route path="/stock" element={<StockPulse />} />
                <Route path="/simulator" element={<HarvestSimulator />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/reports" element={<Reports />} />

                {/* Operational Modules (Requires full Brain context) */}
                <Route path="/health" element={<Health />} />
                <Route path="/economics" element={<Economics />} />
                <Route path="/setup" element={<Setup />} />
              </Routes>
            </main>

          </div>
        </div>
      </BrowserRouter>
    </PondProvider>
  );
}