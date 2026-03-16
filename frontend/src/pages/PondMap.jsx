import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePond } from "../context/PondContext";
import { analyzePond } from "../engine/farmBrain";
import PondComparison from "../components/ui/PondComparison";
import {
  Wind, Thermometer, Droplets, Plus, Fish, Clock,
  FlaskConical, Loader, X, AlertTriangle,
  ChevronRight, Activity, Layers, Download,
  Filter, Scale, Target, CheckCircle2,
  AlertCircle, MapPin, Zap
} from "lucide-react";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (v, fb = "—") =>
  v === undefined || v === null || v === "" ? fb : v;

const calcDOC = (sd) =>
  !sd ? 0 : Math.max(0, Math.floor((Date.now() - new Date(sd)) / 86400000));

function calcBiomass(p) {
  const fc = p.fishCount || 0;
  const sw = p.avgSeedWeight || 0.001;
  const sv = (p.survivalEstimate ?? 85) / 100;
  const doc = calcDOC(p.stockingDate);
  const tw = p.targetHarvestWeight || 20;
  const td = p.targetHarvestDays || 120;
  const dg = td > 0 ? (tw - sw) / td : 0;
  return ((fc * sv * Math.min(sw + dg * doc, tw)) / 1000).toFixed(1);
}

function getStatus(p) {
  return analyzePond(
    { do: p.do, temp: p.temp, ammonia: p.ammonia, ph: p.ph },
    {
      species: p.species, waterType: p.waterType,
      fishCount: p.fishCount, avgSeedWeight: p.avgSeedWeight,
      survivalEstimate: p.survivalEstimate,
      doc: calcDOC(p.stockingDate),
      targetHarvestWeight: p.targetHarvestWeight,
      targetHarvestDays: p.targetHarvestDays,
    }
  );
}

function calcHealth(p) {
  let s = 100;
  if (p.do < 3) s -= 40; else if (p.do < 4.5) s -= 20;
  if (p.ammonia > 0.5) s -= 35; else if (p.ammonia > 0.1) s -= 15;
  if (p.temp > 34) s -= 20; else if (p.temp > 32) s -= 10;
  if (p.ph < 6.5 || p.ph > 9.5) s -= 20; else if (p.ph < 7 || p.ph > 9) s -= 8;
  return Math.max(0, s);
}

/* ─── Status config ───────────────────────────────────────────────────────── */
const STATUS_CFG = {
  Optimal:  { badgeCls: "bg-emerald-50 text-emerald-700 border border-emerald-200",  bar: "#10b981", Icon: CheckCircle2 },
  Warning:  { badgeCls: "bg-amber-50 text-amber-700 border border-amber-200",        bar: "#f59e0b", Icon: AlertCircle  },
  Critical: { badgeCls: "bg-red-50 text-red-700 border border-red-200",              bar: "#ef4444", Icon: AlertTriangle },
};

