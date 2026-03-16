import React, { useState } from "react";
import { usePond } from "../context/PondContext";
import {
  Droplets, ClipboardList, Map as MapIcon, History,
  Plus, Zap, AlertTriangle, ChevronRight, Settings,
  Activity, TrendingUp, Fish, Clock, Leaf, Calendar,
  ShieldCheck, ShieldAlert, ShieldX, Thermometer, Wind,
  FlaskConical, Scale, AlertCircle as AlertCircleIcon
} from "lucide-react";
import SensorHistoryCharts from "../components/ui/SensorHistoryCharts";
import AbwSamplerModal     from "../components/ui/AbwSamplerModal";
import MortalityModal      from "../components/ui/MortalityModal";
import { CompleteHarvestModal, CycleHistoryPanel } from "../components/ui/CycleHistory";
import WeatherWidget       from "../components/ui/WeatherWidget";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(val, fallback = "—") {
  if (val === undefined || val === null || val === "" || val === 0) return fallback;
  return val;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, badge }) {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex justify-between items-center">
      <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
        {icon} {title}
      </h3>
      {badge}
    </div>
  );
}

function SensorCard({ label, value, unit, icon, status }) {
  const statusStyles = {
    ok:       "border-t-2 border-t-emerald-400",
    warn:     "border-t-2 border-t-amber-400",
    critical: "border-t-2 border-t-red-500",
    idle:     "border-t-2 border-t-slate-200",
  };
  const valueStyles = {
    ok:       "text-slate-900",
    warn:     "text-amber-600 font-bold",
    critical: "text-red-600 font-bold",
    idle:     "text-slate-300",
  };
  const dotStyles = {
    ok:       "bg-emerald-400",
    warn:     "bg-amber-400 animate-pulse",
    critical: "bg-red-500 animate-pulse",
    idle:     "bg-slate-200",
  };

  const s = status || "idle";
  const displayVal = (value === 0 || value === undefined || value === null) ? "—" : value;

  return (
    <div className={`p-5 bg-white ${statusStyles[s]}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${dotStyles[s]}`} />
          {icon}
        </div>
      </div>
      <p className={`text-4xl font-light tracking-tighter ${valueStyles[s]}`}>
        {displayVal}
        {displayVal !== "—" && (
          <span className="text-xs text-slate-300 font-bold uppercase ml-1">{unit}</span>
        )}
      </p>
      {displayVal === "—" && (
        <p className="text-[9px] text-slate-300 uppercase tracking-widest mt-1 font-bold">No Signal</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Optimal:  { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    Warning:  { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500 animate-pulse" },
    Critical: { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500 animate-pulse" },
    STABLE:   { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  };
  const s = map[status] || map["STABLE"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${s.bg} ${s.text} text-[10px] font-black uppercase tracking-wider rounded-full`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon, accent = "green" }) {
  const accents = {
    green:  "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue:   "bg-blue-50   border-blue-200   text-blue-700",
    amber:  "bg-amber-50  border-amber-200  text-amber-700",
    slate:  "bg-slate-50  border-slate-200  text-slate-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };
  return (
    <div className={`border rounded-sm p-4 ${accents[accent]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
        <span className="opacity-60">{icon}</span>
      </div>
      <p className="text-2xl font-light tracking-tighter">{value}</p>
      {sub && <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1">{sub}</p>}
    </div>
  );
}

function HealthRing({ score }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * circ;
  const color = score > 75 ? "#10b981" : score > 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-[11px] font-black text-slate-800">{score ?? "—"}</span>
    </div>
  );
}

function FeedBadge({ advice }) {
  if (!advice) return <span className="text-slate-300 text-xs">—</span>;
  const isStop    = advice.toLowerCase().includes("stop");
  const isReduce  = advice.toLowerCase().includes("reduce");
  const isOptimal = advice.toLowerCase().includes("optimal");
  const cls = isStop
    ? "bg-red-100 text-red-700 border-red-200"
    : isReduce
    ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";
  return (
    <span className={`inline-block px-2 py-1 border text-[10px] font-black uppercase tracking-wider rounded-sm ${cls}`}>
      {advice}
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { sensorData, logs, addLog, brain, farmConfig, doc: docCtx } = usePond();
  const [showLogModal,     setShowLogModal]     = useState(false);
  const [showAbw,          setShowAbw]          = useState(false);
  const [showMortality,    setShowMortality]    = useState(false);
  const [showHarvest,      setShowHarvest]      = useState(false);

  const sd = sensorData || {};
  const b  = brain     || {};
  const fc = farmConfig || { thresholds: { doCrit: 4, tempMax: 32 }, species: "—", density: 0, size: 0 };

  // Sensor statuses
  const doStatus =
    !sd.do                          ? "idle"
    : sd.do < fc.thresholds?.doCrit ? "critical"
    : sd.do < 4.5                   ? "warn"
    : "ok";

  const amStatus =
    !sd.ammonia          ? "idle"
    : sd.ammonia > 0.3   ? "critical"
    : sd.ammonia > 0.1   ? "warn"
    : "ok";

  const tmpStatus =
    !sd.temp                             ? "idle"
    : sd.temp > fc.thresholds?.tempMax   ? "critical"
    : sd.temp > 30                       ? "warn"
    : "ok";

  const phStatus =
    !sd.ph       ? "idle"
    : sd.ph < 7  ? "warn"
    : sd.ph > 9  ? "warn"
    : "ok";

  // DOC — use real doc from context (calculated from stockingDate)
  const DOC = docCtx || fc.doc || 0;

  // Biomass — use real brain calculation
  const biomassKg = b.currentBiomassKg ? b.currentBiomassKg.toFixed(1) : "—";

  // Harvest countdown — use real target days from wizard
  const harvestDay    = fc.targetHarvestDays || 120;
  const daysLeft      = Math.max(0, harvestDay - DOC);
  const harvestPct    = Math.min(100, Math.round((DOC / harvestDay) * 100));

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#f8f9fa] min-h-full font-sans">

      {/* ── TOP BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <nav className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">
            Assets / Ponds / {sd.label || "—"}
          </nav>
          <h1 className="text-3xl font-light text-slate-800 tracking-tight">
            Dashboard: <span className="font-black text-slate-900">{sd.label || "No Pond Selected"}</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAbw(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Scale size={13} /> ABW Sample
          </button>
          <button
            onClick={() => setShowMortality(true)}
            className="flex items-center gap-2 bg-white border border-red-200 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors shadow-sm"
          >
            <AlertCircleIcon size={13} /> Mortality
          </button>
          <button
            onClick={() => addLog("Manual Inspection", "Operator")}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus size={13} /> Add Log
          </button>
          <button
            onClick={() => setShowHarvest(true)}
            className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-green-800 shadow-sm transition-colors"
          >
            <Zap size={13} /> Quick Action
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAbw       && <AbwSamplerModal        onClose={() => setShowAbw(false)} />}
      {showMortality && <MortalityModal          onClose={() => setShowMortality(false)} />}
      {showHarvest   && <CompleteHarvestModal    onClose={() => setShowHarvest(false)} />}

      {/* ── KPI STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Days of Culture"
          value={DOC}
          sub="DOC"
          icon={<Clock size={16} />}
          accent="blue"
        />
        <StatCard
          label="Biomass Est."
          value={biomassKg === "—" ? "—" : `${biomassKg} kg`}
          sub={fc.species || "—"}
          icon={<Fish size={16} />}
          accent="green"
        />
        <StatCard
          label="Harvest Countdown"
          value={`${daysLeft}d`}
          sub={`Day ${DOC} of ${harvestDay}`}
          icon={<Calendar size={16} />}
          accent="purple"
        />
        <StatCard
          label="Health Score"
          value={b.healthScore ?? "—"}
          sub={b.status || "—"}
          icon={<Activity size={16} />}
          accent={b.healthScore > 75 ? "green" : b.healthScore > 45 ? "amber" : "slate"}
        />
        <StatCard
          label="Projected Revenue"
          value={b.projectedRevenue ? `₹${b.projectedRevenue}L` : "—"}
          sub="Forecast"
          icon={<TrendingUp size={16} />}
          accent="green"
        />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: 8 cols */}
        <div className="lg:col-span-8 space-y-6">

          {/* LIVE SENSORS */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <SectionHeader
              icon={<Droplets size={15} className="text-blue-500" />}
              title="Live Sensor Observations"
              badge={
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-mono italic">Pulse Mode Active</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 font-black uppercase animate-pulse rounded-sm">
                    Synced
                  </span>
                </div>
              }
            />
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
              <SensorCard
                label="Dissolved Oxygen"
                value={sd.do}
                unit="mg/L"
                icon={<Wind size={13} className="text-blue-400" />}
                status={doStatus}
              />
              <SensorCard
                label="Ammonia"
                value={sd.ammonia}
                unit="ppm"
                icon={<FlaskConical size={13} className="text-purple-400" />}
                status={amStatus}
              />
              <SensorCard
                label="Temperature"
                value={sd.temp}
                unit="°C"
                icon={<Thermometer size={13} className="text-orange-400" />}
                status={tmpStatus}
              />
              <SensorCard
                label="pH Level"
                value={sd.ph}
                unit="pH"
                icon={<Droplets size={13} className="text-cyan-400" />}
                status={phStatus}
              />
            </div>
          </div>

          {/* FATHOM CORE LOGIC TABLE */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <SectionHeader
              icon={<ClipboardList size={15} className="text-indigo-500" />}
              title="Fathom_Core Logic Output"
            />
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] text-slate-500 font-black uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Module</th>
                  <th className="px-5 py-3">Status / Metric</th>
                  <th className="px-5 py-3">Core Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-700 text-sm">Health Monitor</td>
                  <td className="px-5 py-4"><StatusBadge status={b.status || "STABLE"} /></td>
                  <td className="px-5 py-4 text-slate-500 italic text-xs">
                    {b.alerts?.length > 0 ? (
                      <span className="flex items-center gap-2 text-red-600 font-bold not-italic">
                        <AlertTriangle size={13} /> {b.alerts[0]}
                      </span>
                    ) : "All parameters within safety thresholds."}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-700 text-sm">Feeding Advisor</td>
                  <td className="px-5 py-4">
                    <FeedBadge advice={b.feedingAdvice} />
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs font-medium">
                    Feed Efficiency: <span className="font-black text-slate-800">{fmt(b.feedEfficiency)}</span>
                    {" · "}Yield Loss Risk: <span className="font-black text-red-600">{fmt(b.yieldLossPrediction)}</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-700 text-sm">Financial Forecast</td>
                  <td className="px-5 py-4">
                    <span className="text-emerald-600 font-black text-lg tracking-tighter">
                      {b.projectedRevenue ? `₹${b.projectedRevenue}L` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs font-medium">
                    Survival Rate: <span className="font-black text-slate-800">{fmt(b.survivalProb)}%</span>
                    {" · "}FCR: <span className="font-black text-slate-800">{fmt(b.feedEfficiency)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* HARVEST PROGRESS BAR */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <SectionHeader
              icon={<Calendar size={15} className="text-purple-500" />}
              title="Harvest Timeline"
              badge={
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {daysLeft} days remaining
                </span>
              }
            />
            <div className="p-5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <span>Stock-in (Day 0)</span>
                <span className="text-green-700">Target Harvest (Day {harvestDay})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-green-500 to-green-700 rounded-full transition-all duration-700"
                  style={{ width: `${harvestPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                  {harvestPct}% complete
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  DOC {DOC} / {harvestDay}
                </span>
              </div>
            </div>
          </div>

          {/* SENSOR HISTORY CHARTS */}
          <SensorHistoryCharts />
        </div>

        {/* RIGHT: 4 cols */}
        <div className="lg:col-span-4 space-y-6">

          {/* WEATHER */}
          <WeatherWidget location={fc.location || ""} />

          {/* POND HEALTH SCORE */}
          <div className="bg-[#1e293b] text-white rounded-sm shadow-lg border-l-4 border-emerald-500 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Activity size={14} className="text-emerald-400" /> Pond Health Score
              </h3>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <HealthRing score={b.healthScore} />
                <div>
                  <p className="text-2xl font-light text-white tracking-tight">
                    {b.healthScore ?? "—"}<span className="text-sm text-slate-400">/100</span>
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${
                    b.healthScore > 75 ? "text-emerald-400"
                    : b.healthScore > 45 ? "text-amber-400"
                    : "text-red-400"
                  }`}>
                    {b.status || "Awaiting Data"}
                  </p>
                </div>
              </div>

              {/* Risk indicator */}
              <div className="space-y-2.5">
                {[
                  { label: "Risk Level",        value: b.riskLevel || "—" },
                  { label: "Species",            value: fc.species  || "—" },
                  { label: "Stock Density",      value: fc.density ? `${fc.density} / m²` : "—" },
                  { label: "Survival Probability", value: b.survivalProb ? `${b.survivalProb}%` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">{label}</span>
                    <span className="text-[11px] text-white font-black">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FEED SCHEDULE SUMMARY */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <SectionHeader
              icon={<Leaf size={15} className="text-green-600" />}
              title="Feed Schedule"
            />
            <div className="p-5 space-y-3">
              {[
                { time: "06:00", label: "Morning Feed",   status: "done" },
                { time: "10:00", label: "Mid-Morning",    status: "done" },
                { time: "14:00", label: "Afternoon Feed", status: "next" },
                { time: "18:00", label: "Evening Feed",   status: "upcoming" },
              ].map(({ time, label, status }) => (
                <div key={time} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    status === "done"     ? "bg-emerald-400"
                    : status === "next"  ? "bg-amber-400 animate-pulse"
                    : "bg-slate-200"
                  }`} />
                  <div className="flex-1 flex justify-between items-center">
                    <span className={`text-xs font-bold ${
                      status === "done" ? "text-slate-400 line-through" : "text-slate-700"
                    }`}>{label}</span>
                    <span className="text-[10px] font-black text-slate-400 tabular-nums">{time}</span>
                  </div>
                  {status === "next" && (
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 font-black uppercase rounded-sm">
                      Next
                    </span>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 mt-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Recommendation:
                </p>
                <div className="mt-1">
                  <FeedBadge advice={b.feedingAdvice || "Awaiting sensor data"} />
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVITY LOG */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <SectionHeader
              icon={<History size={15} className="text-slate-400" />}
              title="Activity Log"
              badge={<Settings size={13} className="text-slate-300 hover:rotate-90 transition-transform cursor-pointer" />}
            />
            <div className="p-5">
              {(!logs || logs.length === 0) ? (
                <div className="text-center py-6">
                  <History size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">No activity yet</p>
                  <p className="text-[9px] text-slate-300 mt-1">Click "Add Log" to record an event</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="group cursor-pointer border-l-2 border-transparent hover:border-green-500 pl-3 transition-all">
                      <p className="text-[11px] font-black text-slate-800 flex items-center justify-between group-hover:text-green-700">
                        {log.type} <ChevronRight size={11} className="text-slate-300 group-hover:text-green-500" />
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-0.5">
                        By {log.user || "Operator"} · {log.time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CYCLE HISTORY */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
              <TrendingUp size={13} className="text-emerald-600" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Cycle History</h3>
            </div>
            <div className="p-4">
              <CycleHistoryPanel />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}