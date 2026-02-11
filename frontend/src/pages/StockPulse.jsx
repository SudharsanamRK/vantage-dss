import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronUp, ChevronDown, History, Target, Plus, TrendingUp, 
  Fish, Download, Scale, Zap, LayoutGrid, ClipboardList, Info
} from "lucide-react";

export default function StockPulse() {
  const [activePond, setActivePond] = useState('Pond A3');
  const [showPondSelector, setShowPondSelector] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const ponds = [
    { id: 'A3', name: 'Pond A3', biomass: 4820, population: 11476, avgWeight: 420, progress: 84, color: 'bg-emerald-600' },
    { id: 'B1', name: 'Pond B1', biomass: 3920, population: 9840, avgWeight: 398, progress: 72, color: 'bg-blue-600' },
    { id: 'C2', name: 'Pond C2', biomass: 2850, population: 7125, avgWeight: 400, progress: 65, color: 'bg-orange-600' },
    { id: 'D4', name: 'Pond D4', biomass: 6730, population: 16825, avgWeight: 400, progress: 91, color: 'bg-purple-600' }
  ];

  const currentPond = ponds.find(p => p.id === activePond.replace('Pond ', '')) || ponds[0];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f6f9] text-[#2d3e50] font-sans p-6 selection:bg-[#168039] selection:text-white">
      
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER SECTION (FarmOS Navigation Style) */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              Assets / Livestock / Inventory
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-light">Stock: <span className="font-bold uppercase tracking-tight">PULSE_MONITOR</span></h1>
              <div className="px-2 py-0.5 bg-[#168039] text-white text-[10px] font-bold rounded-sm uppercase tracking-tighter">
                Live • {currentTime}
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
             <div className="relative min-w-[200px]">
                <button
                  onClick={() => setShowPondSelector(!showPondSelector)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-white border border-slate-300 rounded-sm shadow-sm hover:bg-slate-50 transition-all font-bold text-xs text-slate-700 uppercase"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid size={14} className="text-slate-400" />
                    {activePond}
                  </span>
                  <ChevronDown size={14} />
                </button>

                <AnimatePresence>
                  {showPondSelector && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full mt-1 w-full bg-white border border-slate-300 rounded-sm shadow-xl z-50 overflow-hidden"
                    >
                      {ponds.map((pond) => (
                        <button
                          key={pond.id}
                          onClick={() => { setActivePond(`Pond ${pond.id}`); setShowPondSelector(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-0"
                        >
                          <span className="text-xs font-bold text-slate-700 uppercase">{pond.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{pond.biomass} KG</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            <button className="bg-[#2d3e50] text-white px-4 py-2 rounded-sm text-xs font-bold uppercase shadow-sm flex items-center gap-2 hover:bg-[#1e2a36]">
              <Plus size={14} /> Log Sample
            </button>
          </div>
        </header>

        {/* MAIN METRICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PRIMARY DATA PANEL */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Scale size={14} className="text-slate-400" /> Biomass Analytics: {activePond}
              </h3>
              <Info size={14} className="text-slate-300 cursor-help" />
            </div>

            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimated Weight</p>
                <div className="flex items-baseline gap-2 text-[#2d3e50]">
                  <span className="text-8xl font-light tracking-tighter leading-none">
                    {currentPond.biomass.toLocaleString()}
                  </span>
                  <span className="text-2xl font-bold text-slate-300">KG</span>
                </div>
              </div>

              <div className="w-full md:w-64 space-y-4">
                <MetricDetail label="Avg Piece Weight" value={`${currentPond.avgWeight}g`} />
                <MetricDetail label="Head Count" value={currentPond.population.toLocaleString()} />
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-sm">
                  <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Growth Velocity</p>
                  <p className="text-xl font-bold text-[#168039] flex items-center gap-2">
                    <TrendingUp size={18} /> +4.2% <span className="text-xs font-medium text-emerald-600/60 uppercase">/ Week</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/30 flex gap-6">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-[#168039]" /> FCR: 1.22
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Survival: 94.8%
               </div>
            </div>
          </div>

          {/* HARVEST STATUS PANEL (Industrial Dark) */}
          <div className="lg:col-span-4 bg-[#2d3e50] text-white rounded-sm shadow-lg flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <Target size={16} className="text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-tight">Harvest Readiness</h3>
            </div>
            
            <div className="p-8 flex-1 flex flex-col justify-center items-center text-center">
              <div className="text-8xl font-light tracking-tighter text-emerald-400 mb-2">
                {currentPond.progress}<span className="text-2xl text-white/40">%</span>
              </div>
              <p className="text-xs uppercase font-bold tracking-[0.2em] text-slate-400">Current Progress to Target</p>
              
              <div className="w-full h-1.5 bg-white/10 mt-8 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${currentPond.progress}%` }}
                  className="h-full bg-[#168039]"
                />
              </div>
            </div>

            <div className="p-6 bg-black/20 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold tracking-tight">14</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Days Remaining</p>
              </div>
              <button className="bg-[#168039] text-white px-4 py-2 rounded-sm font-bold text-[10px] uppercase hover:bg-[#12662d] transition-colors shadow-lg">
                View Schedule
              </button>
            </div>
          </div>
        </div>

        {/* SECONDARY PANELS (Log & Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ACTIVITY LOG (Modular Table) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-500">
                <History size={14} /> Observations & Inventory Adjustments
              </h3>
              <Download size={14} className="text-slate-300 cursor-pointer hover:text-slate-600" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="p-4 border-b border-slate-100">Pond</th>
                    <th className="p-4 border-b border-slate-100">Observation Type</th>
                    <th className="p-4 border-b border-slate-100">Status</th>
                    <th className="p-4 border-b border-slate-100 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { type: "Mortality", qty: -47, reason: "Low DO stress", pond: "A3", color: "text-red-600" },
                    { type: "Sampling", qty: 30, reason: "Weight check", pond: "A3", color: "text-emerald-600" },
                    { type: "Stocking", qty: 2500, reason: "New PL10", pond: "D4", color: "text-blue-600" },
                    { type: "Transfer", qty: -100, reason: "Pond Reshuffle", pond: "B1", color: "text-slate-600" },
                  ].map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-[#2d3e50]">{item.pond}</td>
                      <td className="p-4">
                        <p className="font-bold">{item.type}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-medium">{item.reason}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-bold rounded-sm uppercase">Verified</span>
                      </td>
                      <td className={`p-4 text-right font-bold text-lg ${item.color}`}>
                        {item.qty > 0 ? `+${item.qty}` : item.qty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ASSET GRID */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {ponds.map((pond) => (
              <button 
                key={pond.id}
                onClick={() => setActivePond(`Pond ${pond.id}`)}
                className={`p-5 rounded-sm border transition-all text-left flex flex-col justify-between h-[160px] group shadow-sm ${
                  activePond === `Pond ${pond.id}` ? 'border-[#168039] bg-emerald-50/30 ring-1 ring-[#168039]' : 'border-slate-200 bg-white hover:border-slate-400'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                   <div className={`w-3 h-3 rounded-sm ${pond.color} shadow-sm`} />
                   <div className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-[#168039]">ID: {pond.id}</div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{pond.name}</p>
                  <p className="text-3xl font-light text-[#2d3e50] tracking-tighter">
                    {pond.biomass.toLocaleString()} <span className="text-xs font-bold text-slate-300">KG</span>
                  </p>
                  <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
                    <div className={`h-full ${pond.color}`} style={{ width: `${pond.progress}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ACTION FOOTER (Industrial Banner Style) */}
        <div className="bg-[#168039] text-white p-6 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border-b-4 border-[#12662d]">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-white/10 rounded-sm flex items-center justify-center">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">System Notice: Harvest Cycle</h2>
              <p className="text-xs text-emerald-100/80 font-medium">Optimal market conditions and biomass targets align for <span className="underline decoration-emerald-300 underline-offset-4">{activePond}</span> in 14 days.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-white text-[#168039] px-6 py-3 rounded-sm font-bold text-xs uppercase shadow-lg hover:bg-slate-50 transition-transform">
              Schedule Harvest
            </button>
            <button className="flex-1 md:flex-none bg-[#12662d] text-white px-6 py-3 rounded-sm font-bold text-xs border border-white/10 uppercase hover:bg-[#0e5024] transition-all">
              Team Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricDetail({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-lg font-bold text-[#2d3e50]">{value}</span>
    </div>
  );
}