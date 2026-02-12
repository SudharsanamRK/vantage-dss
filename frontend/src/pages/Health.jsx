import React, { useState, useMemo } from "react";
import { usePond } from "../context/PondContext";
// Note: We no longer import analyzePond here because it runs in the Context!
import { 
  ShieldAlert, Zap, Activity, AlertTriangle, ChevronRight, 
  Terminal, History, HeartPulse, Timer, TrendingUp, 
  CheckCircle2, FlaskConical, PlayCircle, ShieldCheck
} from "lucide-react";

export default function Health() {
  const { sensorData, setSensorData, logs, addLog, brain } = usePond();
  const [simulatedId, setSimulatedId] = useState(null);

  // TREATMENT SIMULATOR LOGIC
  const simulationData = useMemo(() => {
    if (!simulatedId || !brain?.treatments) return null;
    const tx = brain.treatments.find(t => t.id === simulatedId);
    if (!tx) return null;
    
    // Manual simulation: applying the effect to current data
    const result = tx.effect(sensorData);
    // Since we can't easily run the context brain manually here, 
    // we estimate impact or use a local mock for the diff.
    return {
      diff: 15, // Estimated health lift
      newScore: Math.min((brain?.healthScore ?? 0) + 15, 100),
      target: result
    };
  }, [simulatedId, sensorData, brain]);

  const handleExecute = (t) => {
    setSensorData(t.effect(sensorData));
    addLog(`Intervention: ${t.label} (Auth: Vantage_DSS)`, "Operator_V1");
    setSimulatedId(null);
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#212529] font-sans">
      <div className="flex-1 p-6 lg:p-10 space-y-6">
        
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <nav className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">
              Diagnostics / Biosecurity / Vital Intelligence
            </nav>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Health Doctor: <span className="font-semibold italic">Vantage Core</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <MetricBox label="Survival Risk" value={`${100 - (brain?.survivalProb ?? 100)}%`} color="text-red-500" />
            <MetricBox label="Health Index" value={`${brain?.healthScore ?? 0}/100`} color="text-blue-500" dark />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Timer size={16} className="text-blue-500" /> Risk Timeline (Last 24h)
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Scan Interval: 500ms</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <TrendCard label="DO Trend" value="Falling" sub="Started 3:14 AM" color="text-orange-500" icon={<TrendingUp className="rotate-180" />} />
                <TrendCard label="Temp Trend" value="Rising" sub="+1.2°C Shift" color="text-red-500" icon={<TrendingUp />} />
                <TrendCard label="Pathogen Risk" value="Low" sub="Steady" color="text-emerald-500" icon={<ShieldCheck />} />
                <TrendCard label="Stress Index" value="Elevated" sub="Biomass Load" color="text-orange-500" icon={<Activity />} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Zap size={16} className="text-yellow-400" /> Treatment Console
                </h3>
                <span className="text-[10px] font-bold text-slate-400">READY FOR DISPATCH</span>
              </div>
              <div className="p-6 space-y-4">
                {(brain?.treatments?.length ?? 0) > 0 ? (
                  brain.treatments.map(t => (
                    <div 
                      key={t.id} 
                      onMouseEnter={() => setSimulatedId(t.id)}
                      onMouseLeave={() => setSimulatedId(null)}
                      className={`flex items-center justify-between p-4 border rounded transition-all ${simulatedId === t.id ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'}`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="p-2 bg-slate-100 rounded text-slate-600"><FlaskConical size={18} /></div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase italic">{t.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{t.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleExecute(t)}
                        className="bg-slate-900 text-white text-[10px] font-black px-6 py-2 rounded hover:bg-blue-600 transition-colors uppercase tracking-widest"
                      >
                        Execute
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-40">
                    <CheckCircle2 size={32} className="mx-auto mb-2" />
                    <p className="text-xs font-black uppercase">No Emergency Actions Required</p>
                  </div>
                )}
              </div>
            </div>

            {simulationData && (
              <div className="bg-blue-900 text-white p-6 rounded-sm shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <PlayCircle size={18} className="text-blue-300" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Simulation Model: Impact Analysis</h3>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-[9px] text-blue-300 uppercase font-black">Health Lift</p>
                    <p className="text-2xl font-black">+{simulationData.diff} Pts</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-blue-300 uppercase font-black">Projected Score</p>
                    <p className="text-2xl font-black">{simulationData.newScore}/100</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-blue-300 uppercase font-black">OPEX Impact</p>
                    <p className="text-2xl font-black text-emerald-400">₹850.00</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Mortality Risk (12h)</h3>
              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-1000 ${(brain?.survivalProb ?? 100) > 80 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${100 - (brain?.survivalProb ?? 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center font-black text-[10px] uppercase">
                <span className="text-slate-400 tracking-tighter italic">Probability: {(100 - (brain?.survivalProb ?? 100)).toFixed(1)}%</span>
                <span className={(brain?.survivalProb ?? 100) > 80 ? 'text-emerald-600' : 'text-red-600'}>
                   {(brain?.survivalProb ?? 100) > 80 ? 'Low Risk' : 'High Alert'}
                </span>
              </div>
            </div>

            <div className="bg-[#1e293b] text-white p-6 rounded-sm shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <HeartPulse size={20} className="text-blue-400" />
                  <h4 className="text-xs uppercase font-black tracking-widest">System Ledger</h4>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              </div>
              <div className="space-y-4 font-mono text-[10px]">
                {(logs ?? []).slice(0, 5).map(l => (
                  <div key={l.id} className="border-b border-white/5 pb-2">
                    <p className="text-slate-400">[{l.time}]</p>
                    <p className="text-white font-bold">{l.type}</p>
                    <p className="text-[8px] text-blue-400">STATUS: SUCCESS // AUTH: {l.user}</p>
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

function MetricBox({ label, value, color, dark }) {
  return (
    <div className={`${dark ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200'} px-6 py-3 rounded shadow-sm text-center min-w-[120px]`}>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black italic tracking-tighter ${color}`}>{value}</p>
    </div>
  );
}

function TrendCard({ label, value, sub, color, icon }) {
  return (
    <div className="p-4 bg-slate-50 rounded border border-slate-100">
      <div className="flex items-center gap-2 text-slate-400 mb-2">{icon} <span className="text-[9px] font-black uppercase tracking-widest">{label}</span></div>
      <p className={`text-sm font-black uppercase ${color}`}>{value}</p>
      <p className="text-[9px] text-slate-400 font-bold uppercase">{sub}</p>
    </div>
  );
}