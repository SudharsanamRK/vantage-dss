import React from "react";
import { usePond } from "../context/PondContext";
import { analyzePond } from "../engine/farmBrain";
import { 
  ClipboardList, Droplets, Map as MapIcon, 
  ChevronRight, Settings, History, Plus, Zap
} from "lucide-react";

export default function FarmOSDashboard() {
  const { sensorData, logs, addLog } = usePond();
  const brain = analyzePond(sensorData);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#212529] font-sans">
      <div className="flex-1 p-6 lg:p-10 space-y-6">
        
        {/* TOP UTILITY BAR */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-6">
          <div>
            <nav className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">
              Assets / Ponds / {sensorData.label}
            </nav>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Dashboard: <span className="font-semibold text-slate-900">{sensorData.label}</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => addLog("Manual Inspection")}
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded text-sm font-bold hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Plus size={16} /> Add Log
            </button>
            <button 
              onClick={() => addLog("Quick Treatment Applied")}
              className="flex items-center gap-2 bg-[#2e7d32] text-white px-4 py-2 rounded text-sm font-bold hover:bg-[#1b5e20] active:scale-95 shadow-sm transition-all"
            >
              <Zap size={16} /> Quick Action
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: SENSORS & AI ANALYSIS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* LIVE SENSORS */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-700 flex items-center gap-2 uppercase tracking-widest">
                  <Droplets size={16} className="text-blue-500" /> Live Sensor Observations
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-mono italic">Last updated: {sensorData.lastSynced}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase animate-pulse">Synced</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                <SensorCard label="Dissolved Oxygen" value={sensorData.do} unit="mg/L" color={sensorData.do < 4 ? "text-red-600" : "text-slate-900"} />
                <SensorCard label="Ammonia" value={sensorData.ammonia} unit="ppm" color={sensorData.ammonia > 0.1 ? "text-orange-600" : "text-slate-900"} />
                <SensorCard label="Temperature" value={sensorData.temp} unit="°C" color="text-slate-900" />
              </div>
            </div>

            {/* AI DECISION SUPPORT TABLE */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList size={16} className="text-indigo-500" /> Biological Observations & Maintenance
                </h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-black border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="px-6 py-3">Task / Analysis</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">Water Quality Health</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={brain.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 italic font-medium">{brain.alerts[0]}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">Adaptive Feeding Log</td>
                    <td className="px-6 py-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Planned</span></td>
                    <td className="px-6 py-4 text-slate-600 font-bold">{brain.feedingAdvice}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: INFRASTRUCTURE & LOGS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1e293b] text-white p-6 rounded-sm shadow-lg border-l-4 border-emerald-500">
              <div className="flex items-center gap-3 mb-6">
                <MapIcon className="text-emerald-400" size={20} />
                <h3 className="font-black text-sm uppercase tracking-widest">Pond Infrastructure</h3>
              </div>
              <div className="space-y-4 text-xs font-medium">
                <InfoRow label="Species" value="Vannamei Shrimp" />
                <InfoRow label="Stock Density" value="60 / m²" />
                <InfoRow label="Age of Crop" value="42 Days" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-slate-400" /> Activity Log
                </h3>
                <Settings size={14} className="text-slate-300 hover:rotate-90 transition-transform cursor-pointer" />
              </div>
              <div className="space-y-5">
                {logs.map((log) => (
                  <div key={log.id} className="group cursor-pointer border-l-2 border-transparent hover:border-blue-500 pl-3 transition-all">
                    <p className="text-[11px] font-black text-slate-800 flex items-center justify-between group-hover:text-blue-600">
                      {log.type} <ChevronRight size={12} />
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">By {log.user} • {log.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function SensorCard({ label, value, unit, color }) {
  return (
    <div className="p-6">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-light tracking-tighter ${color}`}>
        {value} <span className="text-xs text-slate-300 font-bold uppercase">{unit}</span>
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Optimal: "bg-emerald-100 text-emerald-700",
    Warning: "bg-orange-100 text-orange-700",
    Critical: "bg-red-100 text-red-700"
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-2">
      <span className="text-slate-400 uppercase tracking-tighter">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}