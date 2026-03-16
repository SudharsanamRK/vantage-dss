import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from "recharts";
import {
  TrendingUp, Zap, Target, Download, Plus,
  Settings2, ChevronRight, History, IndianRupee,
  Fish, Activity, AlertTriangle, RotateCcw,
  Save, CheckCircle, Loader, BookOpen, ChevronDown,
  BarChart3, Scale
} from "lucide-react";
import { usePond } from "../context/PondContext";

// growth engine
function buildProjection({ currentWeight, targetWeight, survivalRate,
  temperature, intensity, feedCostPerKg, expectedPrice, fishCount, fcrTarget }) {
  let weight    = Math.max(0.1, currentWeight);
  const heads   = fishCount * survivalRate;
  let totalFeed = 0;
  const fcrBase = fcrTarget + (intensity - 1) * 0.3;
  const days    = [];
  for (let i = 0; i <= 180; i++) {
    const tempFactor = 1 + (temperature - 28) * 0.018;
    const growthRate = (1.8 + intensity * 1.4) * (1 - i * 0.005) * tempFactor;
    weight           = Math.min(targetWeight + 5, weight + Math.max(0.08, growthRate));
    const biomassKg  = (heads * weight) / 1000;
    const dailyFeed  = biomassKg * 0.035 * (feedCostPerKg || 70);
    totalFeed       += dailyFeed;
    const revenue    = biomassKg * (expectedPrice || 420);
    days.push({
      day: i,
      weight: Math.round(weight * 10) / 10,
      profit: Math.round(revenue - totalFeed),
      biomass: Math.round(biomassKg),
      feedCost: Math.round(totalFeed),
      revenue: Math.round(revenue),
      fcr: parseFloat(fcrBase.toFixed(2)),
    });
    if (weight >= targetWeight) break;
  }
  return days;
}

function SensorTile({ label, val, unit, highlight }) {
  return (
    <div className={`p-5 space-y-1 ${highlight ? "bg-emerald-50" : ""}`}>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-light tracking-tight ${highlight ? "text-emerald-700" : "text-slate-800"}`}>{val ?? "—"}</span>
        <span className="text-slate-400 text-sm font-bold">{unit}</span>
      </div>
    </div>
  );
}

function SimInput({ label, value, onChange, min, max, step = "1", unit }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest flex justify-between">
        <span>{label}</span>
        {unit && <span className="text-slate-500">{unit}</span>}
      </label>
      <input type="number" value={value} min={min} max={max} step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm font-black
          text-white focus:ring-1 focus:ring-green-500 outline-none transition-colors" />
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-slate-900 border border-slate-700 shadow-xl p-3 text-xs font-mono">
      <p className="font-black text-slate-300 mb-2 uppercase tracking-widest text-[9px]">Day {label}</p>
      <p className="text-green-400">Weight: <span className="font-black">{d?.weight}g</span></p>
      <p className="text-blue-400">Biomass: <span className="font-black">{d?.biomass?.toLocaleString("en-IN")} kg</span></p>
      <p className="text-amber-400">Revenue: <span className="font-black">Rs.{(d?.revenue/100000)?.toFixed(2)}L</span></p>
      <p className="text-emerald-400">Net P&L: <span className="font-black">Rs.{(d?.profit/100000)?.toFixed(2)}L</span></p>
    </div>
  );
}

function StatCard({ label, value, sub, color = "text-slate-900", bg = "bg-white border-slate-200" }) {
  return (
    <div className={`border ${bg} p-4 shadow-sm`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-black tracking-tight ${color}`}>{value}</p>
      {sub && <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{sub}</p>}
    </div>
  );
}

