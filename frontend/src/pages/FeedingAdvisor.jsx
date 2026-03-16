import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePond } from "../context/PondContext";
import {
  Zap, AlertTriangle, Scale, TrendingUp, IndianRupee,
  Activity, ShieldCheck, Target, Play, Pause,
  Thermometer, Droplets, ChevronRight, Fish, Clock,
  FlaskConical, Wind, BarChart3
} from "lucide-react";

// ─── Metabolic efficiency curve — peaks at dawn/dusk, dips at noon & midnight ─
function buildMetabolicCurve(temp, doVal) {
  const base = [30,32,38,48,62,80,92,98,100,96,88,75,60,52,58,68,80,90,94,90,78,62,48,36];
  return base.map(v => {
    let adj = v;
    if (doVal < 4.5) adj *= 0.4;
    else if (doVal < 5.5) adj *= 0.75;
    if (temp > 32) adj *= 0.8;
    else if (temp < 25) adj *= 0.7;
    return Math.min(100, Math.round(adj));
  });
}

// ─── Daily feed calculation from real wizard data ─────────────────────────────
function calcDailyFeed(farmConfig, brain) {
  const biomassKg   = brain?.currentBiomassKg  || 0;
  const fcrTarget   = farmConfig?.fcrTarget     || 1.5;
  const efficiency  = parseFloat(brain?.feedEfficiency) / 100 || 1.0;
  const feedingFreq = farmConfig?.feedingFrequency || 4;

  // Body weight feeding rate: 3–5% BW/day adjusted by efficiency
  const bwRate      = 0.04 * efficiency;
  const dailyFeedKg = +(biomassKg * bwRate).toFixed(1);
  const perFeed     = +(dailyFeedKg / feedingFreq).toFixed(2);
  return { dailyFeedKg, perFeed, feedingFreq };
}

