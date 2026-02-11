import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StateProvider } from "./components/data/mockData";

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

export default function App() {
  return (
    <StateProvider>
      <BrowserRouter>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                {/* Tactical */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<PondMap />} />
                <Route path="/feeding" element={<FeedingAdvisor />} />
                <Route path="/stock" element={<StockPulse />} />
                <Route path="/simulator" element={<HarvestSimulator />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/reports" element={<Reports />} />

                {/* Operational */}
                <Route path="/health" element={<Health />} />
                <Route path="/economics" element={<Economics />} />
                <Route path="/setup" element={<Setup />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </StateProvider>
  );
}