function SavedSimRow({ sim, onLoad, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 overflow-hidden">
      <div className="flex items-center">
        <button onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-700 flex items-center justify-center shrink-0">
              <BarChart3 size={11} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase">{sim.name}</p>
              <p className="text-[9px] text-slate-400">{new Date(sim.savedAt).toLocaleDateString("en-IN")} · {sim.daysLeft}d to harvest</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-black ${parseFloat(sim.profitL)>=0?"text-emerald-600":"text-red-600"}`}>
              Rs.{sim.profitL}L
            </span>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${open?"rotate-180":""}`} />
          </div>
        </button>
        <button onClick={() => onDelete(sim.id)}
          className="px-3 py-3 text-slate-300 hover:text-red-400 transition-colors text-xs font-black border-l border-slate-200">
          x
        </button>
      </div>
      {open && (
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:"Target Wt",  value:`${sim.params.targetWeight}g`                              },
              { label:"Fish Count", value:sim.params.fishCount?.toLocaleString("en-IN")              },
              { label:"Survival",   value:`${(sim.params.survivalRate*100).toFixed(0)}%`             },
              { label:"FCR",        value:sim.params.fcrTarget                                       },
              { label:"Feed Rs/kg", value:`Rs.${sim.params.feedCostPerKg}`                           },
              { label:"Price Rs/kg",value:`Rs.${sim.params.expectedPrice}`                           },
            ].map(({label,value}) => (
              <div key={label}>
                <p className="text-[8px] font-black uppercase text-slate-400">{label}</p>
                <p className="text-xs font-black text-slate-700">{value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onLoad(sim)}
            className="w-full bg-green-700 hover:bg-green-800 text-white text-[10px] font-black
              uppercase tracking-widest py-2 flex items-center justify-center gap-2 transition-colors">
            <RotateCcw size={11} /> Load This Simulation
          </button>
        </div>
      )}
    </div>
  );
}