// ─── Helper components ────────────────────────────────────────────────────────
function SensorRow({ icon, label, value, trend, warn }) {
  return (
    <div className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group
      ${warn ? "bg-red-50/40" : ""}`}>
      <div className="flex items-center gap-4">
        <div className={`transition-colors ${warn ? "text-red-500" : "text-slate-400 group-hover:text-green-700"}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className={`text-lg font-bold tracking-tight ${warn ? "text-red-600" : "text-slate-800"}`}>{value}</p>
        </div>
      </div>
      <div className={`text-[9px] font-bold px-2 py-0.5 uppercase border
        ${warn ? "bg-red-100 text-red-600 border-red-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
        {trend}
      </div>
    </div>
  );
}

function EcoBox({ label, value, sub, icon, accent }) {
  return (
    <div className="bg-white border border-slate-200 p-5 shadow-sm flex justify-between items-start">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className={`text-[10px] font-black uppercase mt-1 ${accent || "text-green-700"}`}>{sub}</p>
      </div>
      <div className="text-slate-200 mt-1">{icon}</div>
    </div>
  );
}

// ─── Feed schedule times ──────────────────────────────────────────────────────
const FEED_TIMES = ["06:00","10:00","14:00","18:00","21:00","23:00"];

function FeedSchedule({ freq, perFeed, advice, isCrisis }) {
  const now  = new Date();
  const nowM = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="divide-y divide-slate-100">
      {FEED_TIMES.slice(0, freq).map((t, i) => {
        const [h, m]  = t.split(":").map(Number);
        const feedMin = h * 60 + m;
        const done    = nowM > feedMin + 30;
        const next    = !done && (feedMin - nowM) >= 0 && (feedMin - nowM) < 120;
        return (
          <div key={t} className={`flex items-center justify-between px-5 py-3
            ${next ? "bg-green-50" : done ? "" : ""}`}>
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isCrisis ? "bg-red-500 animate-pulse" :
                done ? "bg-green-500" : next ? "bg-amber-400 animate-pulse" : "bg-slate-200"
              }`} />
              <span className={`text-xs font-bold ${done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                Feed {i + 1}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 tabular-nums">{t}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 border ${
                isCrisis      ? "bg-red-100 text-red-600 border-red-200" :
                done          ? "bg-slate-100 text-slate-400 border-slate-200" :
                next          ? "bg-amber-100 text-amber-700 border-amber-200" :
                                "bg-slate-50 text-slate-400 border-slate-100"
              } uppercase`}>
                {isCrisis ? "HOLD" : done ? "Done" : next ? "Next" : `${perFeed} kg`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main FeedingAdvisor ──────────────────────────────────────────────────────
export default function FeedingAdvisor() {
  const { sensorData, farmConfig, brain, activePond } = usePond();

  const [isPaused,   setIsPaused]   = useState(false);
  const [isCrisis,   setIsCrisis]   = useState(false);
  const [currentHour] = useState(new Date().getHours());

  const sd = sensorData || {};
  const fc = farmConfig || {};
  const b  = brain      || {};

  // Use real sensor data, or crisis override
  const liveDO   = isCrisis ? 2.4 : (sd.do      ?? 6.4);
  const liveTemp = sd.temp   ?? 28.2;
  const liveNH3  = sd.ammonia ?? 0.08;
  const livePH   = sd.ph     ?? 7.8;

  // Auto-detect crisis from real sensor data
  useEffect(() => {
    if (sd.do !== undefined && sd.do < 3.0) setIsCrisis(true);
    else setIsCrisis(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sd.do]);

  // Feed calculations from real wizard data
  const { dailyFeedKg, perFeed, feedingFreq } = calcDailyFeed(fc, b);
  const metabolicCurve = buildMetabolicCurve(liveTemp, liveDO);

  // Financial — daily feed cost
  const feedCostToday = +(dailyFeedKg * (fc.feedCostPerKg || 70)).toFixed(0);
  const fcrDisplay    = fc.fcrTarget ? `${fc.fcrTarget} FCR` : "1.5 FCR";

  // Protocol status
  const protocolStatus = isCrisis
    ? "SUSPENDED"
    : isPaused
    ? "PAUSED"
    : dailyFeedKg > 0
    ? `${dailyFeedKg} KG`
    : "—";

  const protocolSub = isCrisis
    ? "CRITICAL OXYGEN STRESS DETECTED"
    : isPaused
    ? "SYSTEM PAUSED BY OPERATOR"
    : b.feedingAdvice || "OPTIMAL FEED (ADAPTIVE)";

  const protocolPct = isCrisis ? 100
    : isPaused ? 50
    : Math.min(100, Math.round(((new Date().getHours()) / 23) * 100));

  return (
    <div className={`min-h-full font-sans p-6 transition-colors duration-500
      ${isCrisis ? "bg-red-50" : "bg-[#f3f6f9]"} text-[#2d3e50]`}>
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Assets / Ponds / {activePond?.label || "—"} / Feeding
            </p>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Feeding Advisor: <span className="font-black uppercase">Bio-Logic Protocol</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCrisis(c => !c)}
              className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                isCrisis
                  ? "bg-red-600 text-white border-red-700"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isCrisis
                ? <><AlertTriangle size={13}/> System Override</>
                : <><ShieldCheck size={13}/> Test Alert</>}
            </button>
            <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-colors flex items-center gap-2">
              <Zap size={13}/> Quick Log
            </button>
          </div>
        </header>

        {/* ── Crisis banner ── */}
        {isCrisis && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
            className="bg-red-600 text-white px-5 py-3 flex items-center gap-3 border-l-4 border-red-800">
            <AlertTriangle size={16} className="shrink-0" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest">Critical Oxygen Event</p>
              <p className="text-[10px] font-bold opacity-80">
                DO = {liveDO} mg/L — Feeding suspended. Boost aeration immediately.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT: Vitals + Protocol ── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Real-time vitals */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Activity size={13} className="text-slate-400"/> Real-Time Vitals
                </h3>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="divide-y divide-slate-100">
                <SensorRow
                  icon={<Droplets size={16}/>} label="Oxygen (DO)"
                  value={`${liveDO} mg/L`}
                  trend={liveDO < 4.5 ? "CRITICAL" : liveDO < 5.5 ? "LOW" : "Optimal"}
                  warn={liveDO < 4.5}
                />
                <SensorRow
                  icon={<Thermometer size={16}/>} label="Temperature"
                  value={`${liveTemp}°C`}
                  trend={liveTemp > 32 ? "HIGH" : liveTemp < 25 ? "LOW" : "Stable"}
                  warn={liveTemp > 32 || liveTemp < 25}
                />
                <SensorRow
                  icon={<FlaskConical size={16}/>} label="Ammonia (NH₃)"
                  value={`${liveNH3} ppm`}
                  trend={liveNH3 > 0.3 ? "TOXIC" : liveNH3 > 0.1 ? "Elevated" : "Normal"}
                  warn={liveNH3 > 0.1}
                />
                <SensorRow
                  icon={<Scale size={16}/>} label="Est. Biomass"
                  value={`${b.currentBiomassKg?.toLocaleString("en-IN") || "—"} kg`}
                  trend={b.currentAvgWeight ? `${b.currentAvgWeight}g avg` : "—"}
                  warn={false}
                />
              </div>
            </div>

            {/* Active Protocol card */}
            <div className={`text-white shadow-lg overflow-hidden transition-colors duration-500
              ${isCrisis ? "bg-red-900" : "bg-[#1e293b]"}`}>
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                <Target size={16} className={isCrisis ? "text-red-400" : "text-green-400"} />
                <h3 className="font-black text-[11px] tracking-widest uppercase">Active Protocol</h3>
                <div className="ml-auto">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${
                    isCrisis ? "border-red-500 text-red-400" :
                    isPaused ? "border-amber-500 text-amber-400" :
                    "border-green-500 text-green-400"
                  }`}>
                    {isCrisis ? "ALERT" : isPaused ? "PAUSED" : "ACTIVE"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className={`text-5xl font-light mb-2 tracking-tighter ${
                  isCrisis ? "text-red-400 font-black" : isPaused ? "text-amber-400" : "text-white"
                }`}>
                  {protocolStatus}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {protocolSub}
                </p>
                <p className="text-[9px] text-slate-500 font-bold mb-5">
                  Feed efficiency: {b.feedEfficiency || "—"} · FCR target: {fc.fcrTarget || "—"}
                </p>
                <div className="h-0.5 w-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${protocolPct}%` }}
                    transition={{ duration: 1 }}
                    className={`h-0.5 ${isCrisis ? "bg-red-500" : isPaused ? "bg-amber-400" : "bg-green-400"}`}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[8px] text-slate-500 font-bold uppercase">Daily ration</span>
                  <span className={`text-[8px] font-black uppercase ${
                    isCrisis ? "text-red-400" : "text-green-400"
                  }`}>{protocolPct}% dispensed</span>
                </div>
              </div>

              {/* Per-feed breakdown */}
              <div className="border-t border-white/10 px-6 py-4 grid grid-cols-3 gap-4">
                {[
                  { label: "Per Feed",  value: isCrisis ? "HOLD" : `${perFeed} kg` },
                  { label: "Frequency", value: `${feedingFreq}× / day` },
                  { label: "Species",   value: (fc.species || "—").slice(0,8) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-xs font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed schedule */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Clock size={13} className="text-slate-400"/> Feed Schedule
                </h3>
                <span className="text-[9px] font-black text-slate-400 uppercase">{feedingFreq}× daily</span>
              </div>
              <FeedSchedule
                freq={feedingFreq}
                perFeed={perFeed}
                advice={b.feedingAdvice}
                isCrisis={isCrisis}
              />
            </div>
          </div>

          {/* ── RIGHT: Chart + Eco tiles ── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Metabolic efficiency bar chart */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <BarChart3 size={13} className="text-slate-400"/> Metabolic Efficiency — 24H Cycle
                </h3>
                <div className="flex gap-1">
                  <button className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-1">24H</button>
                  <button className="text-[10px] font-black text-slate-400 px-2.5 py-1 hover:bg-slate-100 transition-colors">7D</button>
                </div>
              </div>

              <div className="px-6 pt-6 pb-4 h-[340px] flex flex-col">
                <div className="flex-1 flex items-end gap-1 border-b border-slate-100 pb-2 relative">
                  {/* Horizontal guide lines */}
                  {[25,50,75,100].map(pct => (
                    <div key={pct} className="absolute left-0 right-0 border-t border-slate-50"
                      style={{ bottom: `${pct}%` }}>
                      <span className="absolute -left-6 -top-2 text-[8px] font-bold text-slate-300">{pct}</span>
                    </div>
                  ))}
                  {metabolicCurve.map((val, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ delay: i * 0.02, duration: 0.4 }}
                        className={`w-full transition-all ${
                          isCrisis        ? "bg-red-200" :
                          isPaused        ? "bg-slate-200" :
                          i === currentHour ? "bg-green-700" :
                          i < currentHour   ? "bg-slate-200 group-hover:bg-slate-300" :
                                              "bg-slate-100 group-hover:bg-slate-200"
                        }`}
                      />
                      {i === currentHour && (
                        <div className="absolute -top-5 text-[8px] font-black text-green-700 uppercase whitespace-nowrap">
                          Now
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span>00:00</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                      isCrisis ? "bg-red-500" : currentHour >= 6 && currentHour <= 18 ? "bg-amber-400" : "bg-blue-400"
                    }`} />
                    {isCrisis ? "Crisis — Feed Halted" :
                      currentHour >= 6 && currentHour <= 18 ? "Diurnal Phase" : "Nocturnal Phase"}
                  </span>
                  <span>23:59</span>
                </div>
              </div>
            </div>

            {/* Economic tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EcoBox
                label="Daily Feed Cost"
                value={`₹${feedCostToday.toLocaleString("en-IN")}`}
                sub={`${dailyFeedKg} kg × ₹${fc.feedCostPerKg || 70}/kg`}
                icon={<IndianRupee size={20}/>}
              />
              <EcoBox
                label="Feed Conversion"
                value={fcrDisplay}
                sub={b.feedingAdvice || "Awaiting data"}
                icon={<TrendingUp size={20}/>}
                accent={b.feedEfficiency && parseFloat(b.feedEfficiency) >= 80 ? "text-green-700" : "text-amber-600"}
              />
              <button
                onClick={() => setIsPaused(p => !p)}
                disabled={isCrisis}
                className={`flex items-center justify-center gap-3 font-black uppercase text-[11px] tracking-widest border shadow-sm transition-all min-h-[88px] disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPaused
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isPaused
                  ? <><Play size={15} fill="white"/> Resume System</>
                  : <><Pause size={15} fill="currentColor"/> Pause System</>}
              </button>
            </div>

            {/* Stocking data summary */}
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Fish size={13} className="text-slate-400"/> Stocking & Growth Summary
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
                {[
                  { label: "Stocking Count",    value: b.survivingCount ? b.survivingCount.toLocaleString("en-IN") : "—", sub: "Estimated surviving" },
                  { label: "Avg Body Weight",   value: b.currentAvgWeight ? `${b.currentAvgWeight}g` : "—",               sub: `Target: ${fc.targetHarvestWeight || 20}g` },
                  { label: "Projected Harvest", value: b.projectedHarvestKg ? `${b.projectedHarvestKg.toLocaleString("en-IN")} kg` : "—", sub: `in ${Math.max(0,(fc.targetHarvestDays||120) - (fc.doc||0))} days` },
                  { label: "Yield Loss Risk",   value: b.yieldLossPrediction || "—",                                       sub: b.riskLevel || "—" },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="p-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{value}</p>
                    <p className="text-[9px] font-bold text-slate-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom action bar ── */}
        <div className={`bg-white border-t-2 shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6
          ${isCrisis ? "border-red-600" : "border-green-700"}`}>
          <div className="flex items-center gap-5">
            <div className={`h-12 w-12 flex items-center justify-center shrink-0
              ${isCrisis ? "bg-red-100 text-red-600" : "bg-green-50 text-green-700"}`}>
              <Zap size={22} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight text-slate-800">
                {isCrisis ? "Emergency Protocol — Suspend All Feeding" : "Execute Bio-Logic Feed"}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {isCrisis
                  ? `DO critical at ${liveDO} mg/L — boost aeration, halt feed dispense`
                  : `Auto-calculated dosing: ${dailyFeedKg}kg/day @ ${perFeed}kg per feed · FCR ${fc.fcrTarget || "—"}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => isCrisis ? setIsCrisis(false) : null}
            className={`w-full md:w-auto text-white px-10 py-4 font-black uppercase text-[11px] tracking-widest shadow-md flex items-center justify-center gap-3 transition-colors
              ${isCrisis ? "bg-red-600 hover:bg-red-700" : "bg-green-700 hover:bg-green-800"}
              ${isPaused ? "opacity-60 cursor-not-allowed" : ""}`}
            disabled={isPaused}
          >
            {isCrisis ? "Clear Alert & Resume" : "Start Operation"}
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}