/* ─── Add Pond Modal ──────────────────────────────────────────────────────── */
function AddModal({ onClose }) {
  const { createPond } = usePond();
  const [form, setForm] = useState({ label: "", species: "Vannamei", area: 1000, fishCount: 50000 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) { setError("Pond identifier is required."); return; }
    setLoading(true);
    try { await createPond(form); onClose(); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-5"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Fish size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">New Pond Unit</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Register for monitoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
              <span className="text-[13px] text-red-700 font-medium">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Pond Name / ID
            </label>
            <input
              autoFocus
              value={form.label}
              onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
              placeholder="e.g. Pond A1"
              className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm
                text-slate-900 placeholder:text-slate-400 outline-none
                focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              Species
            </label>
            <select
              value={form.species}
              onChange={e => setForm(p => ({ ...p, species: e.target.value }))}
              className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm
                text-slate-900 outline-none focus:border-emerald-500 focus:ring-2
                focus:ring-emerald-100 focus:bg-white transition-all"
            >
              {["Vannamei","Monodon","Tilapia","Catfish","Rohu","Milkfish"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Area (m²)
              </label>
              <input
                type="number"
                value={form.area}
                onChange={e => setForm(p => ({ ...p, area: +e.target.value }))}
                className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm
                  text-slate-900 outline-none focus:border-emerald-500 focus:ring-2
                  focus:ring-emerald-100 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Stock Count
              </label>
              <input
                type="number"
                value={form.fishCount}
                onChange={e => setForm(p => ({ ...p, fishCount: +e.target.value }))}
                className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-sm
                  text-slate-900 outline-none focus:border-emerald-500 focus:ring-2
                  focus:ring-emerald-100 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-[11px] font-black
                uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60
                text-white rounded-lg text-[11px] font-black uppercase tracking-widest
                flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading
                ? <><Loader size={12} className="animate-spin" /> Deploying…</>
                : <><Fish size={12} /> Deploy Pond</>
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Pond Card ───────────────────────────────────────────────────────────── */
function PondCard({ pond, isActive, onSelect }) {
  const brain  = getStatus(pond);
  const doc    = calcDOC(pond.stockingDate);
  const biomass = calcBiomass(pond);
  const daysLeft = Math.max(0, (pond.targetHarvestDays || 120) - doc);
  const pct   = Math.min(100, Math.round((doc / (pond.targetHarvestDays || 120)) * 100));
  const sc    = STATUS_CFG[brain.status] || STATUS_CFG.Optimal;

  const sensors = [
    { key: "DO",   val: pond.do,      Icon: Wind,         warn: pond.do < 4.5 },
    { key: "TEMP", val: pond.temp,    Icon: Thermometer,  warn: pond.temp > 32 },
    { key: "PH",   val: pond.ph,      Icon: Droplets,     warn: pond.ph < 7 || pond.ph > 9 },
    { key: "NH₃",  val: pond.ammonia, Icon: FlaskConical, warn: pond.ammonia > 0.1 },
  ];

  const borderCls = brain.status === "Critical"
    ? "border-red-300"
    : brain.status === "Warning"
    ? "border-amber-300"
    : isActive
    ? "border-emerald-400 ring-2 ring-emerald-100"
    : "border-slate-200";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(pond)}
      className={`bg-white rounded-xl border ${borderCls} overflow-hidden cursor-pointer
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`}
    >
      {/* Status bar */}
      <div className="h-0.5" style={{ background: sc.bar }} />

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {fmt(pond.species, "—")} · {fmt(pond.cultureType, "Semi-Intensive")}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                {pond.label}
              </h3>
              {isActive && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase
                  tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200
                  px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase
            tracking-wide px-2 py-1 rounded-full ${sc.badgeCls}`}>
            <sc.Icon size={9} />
            {brain.status}
          </span>
        </div>

        {/* Sensor tiles */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {sensors.map(({ key, val, Icon, warn }) => (
            <div
              key={key}
              className={`rounded-lg p-2 text-center ${
                warn
                  ? "bg-red-50 border border-red-100"
                  : "bg-slate-50 border border-slate-100"
              }`}
            >
              <Icon
                size={11}
                className={`mx-auto mb-1 ${warn ? "text-red-500" : "text-slate-400"}`}
              />
              <p className={`font-black text-sm leading-none mb-1 ${warn ? "text-red-600" : "text-slate-900"}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                {fmt(val, "—")}
              </p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{key}</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-2.5 mb-2.5 border-t border-slate-100">
          {[
            [Clock,  `DOC ${doc}d`],
            [Scale,  `${biomass} kg`],
            [Target, `${daysLeft}d left`],
          ].map(([Icon, lbl]) => (
            <div key={lbl} className="flex items-center gap-1">
              <Icon size={10} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                {lbl}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Harvest Progress
            </span>
            <span className="text-[10px] font-black text-emerald-600">{pct}%</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct > 80 ? "#10b981" : pct > 50 ? "#3b82f6" : "#94a3b8",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-slate-400" style={{ fontFamily: "'DM Mono', monospace" }}>
              Day {doc}
            </span>
            <span className="text-[9px] text-slate-400" style={{ fontFamily: "'DM Mono', monospace" }}>
              Day {pond.targetHarvestDays || 120}
            </span>
          </div>
        </div>

        {/* Alert strip */}
        {brain.alerts?.length > 0 && (
          <div className="mt-2.5 flex items-start gap-2 p-2 bg-red-50 border border-red-100 rounded-lg">
            <AlertTriangle size={11} className="text-red-500 shrink-0 mt-0.5" />
            <span className="text-[11px] font-black text-red-700 leading-snug">
              {brain.alerts[0]}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── KPI Row ─────────────────────────────────────────────────────────────── */
function KpiRow({ pond }) {
  if (!pond) return null;

  const doc     = calcDOC(pond.stockingDate);
  const biomass = calcBiomass(pond);
  const daysLeft = Math.max(0, (pond.targetHarvestDays || 120) - doc);
  const health  = calcHealth(pond);
  const revenue = (parseFloat(biomass) * (pond.targetSellPrice || 350)).toLocaleString("en-IN");

  const cards = [
    {
      title: "Days of Culture",
      value: doc,
      sub: "DOC",
      bg: "bg-blue-50",
      border: "border-blue-100",
      valCls: "text-blue-700",
    },
    {
      title: "Biomass Est.",
      value: `${biomass} kg`,
      sub: pond.species || "Vannamei",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      valCls: "text-emerald-700",
    },
    {
      title: "Harvest Countdown",
      value: `${daysLeft}d`,
      sub: `Day ${doc} of ${pond.targetHarvestDays || 120}`,
      bg: "bg-purple-50",
      border: "border-purple-100",
      valCls: "text-purple-700",
    },
    {
      title: "Health Score",
      value: health,
      sub: "Optimal",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      valCls: "text-emerald-700",
    },
    {
      title: "Projected Revenue",
      value: `₹${revenue}`,
      sub: "Forecast",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      valCls: "text-emerald-700",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`${c.bg} border ${c.border} rounded-xl p-4`}
        >
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            {c.title}
          </p>
          <p className={`text-2xl font-black ${c.valCls} leading-none mb-1`}>
            {c.value}
          </p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            {c.sub}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Live Sensor Row ─────────────────────────────────────────────────────── */
function SensorDash({ pond }) {
  if (!pond) return null;

  const sensors = [
    { label: "Dissolved Oxygen", value: pond.do,      unit: "mg/L", dot: "bg-blue-500" },
    { label: "Ammonia",          value: pond.ammonia,  unit: "ppm",  dot: "bg-purple-500" },
    { label: "Temperature",      value: pond.temp,     unit: "°C",   dot: "bg-orange-400" },
    { label: "PH Level",         value: pond.ph,       unit: "pH",   dot: "bg-cyan-500" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-emerald-600" />
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
            Live Sensor Observations
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Synced</span>
        </div>
      </div>

      <div className="grid grid-cols-4 divide-x divide-slate-100">
        {sensors.map((s) => (
          <div key={s.label} className="px-4 first:pl-0 last:pr-0">
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {s.label}
              </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl font-black text-slate-900 leading-none"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {fmt(s.value, "—")}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Pond Health Panel ───────────────────────────────────────────────────── */
function PondHealthPanel({ pond }) {
  if (!pond) return null;
  const health = calcHealth(pond);
  const radius = 30;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (health / 100) * circ;

  return (
    <div className="bg-slate-900 rounded-xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Activity size={13} className="text-emerald-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Pond Health Score
        </span>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#1e293b" strokeWidth="5" />
          <circle
            cx="36" cy="36" r={radius}
            fill="none" stroke="#10b981" strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
          />
        </svg>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-white leading-none">{health}</span>
            <span className="text-base text-slate-500 font-medium">/100</span>
          </div>
          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mt-1">
            Optimal
          </p>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-slate-800 pt-4">
        {[
          ["Risk Level",          "Low"],
          ["Species",             pond.species || "—"],
          ["Stock Density",       "35 / m²"],
          ["Survival Probability","100%"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{k}</span>
            <span className="text-[11px] font-black text-white">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Live Ticker ─────────────────────────────────────────────────────────── */
function Ticker({ ponds }) {
  if (!ponds.length) return null;

  const items = ponds.flatMap(p => [
    `${p.label}  ·  DO ${fmt(p.do, "?")} mg/L`,
    `${p.label}  ·  TEMP ${fmt(p.temp, "?")}°C`,
    `${p.label}  ·  pH ${fmt(p.ph, "?")}`,
    `${p.label}  ·  NH₃ ${fmt(p.ammonia, "?")} ppm`,
  ]);
  const doubled = [...items, ...items];

  return (
    <div className="bg-slate-900 overflow-hidden flex items-stretch">
      <div className="flex items-center gap-2 px-4 border-r border-slate-700 shrink-0 py-1.5">
        <Activity size={9} className="text-emerald-400" />
        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div
          className="flex gap-10 whitespace-nowrap w-max py-1.5"
          style={{ animation: "ticker 30s linear infinite" }}
        >
          {doubled.map((t, i) => (
            <span
              key={i}
              className="text-[11px] font-black text-slate-400 uppercase tracking-wide"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* ─── Spatial Map ─────────────────────────────────────────────────────────── */
function SpatialMap({ activePond }) {
  const [heatmap, setHeatmap] = useState(false);
  const p = activePond || {};
  const fv = (v, fb = "—") => (v === null || v === undefined || v === "") ? fb : v;

  const doCol = p.do < 4.5      ? "#ef4444" : "#3b82f6";
  const tCol  = p.temp > 32     ? "#ef4444" : "#f97316";
  const nhCol = p.ammonia > 0.1 ? "#ef4444" : "#8b5cf6";
  const status = (p.do < 3 || p.ammonia > 0.5) ? "CRITICAL"
               : (p.do < 4.5 || p.ammonia > 0.1) ? "WARNING"
               : "OPTIMAL";
  const sc = status === "OPTIMAL" ? "#10b981" : status === "WARNING" ? "#f59e0b" : "#ef4444";

  const doBar = Math.min(100, ((p.do || 0) / 10) * 100);
  const tBar  = Math.min(100, ((p.temp || 0) / 40) * 100);
  const phBar = Math.min(100, ((p.ph || 0) / 14) * 100);
  const nhBar = Math.min(100, ((p.ammonia || 0)) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Map toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className="text-[10px] font-black text-emerald-600 uppercase tracking-widest"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Vantage · Spatial Command
            </span>
          </div>
          <span
            className="text-[10px] text-slate-400 uppercase"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {p.label || "No Unit"} · {p.location || "Aquafarm"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHeatmap(h => !h)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px]
              font-black uppercase tracking-widest transition-colors
              ${heatmap
                ? "bg-orange-50 border-orange-200 text-orange-600"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
              }`}
          >
            <Layers size={10} />
            {heatmap ? "Heatmap ON" : "Heatmap"}
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200
              bg-slate-50 text-slate-500 hover:bg-slate-100 text-[10px] font-black uppercase
              tracking-widest transition-colors"
          >
            <Download size={10} />
            Export
          </button>
        </div>
      </div>

      {/* SVG Map */}
      <svg width="100%" viewBox="0 0 960 520" style={{ display: "block" }}>
        <defs>
          <pattern id="gf3" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0L0 0 0 24" fill="none" stroke="#e8ecf0" strokeWidth="0.5" />
          </pattern>
          <pattern id="gc3" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M120 0L0 0 0 120" fill="none" stroke="#d1d9e0" strokeWidth="0.8" />
          </pattern>
          <radialGradient id="pg3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0f5ee" stopOpacity="1" />
            <stop offset="100%" stopColor="#c8edd8" stopOpacity="1" />
          </radialGradient>
          <filter id="g3">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="tpanel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e2d3d" />
            <stop offset="100%" stopColor="#162435" />
          </linearGradient>
          {heatmap && (
            <>
              <radialGradient id="h1w"><stop offset="0%" stopColor="#3b82f6" stopOpacity=".22" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></radialGradient>
              <radialGradient id="h2w"><stop offset="0%" stopColor="#f97316" stopOpacity=".22" /><stop offset="100%" stopColor="#f97316" stopOpacity="0" /></radialGradient>
              <radialGradient id="h3w"><stop offset="0%" stopColor="#06b6d4" stopOpacity=".22" /><stop offset="100%" stopColor="#06b6d4" stopOpacity="0" /></radialGradient>
              <radialGradient id="h4w"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".22" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></radialGradient>
            </>
          )}
        </defs>

        <rect width="960" height="520" fill="#ffffff" />
        <rect width="960" height="520" fill="url(#gf3)" />
        <rect width="960" height="520" fill="url(#gc3)" />
        <ellipse cx="454" cy="270" rx="320" ry="210" fill="#10b981" opacity=".03" />

        <polygon
          points="200,105 700,105 745,148 760,270 740,415 670,455 240,455 165,415 148,278 168,148"
          fill="url(#pg3)" stroke="#10b981" strokeWidth="2" strokeOpacity=".5" filter="url(#g3)"
        />
        <polygon
          points="214,120 686,120 728,158 742,270 724,408 660,443 250,443 180,408 162,278 183,158"
          fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="8,8" strokeOpacity=".25"
        />

        {[130,165,198,232,265,298].map((y, i) => (
          <path key={y}
            d={`M${188 + i * 2},${y + 102} Q454,${y + 88} ${738 - i * 2},${y + 102}`}
            fill="none" stroke="#a7ddc5" strokeWidth="1" opacity={0.6 - i * 0.08}
          />
        ))}

        <text x="454" y="272" textAnchor="middle" fill="#4aad7a" fontSize="11" fontFamily="'DM Mono',monospace" fontWeight="600" letterSpacing=".2em">
          {(p.pondType || "EARTHEN").toUpperCase()} CULTURE UNIT
        </text>
        <text x="454" y="290" textAnchor="middle" fill="#5db888" fontSize="8.5" fontFamily="'DM Mono',monospace" letterSpacing=".1em">
          {(p.species || "VANNAMEI").toUpperCase()} · {(p.cultureType || "SEMI-INTENSIVE").toUpperCase()}
        </text>

        {heatmap && (
          <>
            <ellipse cx="285" cy="188" rx="130" ry="98" fill="url(#h1w)" />
            <ellipse cx="620" cy="188" rx="118" ry="95" fill="url(#h4w)" />
            <ellipse cx="370" cy="375" rx="125" ry="92" fill="url(#h3w)" />
            <ellipse cx="580" cy="368" rx="115" ry="88" fill="url(#h2w)" />
          </>
        )}

        <g stroke="#c8e8d8" strokeWidth=".8" strokeDasharray="6,6" opacity=".7">
          {[[285,188,620,188,3],[285,188,370,375,3.5],[620,188,580,368,4],[370,375,580,368,2.8],[285,188,580,368,4.2],[620,188,370,375,3.3]].map(([x1,y1,x2,y2,d],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}>
              <animate attributeName="stroke-dashoffset" from="0" to="-80" dur={`${d}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>

        {[[318,230,"A-01"],[578,238,"A-02"],[448,320,"A-03"],[448,198,"A-04"]].slice(0, p.numAerators || 4).map(([cx,cy,lbl]) => (
          <g key={lbl} transform={`translate(${cx},${cy})`}>
            {[18,30].map((r, i) => (
              <circle key={r} r={r} fill="none" stroke="#10b981" strokeWidth=".6" opacity=".15">
                <animate attributeName="r" values={`5;${r + 6}`} dur={`${1.8 + i * .5}s`} begin={`${i * .4}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values=".4;0" dur={`${1.8 + i * .5}s`} begin={`${i * .4}s`} repeatCount="indefinite" />
              </circle>
            ))}
            <circle r="12" fill="#edfaf4" stroke="#10b981" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,.25))" }} />
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.5s" repeatCount="indefinite" />
              {["M-3,-6 L0,-2 L3,-6","M-3,6 L0,2 L3,6","M-6,-3 L-2,0 L-6,3","M6,-3 L2,0 L6,3"].map((d, i) => (
                <path key={i} d={d} fill="none" stroke="#10b981" strokeWidth="1.3" strokeLinecap="round" />
              ))}
            </g>
            <text y="22" textAnchor="middle" fill="#065f46" fontSize="7" fontFamily="'DM Mono',monospace" fontWeight="600">{lbl}</text>
          </g>
        ))}

        {/* Inlet / outlet */}
        <g transform="translate(148,282)">
          <rect x="-22" y="-13" width="44" height="26" rx="4" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.2" />
          <polygon points="-7,-6 5,0 -7,6" fill="#3b82f6" opacity=".85" />
          <text x="7" y="4" fill="#3b82f6" fontSize="7" fontFamily="'DM Mono',monospace" fontWeight="700">IN</text>
          <text y="21" textAnchor="middle" fill="#2563eb" fontSize="6" fontFamily="'DM Mono',monospace" opacity=".7">
            {(p.waterSource || "BORE").slice(0, 6).toUpperCase()}
          </text>
        </g>
        <g transform="translate(758,282)">
          <rect x="-22" y="-13" width="44" height="26" rx="4" fill="#fff7ed" stroke="#f97316" strokeWidth="1.2" />
          <polygon points="7,-6 -5,0 7,6" fill="#f97316" opacity=".85" />
          <text x="-18" y="4" fill="#f97316" fontSize="7" fontFamily="'DM Mono',monospace" fontWeight="700">OUT</text>
        </g>

        {/* Sensor nodes */}
        {[
          { cx:285, cy:188, c:doCol,    bg:"#eff6ff", tc:"#1d4ed8", v:fv(p.do,"—"),      u:"mg/L", l:"DISS·O₂" },
          { cx:620, cy:188, c:nhCol,    bg:"#f5f3ff", tc:"#6d28d9", v:fv(p.ammonia,"—"), u:"ppm",  l:"AMMONIA"  },
          { cx:370, cy:375, c:"#06b6d4",bg:"#ecfeff", tc:"#0e7490", v:fv(p.ph,"—"),      u:"pH",   l:"PH·LVL"   },
          { cx:580, cy:368, c:tCol,     bg:"#fff7ed", tc:"#c2410c", v:fv(p.temp,"—"),    u:"°C",   l:"TEMP"     },
        ].map(({ cx, cy, c, bg, tc, v, u, l }, i) => (
          <g key={l} transform={`translate(${cx},${cy})`}>
            {[26,40].map((r, ri) => (
              <circle key={r} r={r} fill="none" stroke={c} strokeWidth=".8" opacity=".15">
                <animate attributeName="r" values={`8;${r}`} dur={`${2 + i * .2 + ri * .4}s`} begin={`${ri * .3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values=".4;0" dur={`${2 + i * .2 + ri * .4}s`} begin={`${ri * .3}s`} repeatCount="indefinite" />
              </circle>
            ))}
            <circle r="22" fill={bg} stroke={c} strokeWidth="2" style={{ filter: `drop-shadow(0 0 6px ${c}44)` }} />
            <circle r="16" fill="none" stroke={c} strokeWidth=".6" strokeDasharray="3,3" opacity=".4">
              <animateTransform attributeName="transform" type="rotate" from="0" to={i % 2 === 0 ? "360" : "-360"} dur="12s" repeatCount="indefinite" />
            </circle>
            <text y="-1" textAnchor="middle" fill={tc} fontSize="11" fontFamily="'DM Mono',monospace" fontWeight="700">{v}</text>
            <text y="9" textAnchor="middle" fill={c} fontSize="6.5" fontFamily="'DM Mono',monospace" opacity=".6">{u}</text>
            <rect x="-26" y="27" width="52" height="15" rx="4" fill={bg} stroke={c} strokeWidth=".8" strokeOpacity=".6" />
            <text y="37" textAnchor="middle" fill={c} fontSize="6.5" fontFamily="'DM Mono',monospace" fontWeight="700" letterSpacing=".08em">{l}</text>
          </g>
        ))}

        {/* Telemetry panel */}
        <rect x="800" y="108" width="148" height="304" rx="6" fill="url(#tpanel)" stroke="#2a3d52" strokeWidth="1" />
        <rect x="800" y="108" width="148" height="28" rx="6" fill="#243447" />
        <text x="874" y="126" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="'DM Mono',monospace" fontWeight="600" letterSpacing=".16em">TELEMETRY</text>
        <line x1="808" y1="136" x2="940" y2="136" stroke="#2a3d52" strokeWidth="1" />

        {[
          { l:"DO",   v:`${fv(p.do,"—")} mg/L`,    c:"#93c5fd", bar:doBar, bc:"#3b82f6" },
          { l:"TEMP", v:`${fv(p.temp,"—")} °C`,     c:"#fdba74", bar:tBar,  bc:"#f97316" },
          { l:"pH",   v:`${fv(p.ph,"—")} pH`,       c:"#67e8f9", bar:phBar, bc:"#06b6d4" },
          { l:"NH₃",  v:`${fv(p.ammonia,"—")} ppm`, c:"#c4b5fd", bar:nhBar, bc:nhCol    },
        ].map(({ l, v, c, bar, bc }, i) => (
          <g key={l}>
            <text x="808" y={152 + i * 26} fill="rgba(255,255,255,.3)" fontSize="7" fontFamily="'DM Mono',monospace">{l}</text>
            <text x="940" y={152 + i * 26} textAnchor="end" fill={c} fontSize="9" fontFamily="'DM Mono',monospace" fontWeight="600">{v}</text>
            <rect x="808" y={156 + i * 26} width="68" height="2" rx="1" fill="rgba(255,255,255,.06)" />
            <rect x="808" y={156 + i * 26} width={Math.max(2, bar * .68)} height="2" rx="1" fill={bc} style={{ filter:`drop-shadow(0 0 3px ${bc})` }} />
          </g>
        ))}

        <line x1="808" y1="265" x2="940" y2="265" stroke="#2a3d52" strokeWidth="1" />
        {[
          { l:"DOC",      v:`${calcDOC(p.stockingDate)}d` },
          { l:"BIOMASS",  v:`${calcBiomass(p)} kg` },
          { l:"AERATORS", v:`${p.numAerators || 4}` },
          { l:"SURVIVAL", v:`${p.survivalEstimate || 85}%` },
        ].map(({ l, v }, i) => (
          <g key={l}>
            <text x="808" y={278 + i * 18} fill="rgba(255,255,255,.28)" fontSize="7" fontFamily="'DM Mono',monospace">{l}</text>
            <text x="940" y={278 + i * 18} textAnchor="end" fill="#10b981" fontSize="8" fontFamily="'DM Mono',monospace" fontWeight="600">{v}</text>
          </g>
        ))}

        <line x1="808" y1="355" x2="940" y2="355" stroke="#2a3d52" strokeWidth="1" />
        <rect x="808" y="362" width="124" height="18" rx="4" fill="#162435" stroke={sc} strokeWidth=".8" />
        <text x="870" y="374" textAnchor="middle" fill={sc} fontSize="7.5" fontFamily="'DM Mono',monospace" fontWeight="700" letterSpacing=".12em">
          ■ {status}
        </text>
        <text x="808" y="395" fill="#10b981" fontSize="7" fontFamily="'DM Mono',monospace">
          ● {status === "OPTIMAL" ? "ALL NODES NOMINAL" : "ALERT ACTIVE"}
        </text>

        {/* Bottom info tags */}
        {[
          { x:22,  w:192, label:"LOCATION",    val: p.location || "Not configured" },
          { x:228, w:192, label:"DEPTH",        val:`${fv(p.depthMin,"—")} – ${fv(p.depthMax,"—")} m` },
          { x:434, w:192, label:"WATER SOURCE", val: p.waterSource || "—" },
        ].map(({ x, w, label, val }) => (
          <g key={label}>
            <rect x={x} y="476" width={w} height="28" rx="4" fill="#ffffff" stroke="#d1d9e0" strokeWidth=".8" />
            <text x={x + 8} y="488" fill="#94a3b8" fontSize="7" fontFamily="'DM Mono',monospace" letterSpacing=".1em">{label}</text>
            <text x={x + 8} y="499" fill="#334155" fontSize="8" fontFamily="'DM Mono',monospace" fontWeight="600">{val}</text>
          </g>
        ))}

        {/* Compass */}
        <g transform="translate(50,50)">
          <circle r="22" fill="#ffffff" stroke="#d1d9e0" strokeWidth="1.5" style={{ filter:"drop-shadow(0 2px 4px rgba(0,0,0,.08))" }} />
          <line x1="0" y1="-13" x2="0" y2="13" stroke="#e2e8f0" strokeWidth=".8" />
          <line x1="-13" y1="0" x2="13" y2="0" stroke="#e2e8f0" strokeWidth=".8" />
          <polygon points="0,-13 3,-4 -3,-4" fill="#ef4444" />
          <polygon points="0,13 3,4 -3,4" fill="#cbd5e1" />
          <text y="-16" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="'DM Mono',monospace" fontWeight="700">N</text>
        </g>

        {/* Scale */}
        <g transform="translate(695,484)">
          <line x1="0" y1="8" x2="55" y2="8" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="0" y1="5" x2="0" y2="11" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="55" y1="5" x2="55" y2="11" stroke="#94a3b8" strokeWidth="1.2" />
          <text x="27" y="4" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="'DM Mono',monospace">50 m</text>
        </g>
      </svg>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function PondMap() {
  const { ponds, activePond, switchPond } = usePond();
  const [showModal, setShowModal] = useState(false);
  const [view,      setView]      = useState("grid");
  const [time,      setTime]      = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const counts = ponds.reduce((acc, p) => {
    const s = getStatus(p).status;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const ts = time.toLocaleTimeString("en-GB", { hour12: false });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Live Ticker */}
      <Ticker ponds={ponds} />

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-7 pt-5 pb-0">

          {/* Breadcrumb + title row */}
          <div className="flex items-start justify-between pb-5">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 mb-2">
                {["Assets", "Ponds", "Pond Map"].map((seg, i, arr) => (
                  <React.Fragment key={seg}>
                    <span className={`text-[11px] font-bold ${i === arr.length - 1 ? "text-slate-700" : "text-slate-400"}`}>
                      {seg}
                    </span>
                    {i < arr.length - 1 && (
                      <ChevronRight size={10} className="text-slate-300" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {/* Title */}
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Pond Map
                </h1>
                <span className="text-sm text-slate-400 font-medium">
                  {ponds.length} unit{ponds.length !== 1 ? "s" : ""} registered
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-1">
              <span
                className="text-[11px] text-slate-400 font-medium"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {ts}
              </span>

              {/* View toggle */}
              <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
                {[["grid","Grid"],["map","Map"]].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3.5 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest
                      transition-all ${view === v
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <button className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl
                text-[11px] font-black uppercase tracking-widest text-slate-600 bg-white
                hover:bg-slate-50 transition-colors">
                <Filter size={12} /> Filter
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl
                text-[11px] font-black uppercase tracking-widest text-slate-600 bg-white
                hover:bg-slate-50 transition-colors">
                <Download size={12} /> Export
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800
                  text-white rounded-xl text-[11px] font-black uppercase tracking-widest
                  transition-colors shadow-sm shadow-emerald-900/20"
              >
                <Plus size={13} /> New Pond
              </button>
            </div>
          </div>

          {/* Fleet status strip */}
          <div className="flex items-stretch border-t border-slate-100 -mx-7">
            {/* Total */}
            <div className="flex items-center gap-3 px-7 py-3 border-r border-slate-100">
              <span className="text-2xl font-black text-slate-900 leading-none">{ponds.length}</span>
              <div className="leading-tight">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Units</p>
              </div>
            </div>

            {/* Optimal */}
            <div className="flex items-center gap-3 px-6 py-3 border-r border-slate-100 bg-emerald-50 border-t-2 border-t-emerald-500">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span className="text-2xl font-black text-emerald-700 leading-none">{counts.Optimal || 0}</span>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Optimal</p>
            </div>

            {/* Warning */}
            <div className="flex items-center gap-3 px-6 py-3 border-r border-slate-100 bg-amber-50 border-t-2 border-t-amber-400">
              <AlertCircle size={15} className="text-amber-500 shrink-0" />
              <span className="text-2xl font-black text-amber-700 leading-none">{counts.Warning || 0}</span>
              <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Warning</p>
            </div>

            {/* Critical */}
            <div className="flex items-center gap-3 px-6 py-3 border-r border-slate-100 bg-red-50 border-t-2 border-t-red-500">
              <AlertTriangle size={15} className="text-red-500 shrink-0" />
              <span className="text-2xl font-black text-red-700 leading-none">{counts.Critical || 0}</span>
              <p className="text-[9px] font-black text-red-700 uppercase tracking-widest">Critical</p>
            </div>

            <div className="flex-1" />

            {/* Live badge */}
            <div className="flex items-center gap-2 px-7 border-l border-slate-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                Live Telemetry
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Content ── */}
      <div className="px-7 py-7 pb-16 space-y-6">

        {/* KPI row for active pond */}
        {activePond && <KpiRow pond={activePond} />}

        {/* Empty state */}
        {ponds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-xl p-20 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Fish size={24} className="text-emerald-600" />
            </div>
            <p className="text-lg font-black text-slate-700 mb-2">No pond units registered</p>
            <p className="text-sm text-slate-400 mb-6">
              Deploy your first culture unit to start live monitoring
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800
                text-white rounded-xl text-[11px] font-black uppercase tracking-widest
                transition-colors shadow-sm"
            >
              <Plus size={13} /> Deploy First Unit
            </button>
          </motion.div>
        ) : (
          <>
            {/* Pond Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <AnimatePresence>
                {ponds.map((pond, i) => (
                  <motion.div
                    key={pond._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PondCard
                      pond={pond}
                      isActive={activePond?._id === pond._id}
                      onSelect={switchPond}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Sensor dash + Health panel */}
            {activePond && (
              <div className="grid grid-cols-[1fr_260px] gap-5">
                <SensorDash pond={activePond} />
                <PondHealthPanel pond={activePond} />
              </div>
            )}
          </>
        )}

        {/* Spatial Map */}
        <SpatialMap activePond={activePond} />

        {/* Pond Comparison */}
        {ponds.length >= 2 && <PondComparison ponds={ponds} />}
      </div>

      {/* Add Pond Modal */}
      <AnimatePresence>
        {showModal && <AddModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}