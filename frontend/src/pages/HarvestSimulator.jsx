import React, { useState, useMemo, useEffect } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ReferenceLine 
} from "recharts";
import { 
  TrendingUp, Zap, Target, AlertTriangle, ShieldCheck, 
  Download, Plus, Thermometer, Droplets, Fish, 
  Settings2, Info, Calendar, DollarSign, ChevronRight, History
} from "lucide-react";

// Persistent State Hook
const usePersistentState = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      try { return saved ? JSON.parse(saved) : defaultValue; } catch (e) { return defaultValue; }
    }
    return defaultValue;
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
};

export default function HarvestPlanner() {
  // --- States ---
  const [intensity, setIntensity] = usePersistentState('harvest-intensity', 1.0);
  const [currentWeight, setCurrentWeight] = usePersistentState('harvest-current-weight', 420);
  const [targetWeight, setTargetWeight] = usePersistentState('harvest-target-weight', 500);
  const [stockingDensity, setStockingDensity] = usePersistentState('harvest-stocking-density', 60);
  const [feedPrice, setFeedPrice] = usePersistentState('harvest-feed-price', 1.5);
  const [sellPrice, setSellPrice] = usePersistentState('harvest-sell-price', 12.5);
  const [survivalRate, setSurvivalRate] = usePersistentState('harvest-survival-rate', 0.85);
  const [aerationLevel, setAerationLevel] = usePersistentState('harvest-aeration-level', 80);
  const [temperature, setTemperature] = usePersistentState('harvest-temperature', 28.5);
  const [salinity, setSalinity] = usePersistentState('harvest-salinity', 15);

  // --- Logic: Calculations ---
  const risk = useMemo(() => {
    const score = ((100 - aerationLevel) / 20 * intensity) * (Math.abs(temperature - 28) > 4 ? 1.2 : 1);
    if (score <= 1.2) return { label: "Optimal", color: "text-emerald-600", bg: "bg-emerald-100" };
    if (score <= 1.8) return { label: "Monitoring", color: "text-amber-600", bg: "bg-amber-100" };
    return { label: "Critical", color: "text-red-600", bg: "bg-red-100" };
  }, [intensity, aerationLevel, temperature]);

  const projectionData = useMemo(() => {
    let weight = currentWeight;
    const totalBiomass = stockingDensity * survivalRate * 100;
    const days = [];
    let totalFeed = 0;
    const fcrBase = 1.4 + (intensity * 0.2);

    for (let i = 0; i <= 60; i++) {
      const growthRate = (2.5 + (intensity * 1.8)) * (1 - i * 0.008) * (1 + (temperature - 28) * 0.02);
      weight = Math.max(20, weight + growthRate);
      totalFeed += (growthRate * fcrBase * totalBiomass) / 1000;
      days.push({
        day: i,
        weight: Math.round(weight * 10) / 10,
        profit: Math.round((weight * sellPrice * totalBiomass * survivalRate / 1000) - (totalFeed * feedPrice)),
        feedUsed: Math.round(totalFeed * 10) / 10,
        fcr: fcrBase.toFixed(2)
      });
      if (weight >= targetWeight) break;
    }
    return days;
  }, [intensity, currentWeight, targetWeight, stockingDensity, survivalRate, temperature, feedPrice, sellPrice]);

  const harvestDay = projectionData[projectionData.length - 1];

  return (
    <div className="min-h-screen bg-[#f3f6f9] text-[#2d3e50] font-sans p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* TOP BREADCRUMB & HEADER (farmOS Style) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Assets / Ponds / POND_ALPHA_01</p>
            <h1 className="text-3xl font-light">Dashboard: <span className="font-bold">HARVEST_SIM_01</span></h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 text-sm font-semibold rounded hover:bg-slate-50 shadow-sm">
              <Plus size={16} /> Add Log
            </button>
            <button className="bg-[#168039] text-white px-6 py-2 text-sm font-bold rounded hover:bg-[#12662d] shadow-sm">
              Quick Action
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Charts and Observations */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* LIVE SENSOR STYLE CARDS */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-slate-400" /> Projection Summary
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 font-bold rounded uppercase">Synced</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <SensorTile label="Days to Harvest" val={harvestDay?.day} unit="days" />
                <SensorTile label="Target Weight" val={targetWeight} unit="g" />
                <SensorTile label="Temperature" val={temperature} unit="°C" />
              </div>
            </div>

            {/* MAIN CHART CARD */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-slate-400" /> Biological Growth Curve
                </h3>
                <button className="text-slate-400 hover:text-slate-600"><Download size={14}/></button>
              </div>
              <div className="p-6 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '4px' }} />
                    <ReferenceLine y={targetWeight} stroke="#ef4444" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="weight" stroke="#168039" strokeWidth={2} fill="#168039" fillOpacity={0.05} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TABLE STYLE LOGS */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-100">
                <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={14} className="text-slate-400" /> Parameter Analysis
                </h3>
              </div>
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Observation Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <TableRow type="Growth Analysis" status={risk.label} recommendation="Consistent with model" statusColor={risk.color} statusBg={risk.bg} />
                  <TableRow type="Feed Conversion" status="Planned" recommendation="Maintain current intensity" />
                  <TableRow type="Water Quality" status="Optimal" recommendation="No actions required" statusColor="text-emerald-600" statusBg="bg-emerald-100" />
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: Infrastructure & Logs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* DARK INFRASTRUCTURE CARD */}
            <div className="bg-[#2d3e50] text-white rounded shadow-lg overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <Settings2 size={18} className="text-emerald-400" />
                <h3 className="font-bold text-sm">Simulator Settings</h3>
              </div>
              <div className="p-6 space-y-4">
                <SidebarInput label="Intensity" val={`${intensity}x`} set={(v) => setIntensity(v)} type="range" min="0.5" max="2" step="0.1" />
                <div className="grid grid-cols-2 gap-4">
                  <SidebarInput label="Density" val={stockingDensity} set={setStockingDensity} />
                  <SidebarInput label="Survival %" val={survivalRate} set={setSurvivalRate} step="0.05" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SidebarInput label="Start (g)" val={currentWeight} set={setCurrentWeight} />
                  <SidebarInput label="Target (g)" val={targetWeight} set={setTargetWeight} />
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
                  <span>Species</span>
                  <span className="text-white font-bold">Vannamei Shrimp</span>
                </div>
              </div>
            </div>

            {/* ACTIVITY LOG STYLE */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-slate-400" /> Yield Projection
                </h3>
                <button className="text-slate-300"><Settings2 size={14}/></button>
              </div>
              <div className="p-4 space-y-4">
                <LogItem title="Est. Final Profit" val={`$${harvestDay?.profit?.toLocaleString()}`} sub="Based on current feed price" />
                <LogItem title="FCR Achieved" val={harvestDay?.fcr} sub="Target ratio: 1.50" />
                <LogItem title="Total Feed Used" val={`${harvestDay?.feedUsed} tons`} sub="Log recorded by System" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function SensorTile({ label, val, unit }) {
  return (
    <div className="p-6 space-y-1">
      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-medium">{val}</span>
        <span className="text-slate-400 text-sm">{unit}</span>
      </div>
    </div>
  );
}

function SidebarInput({ label, val, set, type = "number", ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold text-slate-400">{label}</label>
      <input 
        type={type} value={val} 
        onChange={(e) => set(parseFloat(e.target.value) || 0)}
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-emerald-500 outline-none"
        {...props}
      />
    </div>
  );
}

function TableRow({ type, status, recommendation, statusColor = "text-blue-600", statusBg = "bg-blue-100" }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="p-4 font-semibold text-sm">{type}</td>
      <td className="p-4">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusBg} ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="p-4 text-slate-400 italic text-sm">{recommendation}</td>
    </tr>
  );
}

function LogItem({ title, val, sub }) {
  return (
    <div className="flex justify-between items-start group cursor-pointer">
      <div>
        <p className="text-xs font-bold text-slate-800">{title}</p>
        <p className="text-[10px] text-slate-400">{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">{val}</span>
        <ChevronRight size={14} className="text-slate-300" />
      </div>
    </div>
  );
}