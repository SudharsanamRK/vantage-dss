// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider }   from "./context/AuthContext";
import { PondProvider }   from "./context/PondContext";
import ProtectedRoute     from "./components/ProtectedRoute";
import Login              from "./pages/Login";
import Register           from "./pages/Register";
import PondSetupWizard    from "./pages/PondSetupWizard";

import Sidebar            from "./components/layout/Sidebar";
import Topbar             from "./components/layout/Topbar";

import Dashboard          from "./pages/Dashboard";
import FeedingAdvisor     from "./pages/FeedingAdvisor";
import StockPulse         from "./pages/StockPulse";
import Alerts             from "./pages/Alerts";
import Reports            from "./pages/Reports";
import HarvestSimulator   from "./pages/HarvestSimulator";
import PondMap            from "./pages/PondMap";
import Health             from "./pages/Health";
import Economics          from "./pages/Economics";
import Setup              from "./pages/Setup";

import { usePond }        from "./context/PondContext";

// ── Gate: wizard for new users, dashboard for existing ───────────────────────
function PondGate({ children }) {
  const { ponds, loading } = usePond();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Loading farm data…
          </p>
        </div>
      </div>
    );
  }

  // No ponds yet → show full setup wizard
  if (ponds.length === 0) return <PondSetupWizard />;

  return children;
}

// ── Authenticated app shell ───────────────────────────────────────────────────
function AppShell() {
  return (
    <PondProvider>
      <PondGate>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto custom-scrollbar">
              <Routes>
                <Route path="/"          element={<Dashboard />} />
                <Route path="/map"       element={<PondMap />} />
                <Route path="/feeding"   element={<FeedingAdvisor />} />
                <Route path="/stock"     element={<StockPulse />} />
                <Route path="/simulator" element={<HarvestSimulator />} />
                <Route path="/alerts"    element={<Alerts />} />
                <Route path="/reports"   element={<Reports />} />
                <Route path="/health"    element={<Health />} />
                <Route path="/economics" element={<Economics />} />
                <Route path="/setup"     element={<Setup />} />
                <Route path="*"          element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </PondGate>
    </PondProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}