export default function HarvestSimulator() {
  const { farmConfig, brain, activePond, sensorData, updatePond, addLog, doc } = usePond();
  const fc = farmConfig || {};
  const b  = brain      || {};
  const sd = sensorData || {};

  const [intensity,       setIntensity]       = useState(1.0);
  const [currentWeight,   setCurrentWeight]   = useState(5);
  const [targetWeight,    setTargetWeight]     = useState(22);
  const [stockingDensity, setStockingDensity] = useState(40);
  const [survivalRate,    setSurvivalRate]     = useState(0.85);
  const [temperature,     setTemperature]     = useState(28);
  const [feedCostPerKg,   setFeedCostPerKg]   = useState(70);
  const [expectedPrice,   setExpectedPrice]   = useState(420);
  const [fishCount,       setFishCount]       = useState(100000);
  const [fcrTarget,       setFcrTarget]       = useState(1.5);
  const [isDirty,         setIsDirty]         = useState(false);
  const [simName,         setSimName]         = useState("");
  const [saving,          setSaving]          = useState(false);
  const [saved,           setSaved]           = useState(false);
  const [saveError,       setSaveError]       = useState("");
  const [savedSims,       setSavedSims]       = useState([]);
  const [activeTab,       setActiveTab]       = useState("growth");

  const seedFromPond = useCallback(() => {
    if (b.currentAvgWeight)     setCurrentWeight(b.currentAvgWeight);
    else if (fc.avgSeedWeight)  setCurrentWeight(fc.avgSeedWeight * 1000);
    if (fc.targetHarvestWeight) setTargetWeight(fc.targetHarvestWeight);
    if (fc.stockingDensity)     setStockingDensity(fc.stockingDensity);
    if (fc.survivalEstimate)    setSurvivalRate(fc.survivalEstimate / 100);
    if (sd.temp)                setTemperature(sd.temp);
    if (fc.feedCostPerKg)       setFeedCostPerKg(fc.feedCostPerKg);
    if (fc.expectedPrice)       setExpectedPrice(fc.expectedPrice);
    if (fc.fishCount)           setFishCount(fc.fishCount);
    if (fc.fcrTarget)           setFcrTarget(fc.fcrTarget);
    setIntensity(1.0);
    setIsDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePond?._id]);

  useEffect(() => { seedFromPond(); }, [seedFromPond]);

  useEffect(() => {
    if (!activePond?._id) return;
    try {
      const data = JSON.parse(localStorage.getItem(`fathom_sims_${activePond._id}`) || "[]");
      setSavedSims(Array.isArray(data) ? data : []);
    } catch { setSavedSims([]); }
  }, [activePond?._id]);

  const mark = (fn) => (...args) => { fn(...args); setIsDirty(true); };

  const projectionData = useMemo(() => buildProjection({
    currentWeight: Math.max(0.1, currentWeight), targetWeight, survivalRate,
    temperature, intensity, feedCostPerKg, expectedPrice, fishCount, fcrTarget,
  }), [currentWeight, targetWeight, survivalRate, temperature, intensity, feedCostPerKg, expectedPrice, fishCount, fcrTarget]);

  const harvestDay   = projectionData[projectionData.length - 1];
  const daysLeft     = harvestDay?.day ?? 0;
  const profitL      = harvestDay ? (harvestDay.profit   / 100000).toFixed(2) : "—";
  const revenueL     = harvestDay ? (harvestDay.revenue  / 100000).toFixed(2) : "—";
  const feedCostL    = harvestDay ? (harvestDay.feedCost / 100000).toFixed(2) : "—";
  const finalBiomass = harvestDay?.biomass ?? 0;

  const peakProfitDay = useMemo(() => {
    let peak = 0, pp = -Infinity;
    projectionData.forEach(d => { if (d.profit > pp) { pp = d.profit; peak = d.day; } });
    return peak;
  }, [projectionData]);

  const riskScore = (Math.abs(temperature - 28) > 3 ? 1.5 : 1) * intensity * (survivalRate < 0.7 ? 1.4 : 1);
  const risk = riskScore <= 1.2
    ? { label:"Optimal",    color:"text-green-700", bg:"bg-green-50 border-green-200", dot:"bg-green-500" }
    : riskScore <= 1.8
    ? { label:"Monitoring", color:"text-amber-700", bg:"bg-amber-50 border-amber-200", dot:"bg-amber-400" }
    : { label:"Critical",   color:"text-red-700",   bg:"bg-red-50 border-red-200",     dot:"bg-red-500"   };

  const handleSave = () => {
    if (!simName.trim()) { setSaveError("Enter a name."); return; }
    setSaving(true);
    try {
      const key  = `fathom_sims_${activePond._id}`;
      const sim  = {
        id: Date.now(), name: simName.trim(),
        savedAt: new Date().toISOString(),
        pondLabel: activePond.label,
        daysLeft, profitL,
        params: { intensity, currentWeight, targetWeight, stockingDensity, survivalRate, temperature, feedCostPerKg, expectedPrice, fishCount, fcrTarget },
      };
      const updated = [sim, ...JSON.parse(localStorage.getItem(key)||"[]")].slice(0,10);
      localStorage.setItem(key, JSON.stringify(updated));
      setSavedSims(updated);
      setSaved(true); setSimName(""); setIsDirty(false);
      addLog(`Harvest sim saved: "${sim.name}"`, "Operator");
      setTimeout(() => setSaved(false), 2000);
    } catch { setSaveError("Save failed."); }
    finally { setSaving(false); }
  };

  const handleApplyToFarm = async () => {
    try {
      await updatePond({ targetHarvestWeight: targetWeight, expectedPrice, feedCostPerKg, fcrTarget, stockingDensity, survivalEstimate: Math.round(survivalRate*100) });
      addLog(`Sim targets applied: ${targetWeight}g @ Rs.${expectedPrice}/kg`, "Operator");
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (err) { setSaveError(err.message); }
  };

  const handleLoadSim = (sim) => {
    const p = sim.params;
    setIntensity(p.intensity); setCurrentWeight(p.currentWeight); setTargetWeight(p.targetWeight);
    setStockingDensity(p.stockingDensity); setSurvivalRate(p.survivalRate); setTemperature(p.temperature);
    setFeedCostPerKg(p.feedCostPerKg); setExpectedPrice(p.expectedPrice);
    setFishCount(p.fishCount); setFcrTarget(p.fcrTarget); setIsDirty(true);
  };

  const handleDeleteSim = (id) => {
    const key = `fathom_sims_${activePond._id}`;
    const updated = savedSims.filter(s => s.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
    setSavedSims(updated);
  };

  return (
    <div className="min-h-full bg-[#f3f6f9] text-[#2d3e50] font-sans p-6">
      <div className="max-w-[1600px] mx-auto space-y-5">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">
              Assets / Ponds / {activePond?.label || "—"} / Harvest Sim
            </p>
            <h1 className="text-2xl font-light text-slate-800 tracking-tight">
              Dashboard: <span className="font-black uppercase">Harvest_Sim_01</span>
            </h1>
            {isDirty && (
              <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black text-amber-600 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={seedFromPond}
              className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-colors">
              <RotateCcw size={13}/> Reset to Real Data
            </button>
            <button onClick={handleApplyToFarm}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 text-[11px] font-black uppercase tracking-widest shadow-sm transition-colors">
              <Target size={13}/> Apply to Farm
            </button>
            <button onClick={() => document.getElementById("save-panel")?.scrollIntoView({behavior:"smooth"})}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2 text-[11px] font-black uppercase tracking-widest shadow-sm transition-colors">
              <Save size={13}/> Save Simulation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Days to Harvest"  value={`${daysLeft}d`}                                   sub={`DOC ${doc} today`}                    color="text-blue-700"    bg="bg-blue-50 border-blue-200"      />
          <StatCard label="Final Biomass"    value={`${finalBiomass.toLocaleString("en-IN")} kg`}    sub="at target weight"                      color="text-slate-900"   bg="bg-white border-slate-200"        />
          <StatCard label="Gross Revenue"    value={`Rs.${revenueL}L`}                               sub="projected"                             color="text-green-700"   bg="bg-green-50 border-green-200"     />
          <StatCard label="Feed Cost"        value={`Rs.${feedCostL}L`}                              sub="total cycle"                           color="text-red-600"     bg="bg-red-50 border-red-200"         />
          <StatCard label="Net Profit"       value={`Rs.${profitL}L`}                               sub={`after feed cost`}                     color={parseFloat(profitL)>=0?"text-emerald-700":"text-red-600"} bg={parseFloat(profitL)>=0?"bg-emerald-50 border-emerald-200":"bg-red-50 border-red-200"} />
          <StatCard label="Peak Profit Day"  value={`Day ${peakProfitDay}`}                          sub="optimal harvest window"                color="text-purple-700"  bg="bg-purple-50 border-purple-200"  />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">

            <div className="flex gap-1">
              {[["growth","Growth Curve"],["pnl","P&L Curve"],["both","Combined"]].map(([key,lbl]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border
                    ${activeTab===key ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
                  {lbl}
                </button>
              ))}
            </div>

            {(activeTab==="growth"||activeTab==="both") && (
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                    <TrendingUp size={13} className="text-green-600"/> Biological Growth Curve
                  </h3>
                  <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block"/> Weight (g)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> Biomass (kg)</span>
                  </div>
                </div>
                <div className="p-5 h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{left:-5,right:10}}>
                      <defs>
                        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} tick={{fill:"#94a3b8",fontFamily:"monospace"}}/>
                      <YAxis yAxisId="w" axisLine={false} tickLine={false} fontSize={10} tick={{fill:"#94a3b8",fontFamily:"monospace"}} tickFormatter={v=>`${v}g`}/>
                      <YAxis yAxisId="b" orientation="right" axisLine={false} tickLine={false} fontSize={10} tick={{fill:"#94a3b8",fontFamily:"monospace"}} tickFormatter={v=>`${v}kg`}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <ReferenceLine yAxisId="w" y={targetWeight} stroke="#ef4444" strokeDasharray="6 3"
                        label={{value:`Target ${targetWeight}g`,fill:"#ef4444",fontSize:9,fontFamily:"monospace"}}/>
                      {peakProfitDay>0 && <ReferenceLine yAxisId="w" x={peakProfitDay} stroke="#8b5cf6" strokeDasharray="4 3"
                        label={{value:"Peak profit",fill:"#8b5cf6",fontSize:9,fontFamily:"monospace"}}/>}
                      <Area yAxisId="w" type="monotone" dataKey="weight"  stroke="#16a34a" strokeWidth={2.5} fill="url(#wGrad)" name="Weight (g)"/>
                      <Area yAxisId="b" type="monotone" dataKey="biomass" stroke="#3b82f6" strokeWidth={1.5} fill="url(#bGrad)" strokeDasharray="4 2" name="Biomass (kg)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {(activeTab==="pnl"||activeTab==="both") && (
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                    <IndianRupee size={13} className="text-emerald-600"/> Projected P&amp;L Curve
                  </h3>
                  <span className="text-[9px] font-black text-purple-600 uppercase">Peak profit: Day {peakProfitDay}</span>
                </div>
                <div className="p-5 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{left:5,right:10}}>
                      <defs>
                        <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.12}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} tick={{fill:"#94a3b8",fontFamily:"monospace"}}/>
                      <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill:"#94a3b8",fontFamily:"monospace"}} tickFormatter={v=>`Rs.${(v/100000).toFixed(1)}L`}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3"/>
                      {peakProfitDay>0 && <ReferenceLine x={peakProfitDay} stroke="#8b5cf6" strokeDasharray="4 3"/>}
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#rGrad)" name="Revenue"/>
                      <Area type="monotone" dataKey="profit"  stroke="#0ea5e9" strokeWidth={2} fill="url(#pGrad)" name="Net Profit"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Settings2 size={13} className="text-slate-400"/> Parameter Analysis
                </h3>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                  <tr><th className="px-4 py-2.5">Parameter</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Recommendation</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { type:"Growth Intensity", status:risk.label, cls:`${risk.color} ${risk.bg}`,
                      rec:risk.label==="Optimal"?"Consistent with model — maintain current conditions":risk.label==="Monitoring"?"Slight deviation — monitor temperature closely":"Adjust intensity or temperature" },
                    { type:"Feed Conversion (FCR)", status:fcrTarget<=1.5?"Optimal":fcrTarget<=1.8?"Acceptable":"Review",
                      cls:fcrTarget<=1.5?"text-green-700 bg-green-50 border-green-200":fcrTarget<=1.8?"text-amber-700 bg-amber-50 border-amber-200":"text-red-700 bg-red-50 border-red-200",
                      rec:`FCR ${fcrTarget} — ${fcrTarget<=1.5?"maintain current feeding protocol":"consider reducing feed waste"}` },
                    { type:"Water Quality (Live)", status:b.status||"Optimal",
                      cls:b.status==="Critical"?"text-red-700 bg-red-50 border-red-200":b.status==="Warning"?"text-amber-700 bg-amber-50 border-amber-200":"text-green-700 bg-green-50 border-green-200",
                      rec:b.alerts?.length>0?b.alerts[0]:"All live parameters within safe thresholds" },
                    { type:"Survival Rate", status:survivalRate>=0.85?"Good":survivalRate>=0.7?"Fair":"Poor",
                      cls:survivalRate>=0.85?"text-green-700 bg-green-50 border-green-200":"text-amber-700 bg-amber-50 border-amber-200",
                      rec:`${(survivalRate*100).toFixed(0)}% — ${survivalRate>=0.85?"on target":"check biosecurity and water quality"}` },
                    { type:"Harvest Timing", status:daysLeft<=7?"Ready Soon":daysLeft<=14?"Approaching":"In Progress",
                      cls:daysLeft<=7?"text-emerald-700 bg-emerald-50 border-emerald-200":"text-blue-700 bg-blue-50 border-blue-200",
                      rec:peakProfitDay===daysLeft?`Day ${daysLeft} aligns with peak profit window`:`Peak profit at Day ${peakProfitDay} — current target Day ${daysLeft}` },
                  ].map(({type,status,cls,rec}) => (
                    <tr key={type} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-sm text-slate-700">{type}</td>
                      <td className="px-4 py-3"><span className={`text-[9px] font-black uppercase px-2 py-1 border ${cls}`}>{status}</span></td>
                      <td className="px-4 py-3 text-slate-500 text-xs italic">{rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="save-panel" className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Save size={13} className="text-green-600"/>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Save This Simulation</h3>
              </div>
              <div className="p-5">
                <p className="text-[10px] text-slate-400 font-medium mb-3">Name and save current parameters to compare scenarios later. Stored locally in your browser.</p>
                <div className="flex gap-2">
                  <input type="text" value={simName} onChange={e=>{setSimName(e.target.value);setSaveError("");}}
                    placeholder="e.g. High intensity — price spike scenario"
                    className="flex-1 bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
                      text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white transition-colors"/>
                  <button onClick={handleSave} disabled={saving||saved||!simName.trim()}
                    className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50
                      ${saved?"bg-emerald-500 text-white":"bg-green-700 hover:bg-green-800 text-white"}`}>
                    {saved?<><CheckCircle size={13}/> Saved!</>:saving?<><Loader size={13} className="animate-spin"/> Saving…</>:<><Save size={13}/> Save</>}
                  </button>
                </div>
                {saveError && <p className="text-[10px] font-bold text-red-500 mt-2">{saveError}</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#1e293b] text-white shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 size={15} className="text-green-400"/>
                  <h3 className="font-black text-[11px] tracking-widest uppercase">Simulator Settings</h3>
                </div>
                <button onClick={seedFromPond} className="text-[9px] font-black text-slate-400 hover:text-green-400 uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <RotateCcw size={10}/> Reset
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Intensity</label>
                    <span className="text-[11px] font-black text-green-400">{intensity}x</span>
                  </div>
                  <input type="range" min="0.5" max="2" step="0.1" value={intensity}
                    onChange={e=>{setIntensity(parseFloat(e.target.value));setIsDirty(true);}}
                    className="w-full accent-green-500 h-1 cursor-pointer"/>
                  <div className="flex justify-between text-[8px] text-slate-600 uppercase font-bold">
                    <span>Low</span><span>Standard</span><span>Intensive</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SimInput label="Density/m2" value={stockingDensity} onChange={mark(setStockingDensity)} min="10" max="200" unit="/m2"/>
                  <SimInput label="Survival"   value={(survivalRate*100).toFixed(0)} onChange={mark(v=>setSurvivalRate(v/100))} min="50" max="100" unit="%"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SimInput label="Start Wt"  value={currentWeight} onChange={mark(setCurrentWeight)} step="0.5" min="0.1" unit="g"/>
                  <SimInput label="Target Wt" value={targetWeight}  onChange={mark(setTargetWeight)}  min="5" unit="g"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SimInput label="Feed Rs/kg"  value={feedCostPerKg} onChange={mark(setFeedCostPerKg)} unit="Rs"/>
                  <SimInput label="Price Rs/kg" value={expectedPrice} onChange={mark(setExpectedPrice)} unit="Rs"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SimInput label="Fish Count" value={fishCount}  onChange={mark(setFishCount)}/>
                  <SimInput label="FCR Target" value={fcrTarget}  onChange={mark(setFcrTarget)} step="0.1" min="1" max="3"/>
                </div>
                <SimInput label="Temperature" value={temperature} onChange={mark(setTemperature)} step="0.5" min="15" max="40" unit="C"/>
                <div className="pt-3 border-t border-white/10 space-y-2">
                  {[
                    {label:"Species",    value:fc.species||"Vannamei"},
                    {label:"Culture",    value:fc.cultureType||"Semi-Intensive"},
                    {label:"Current DOC",value:`${doc} days`},
                    {label:"Live DO",    value:sd.do?`${sd.do} mg/L`:"—"},
                  ].map(({label,value})=>(
                    <div key={label} className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 uppercase font-black">{label}</span>
                      <span className="text-white font-black">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 pb-5">
                <button onClick={handleApplyToFarm}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black
                    uppercase tracking-widest py-2.5 flex items-center justify-center gap-2 transition-colors">
                  <Target size={12}/> Apply Targets to Farm
                </button>
                <p className="text-[8px] text-slate-500 text-center mt-1.5">Updates harvest weight, price and FCR in Setup</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Scale size={13} className="text-slate-400"/>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Yield Projection</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  {title:"Est. Final Revenue",  val:`Rs.${revenueL}L`,                                  sub:"at target harvest weight"},
                  {title:"Est. Net Profit",      val:`Rs.${profitL}L`,                                   sub:`after Rs.${feedCostL}L feed cost`},
                  {title:"FCR Projected",        val:harvestDay?.fcr??"—",                               sub:`target: ${fcrTarget}`},
                  {title:"Final Biomass",        val:`${finalBiomass.toLocaleString("en-IN")} kg`,       sub:`${fishCount.toLocaleString("en-IN")} x ${(survivalRate*100).toFixed(0)}% survival`},
                  {title:"Harvest in",           val:`${daysLeft} days`,                                 sub:`target: ${targetWeight}g per shrimp`},
                  {title:"Peak Profit Window",   val:`Day ${peakProfitDay}`,                             sub:"optimal harvest day"},
                ].map(({title,val,sub})=>(
                  <div key={title} className="flex justify-between items-start px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{title}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{val}</span>
                      <ChevronRight size={11} className="text-slate-300"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`border p-4 ${risk.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${risk.dot} animate-pulse`}/>
                <p className={`text-[10px] font-black uppercase tracking-widest ${risk.color}`}>Simulation Risk: {risk.label}</p>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                {risk.label==="Optimal"?"All parameters within optimal range. Proceed with confidence."
                :risk.label==="Monitoring"?"Some parameters deviate. Growth may be 10-15% slower."
                :"High risk — adjust intensity or temperature before proceeding."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={13} className="text-slate-400"/>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Saved Simulations</h3>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase">{savedSims.length} saved</span>
              </div>
              <div className="p-3 space-y-2 max-h-[380px] overflow-y-auto">
                {savedSims.length===0?(
                  <div className="py-8 text-center">
                    <BookOpen size={20} className="text-slate-200 mx-auto mb-2"/>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No simulations saved yet</p>
                    <p className="text-[9px] text-slate-300 mt-1">Name and save scenarios above to compare</p>
                  </div>
                ):savedSims.map(sim=>(
                  <SavedSimRow key={sim.id} sim={sim} onLoad={handleLoadSim} onDelete={handleDeleteSim}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}