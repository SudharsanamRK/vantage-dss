import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { usePond } from "../context/PondContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, Wind, FlaskConical, Activity, IndianRupee,
  Zap, ClipboardList, TrendingUp, Star, Download,
  Search, Plus, X, ChevronDown, ChevronUp, BookOpen,
  Trash2, Leaf, Clock, CheckCircle2,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = "fathom_logbook_v2";
const STARRED_KEY = "fathom_logbook_starred_v2";

const CATEGORIES = {
  "Water Quality": { color:"bg-blue-600",    light:"bg-blue-50 border-blue-200",       text:"text-blue-700",    dot:"bg-blue-500",    icon:Droplets     },
  "Feeding":       { color:"bg-emerald-600", light:"bg-emerald-50 border-emerald-200", text:"text-emerald-700", dot:"bg-emerald-500", icon:Leaf         },
  "Health":        { color:"bg-red-500",     light:"bg-red-50 border-red-200",         text:"text-red-700",     dot:"bg-red-500",     icon:Activity     },
  "Economics":     { color:"bg-amber-500",   light:"bg-amber-50 border-amber-200",     text:"text-amber-700",   dot:"bg-amber-400",   icon:IndianRupee  },
  "Harvest":       { color:"bg-orange-500",  light:"bg-orange-50 border-orange-200",   text:"text-orange-700",  dot:"bg-orange-500",  icon:TrendingUp   },
  "Maintenance":   { color:"bg-slate-500",   light:"bg-slate-50 border-slate-200",     text:"text-slate-600",   dot:"bg-slate-400",   icon:ClipboardList},
  "System":        { color:"bg-violet-500",  light:"bg-violet-50 border-violet-200",   text:"text-violet-700",  dot:"bg-violet-400",  icon:Zap          },
};

const STATUS_CFG = {
  Optimal:  { cls:"bg-green-100  text-green-800  border-green-300"  },
  Warning:  { cls:"bg-amber-100  text-amber-800  border-amber-300"  },
  Critical: { cls:"bg-red-100    text-red-800    border-red-300"    },
  Verified: { cls:"bg-blue-100   text-blue-800   border-blue-300"   },
  Info:     { cls:"bg-slate-100  text-slate-700  border-slate-300"  },
  Auto:     { cls:"bg-violet-100 text-violet-800 border-violet-300" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt      = (v, fb = "—") => (v == null || v === "") ? fb : v;
const nowTime  = () => new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
const todayFmt = () => new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
const todayISO = () => new Date().toISOString().split("T")[0];

function classifyLog(log) {
  const t = (log.type || "").toLowerCase();
  if (t.includes("feed") || t.includes("ration"))                                          return "Feeding";
  if (t.includes("do") || t.includes("oxygen") || t.includes("water") ||
      t.includes("ph") || t.includes("ammonia") || t.includes("temp"))                    return "Water Quality";
  if (t.includes("health") || t.includes("alert") || t.includes("intervention") ||
      t.includes("aeration") || t.includes("mortality"))                                   return "Health";
  if (t.includes("harvest") || t.includes("biomass"))                                     return "Harvest";
  if (t.includes("cost") || t.includes("economic") || t.includes("revenue"))             return "Economics";
  if (t.includes("task") || t.includes("sample") || t.includes("inspect") ||
      t.includes("maintenance"))                                                            return "Maintenance";
  return "System";
}

// ─── localStorage ──────────────────────────────────────────────────────────────
const loadLS = (key, fb) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const saveLS = (key, v)  => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} };

// ─── Build system entries ──────────────────────────────────────────────────────
function buildSystemEntries(logs, brain, sensorData, activePond, doc) {
  const sd = sensorData || {};
  const b  = brain      || {};
  const time = nowTime(), date = todayFmt(), iso = todayISO();
  const pond = activePond?.label || "—";
  const out  = [];

  out.push({ id:"SYS-WQ", iso, date, time, category:"Water Quality", title:"Water quality snapshot",
    details:`DO: ${fmt(sd.do)} mg/L · Temp: ${fmt(sd.temp)}°C · pH: ${fmt(sd.ph)} · NH₃: ${fmt(sd.ammonia)} ppm · Salinity: ${fmt(sd.salinity)} ppt`,
    pond, user:"Vantage DSS", status:"Auto", source:"auto", starred:false });

  if (doc > 0) out.push({ id:"SYS-DOC", iso, date, time:"06:00 AM", category:"System", title:`Day ${doc} of culture`,
    details:`Biomass: ${fmt(b.currentBiomassKg)} kg · Avg weight: ${fmt(b.currentAvgWeight)}g · Survival: ${fmt(b.survivalProb)}% · Health: ${fmt(b.healthScore)}/100`,
    pond, user:"Vantage DSS", status:"Info", source:"auto", starred:false });

  (b.alerts || []).forEach((a, i) => out.push({ id:`SYS-ALT-${i}`, iso, date, time, category:"Health",
    title:"System alert", details:a, pond, user:"Vantage DSS", status:"Critical", source:"auto", starred:true }));

  (b.warnings || []).forEach((w, i) => out.push({ id:`SYS-WRN-${i}`, iso, date, time, category:"Health",
    title: typeof w === "string" ? w : (w.message || "Warning"),
    details: typeof w === "string" ? "" : (w.advice || ""),
    pond, user:"Vantage DSS", status:"Warning", source:"auto", starred:false }));

  (logs || []).forEach((log, i) => out.push({ id:`CTX-${i}`, iso, date, time: log.time || time,
    category: classifyLog(log), title: log.type || "Log entry",
    details: log.user ? `Logged by ${log.user}` : "",
    pond, user: log.user || "Operator", status:"Verified", source:"operator", starred:false }));

  return out;
}

// ─── CSV Export ────────────────────────────────────────────────────────────────
function doExport(entries, pondLabel) {
  const h = ["ID","Date","Time","Category","Title","Details","Pond","Status","User","Source"];
  const rows = entries.map(e => [e.id, e.date, e.time, e.category,
    `"${e.title.replace(/"/g,'""')}"`, `"${(e.details||"").replace(/"/g,'""')}"`,
    e.pond, e.status, e.user, e.source]);
  const csv  = [h,...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `fathom-logbook-${pondLabel||"farm"}-${todayISO()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── Live Clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(nowTime());
  useEffect(() => { const id = setInterval(() => setTime(nowTime()), 10000); return () => clearInterval(id); }, []);
  return (
    <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      {time}
    </span>
  );
}

// ─── Animated counter ──────────────────────────────────────────────────────────
function Counter({ value, color }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span key={value}
        initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
        transition={{ duration:0.18 }}
        className={`text-2xl font-black ${color}`}>
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Stats Strip ───────────────────────────────────────────────────────────────
function StatsStrip({ entries }) {
  const s = useMemo(() => ({
    total:    entries.length,
    today:    entries.filter(e => e.date === todayFmt()).length,
    critical: entries.filter(e => e.status === "Critical").length,
    warnings: entries.filter(e => e.status === "Warning").length,
    starred:  entries.filter(e => e.starred).length,
    manual:   entries.filter(e => e.source === "manual").length,
  }), [entries]);

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 bg-white border border-slate-200 shadow-sm divide-x divide-slate-100">
      {[
        { label:"Total",    val:s.total,    color:"text-slate-800"                                      },
        { label:"Today",    val:s.today,    color:"text-slate-800"                                      },
        { label:"Critical", val:s.critical, color:s.critical > 0 ? "text-red-600"   : "text-slate-300" },
        { label:"Warnings", val:s.warnings, color:s.warnings > 0 ? "text-amber-600" : "text-slate-300" },
        { label:"Starred",  val:s.starred,  color:s.starred  > 0 ? "text-amber-500" : "text-slate-300" },
        { label:"Manual",   val:s.manual,   color:"text-green-700"                                      },
      ].map(({ label, val, color }) => (
        <div key={label} className="p-3 text-center">
          <Counter value={val} color={color} />
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Quick Log Bar ─────────────────────────────────────────────────────────────
function QuickLogBar({ onAdd, activePond }) {
  const [text,    setText]    = useState("");
  const [cat,     setCat]     = useState("Water Quality");
  const [flashed, setFlashed] = useState(false);
  const inputRef = useRef(null);

  const submit = useCallback((e) => {
    e?.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd({ id:`MAN-${Date.now()}`, iso:todayISO(), date:todayFmt(), time:nowTime(),
      category:cat, title:t, details:"", pond:activePond?.label || "Farm",
      user:"Operator", status:"Verified", source:"manual", starred:false });
    setText("");
    setFlashed(true);
    setTimeout(() => setFlashed(false), 1200);
    inputRef.current?.focus();
  }, [text, cat, activePond, onAdd]);

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) submit(e); };
  const catCfg = CATEGORIES[cat];

  return (
    <motion.div animate={{ backgroundColor: flashed ? "#f0fdf4" : "#ffffff" }}
      transition={{ duration:0.5 }}
      className="border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-stretch">
        {/* Category selector */}
        <div className={`flex items-center gap-2 px-3 border-r border-slate-200 shrink-0 transition-colors ${catCfg.light}`}>
          <catCfg.icon size={12} className={catCfg.text} />
          <select value={cat} onChange={e => setCat(e.target.value)}
            className={`bg-transparent text-[9px] font-black uppercase tracking-widest focus:outline-none cursor-pointer py-3 ${catCfg.text}`}>
            {Object.keys(CATEGORIES).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Text input */}
        <div className="flex-1 flex items-center gap-2 px-4">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${flashed ? "bg-green-500" : "bg-slate-300"}`} />
          <input ref={inputRef} type="text" value={text}
            onChange={e => setText(e.target.value)} onKeyDown={onKey}
            placeholder="Log an observation, measurement, or event — press Enter to save…"
            className="flex-1 bg-transparent text-xs font-mono text-slate-800 placeholder-slate-400 py-3 focus:outline-none" />
          <AnimatePresence>
            {text && (
              <motion.button initial={{ opacity:0, scale:.7 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.7 }}
                onClick={() => setText("")} className="text-slate-300 hover:text-slate-500 transition-colors">
                <X size={12} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Submit button */}
        <motion.button whileTap={{ scale:0.96 }} onClick={submit} disabled={!text.trim()}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-green-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-white text-[9px] font-black uppercase tracking-widest px-5 transition-colors shrink-0">
          <Plus size={11} /> Log
        </motion.button>
      </div>

      {/* Flash bar */}
      <AnimatePresence>
        {flashed && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration:0.2 }}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-50 border-t border-green-200 overflow-hidden">
            <CheckCircle2 size={10} className="text-green-600" />
            <span className="text-[9px] font-black uppercase tracking-wider text-green-700">Entry logged</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Quick Templates ───────────────────────────────────────────────────────────
function QuickTemplates({ onAdd, activePond }) {
  const [justAdded, setJustAdded] = useState(null);
  const templates = [
    { title:"Manual water test",  category:"Water Quality" },
    { title:"Feed tray check",    category:"Feeding"       },
    { title:"Mortality count",    category:"Health"        },
    { title:"ABW sampling",       category:"Feeding"       },
    { title:"Aeration check",     category:"Maintenance"   },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {templates.map(t => {
        const cfg  = CATEGORIES[t.category];
        const done = justAdded === t.title;
        return (
          <motion.button key={t.title} whileTap={{ scale:0.92 }}
            onClick={() => {
              onAdd({ id:`MAN-${Date.now()}-${Math.random()}`, iso:todayISO(), date:todayFmt(), time:nowTime(),
                category:t.category, title:t.title, details:"",
                pond:activePond?.label || "Farm",
                user:"Operator", status:"Verified", source:"manual", starred:false });
              setJustAdded(t.title);
              setTimeout(() => setJustAdded(null), 1500);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-black uppercase tracking-wider transition-all
              ${done ? "bg-green-600 text-white border-green-600" : `${cfg.light} ${cfg.text} hover:shadow-sm`}`}>
            {done ? <CheckCircle2 size={9} /> : <cfg.icon size={9} />}
            {t.title}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Date Separator ────────────────────────────────────────────────────────────
function DateSeparator({ date, count }) {
  const isToday = date === todayFmt();
  return (
    <div className="flex items-center gap-3 py-3 sticky top-0 z-10 bg-[#f3f6f9]">
      <div className="flex-1 h-px bg-slate-200" />
      <div className="flex items-center gap-2 shrink-0">
        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border
          ${isToday ? "bg-green-700 text-white border-green-700" : "bg-white text-slate-600 border-slate-200"}`}>
          {isToday ? "Today" : date}
        </span>
        <span className="text-[8px] font-black text-slate-400 uppercase">{count} {count === 1 ? "entry" : "entries"}</span>
      </div>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ─── Timeline Entry ────────────────────────────────────────────────────────────
function TimelineEntry({ entry, onStar, onDelete, isManual, isNew }) {
  const [expanded, setExpanded] = useState(entry.status === "Critical" || entry.status === "Warning");
  const cat    = CATEGORIES[entry.category] || CATEGORIES["System"];
  const Icon   = cat.icon;
  const stat   = STATUS_CFG[entry.status]   || STATUS_CFG.Info;
  const isCrit = entry.status === "Critical";
  const isWarn = entry.status === "Warning";

  return (
    <motion.div layout
      initial={isNew ? { opacity:0, x:-24, scale:0.98 } : { opacity:0, x:-12 }}
      animate={{ opacity:1, x:0, scale:1 }}
      exit={{ opacity:0, x:16, transition:{ duration:0.15 } }}
      transition={{ type:"spring", stiffness:380, damping:32 }}
      className="relative flex gap-3 group mb-3">

      {/* Spine dot + line */}
      <div className="flex flex-col items-center shrink-0 w-6 mt-1.5">
        <motion.div
          initial={isNew ? { scale:0, opacity:0 } : false}
          animate={{ scale:1, opacity:1 }}
          transition={{ type:"spring", stiffness:500, damping:20, delay:0.08 }}
          className={`w-2.5 h-2.5 rounded-full border-2 border-[#f3f6f9] shadow-sm z-10 shrink-0
            ${isCrit ? "bg-red-500" : isWarn ? "bg-amber-400" : entry.starred ? "bg-amber-400" : cat.dot}`}
          style={isCrit ? { boxShadow:"0 0 0 4px rgba(239,68,68,0.15)" } :
                 isWarn ? { boxShadow:"0 0 0 4px rgba(251,191,36,0.15)" } : {}}
        />
        <div className="w-px flex-1 bg-slate-200 mt-1" />
      </div>

      {/* Card body */}
      <div className={`flex-1 border transition-all duration-150 overflow-hidden
        ${isCrit ? "border-red-200 bg-red-50/60"   :
          isWarn ? "border-amber-200 bg-amber-50/40" :
                   "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}>

        <div className={`h-0.5 w-full ${cat.color}`} />

        <div className="p-3">
          <div className="flex items-start gap-2.5">

            {/* Icon pill */}
            <div className={`p-1.5 border shrink-0 mt-0.5 ${cat.light}`}>
              <Icon size={10} className={cat.text} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${cat.light} ${cat.text}`}>
                    {entry.category}
                  </span>
                  <p className={`text-xs font-black leading-snug
                    ${isCrit ? "text-red-800" : isWarn ? "text-amber-800" : "text-slate-800"}`}>
                    {entry.title}
                  </p>
                  {entry.starred && <Star size={9} className="fill-amber-400 text-amber-400 shrink-0" />}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <motion.button whileTap={{ scale:0.8 }} onClick={() => onStar(entry.id)}
                    className={`p-1.5 rounded transition-colors
                      ${entry.starred ? "text-amber-400" : "text-slate-300 hover:text-amber-400 hover:bg-amber-50"}`}>
                    <Star size={11} className={entry.starred ? "fill-amber-400" : ""} />
                  </motion.button>
                  {isManual && (
                    <motion.button whileTap={{ scale:0.8 }} onClick={() => onDelete(entry.id)}
                      className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={11} />
                    </motion.button>
                  )}
                  {entry.details && (
                    <motion.button whileTap={{ scale:0.8 }} onClick={() => setExpanded(e => !e)}
                      className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                      {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                <span className="font-mono text-[9px] text-slate-400">{entry.time}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase">{entry.pond}</span>
                <span className="text-[8px] text-slate-400">by {entry.user}</span>
                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 border rounded-sm ${stat.cls}`}>
                  {entry.status}
                </span>
                <AnimatePresence>
                  {isNew && (
                    <motion.span initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.8 }}
                      className="text-[7px] font-black uppercase text-green-700 bg-green-100 border border-green-300 px-1.5 py-0.5 rounded-sm">
                      New
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Expandable details */}
              <AnimatePresence initial={false}>
                {expanded && entry.details && (
                  <motion.div
                    initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                    transition={{ duration:0.18, ease:"easeInOut" }}
                    className="overflow-hidden">
                    <div className={`mt-2 pt-2 border-t text-[10px] font-mono leading-relaxed
                      ${isCrit ? "border-red-200 text-red-700" :
                        isWarn ? "border-amber-200 text-amber-800" :
                                 "border-slate-100 text-slate-500"}`}>
                      {entry.details}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expand nudge */}
              {!expanded && !isCrit && !isWarn && entry.details && (
                <button onClick={() => setExpanded(true)}
                  className="mt-1 text-[8px] text-slate-400 hover:text-slate-600 font-black uppercase tracking-wider flex items-center gap-0.5 transition-colors">
                  <ChevronDown size={8} /> details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Logbook ──────────────────────────────────────────────────────────────
export default function Logbook() {
  const { brain, sensorData, farmConfig, activePond, logs, addLog, doc } = usePond();

  // ── Persistent manual entries ──────────────────────────────────────────────
  const [manualEntries, setManualEntries] = useState(() => loadLS(STORAGE_KEY, []));
  const [newIds,        setNewIds]        = useState(new Set());

  useEffect(() => { saveLS(STORAGE_KEY, manualEntries); }, [manualEntries]);

  const handleAdd = useCallback((entry) => {
    setManualEntries(prev => [entry, ...prev]);
    setNewIds(prev => new Set([...prev, entry.id]));
    setTimeout(() => setNewIds(prev => { const n = new Set(prev); n.delete(entry.id); return n; }), 3000);
    addLog(entry.title, "Operator");
  }, [addLog]);

  const handleDelete = useCallback((id) => {
    setManualEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // ── Starred ────────────────────────────────────────────────────────────────
  const [starred, setStarred] = useState(() => new Set(loadLS(STARRED_KEY, [])));
  const toggleStar = useCallback((id) => {
    setStarred(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      saveLS(STARRED_KEY, [...n]);
      return n;
    });
  }, []);

  // ── System entries ─────────────────────────────────────────────────────────
  const systemEntries = useMemo(() =>
    buildSystemEntries(logs, brain, sensorData, activePond, doc),
    [logs, brain, sensorData, activePond, doc]
  );

  const allEntries = useMemo(() =>
    [...manualEntries, ...systemEntries]
      .map(e => ({ ...e, starred: starred.has(e.id) || e.starred })),
    [manualEntries, systemEntries, starred]
  );

  // ── Filters ────────────────────────────────────────────────────────────────
  const [filterCat,    setFilterCat]    = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search,       setSearch]       = useState("");

  const filtered = useMemo(() => allEntries.filter(e => {
    if (filterCat === "STARRED" && !e.starred) return false;
    if (filterCat !== "ALL" && filterCat !== "STARRED" && e.category !== filterCat) return false;
    if (filterStatus !== "ALL" && e.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.title.toLowerCase().includes(q) || (e.details || "").toLowerCase().includes(q);
    }
    return true;
  }), [allEntries, filterCat, filterStatus, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(e => { if (!map.has(e.date)) map.set(e.date, []); map.get(e.date).push(e); });
    return [...map.entries()];
  }, [filtered]);

  const activeFilters = filterCat !== "ALL" || filterStatus !== "ALL" || !!search;

  return (
    <div className="min-h-full bg-[#f3f6f9] font-sans text-slate-800">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-8 py-5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <nav className="text-[9px] text-slate-400 uppercase tracking-widest font-black mb-1">
              FATHOM / {activePond?.label || "Farm"} / Logbook
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-light tracking-tight">
                Field Logbook — <span className="font-black text-slate-900">{activePond?.label || "Farm"}</span>
              </h1>
              <LiveClock />
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Continuous record · {allEntries.length} total entries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="pl-8 pr-3 py-2 border border-slate-200 bg-slate-50 text-[11px] font-mono focus:outline-none focus:border-green-600 focus:bg-white transition-colors w-40" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 px-3 py-2 focus:outline-none focus:border-green-600 transition-colors">
              <option value="ALL">All Status</option>
              {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <motion.button whileTap={{ scale:0.96 }} onClick={() => doExport(filtered, activePond?.label)}
              className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-2 transition-colors">
              <Download size={12} /> Export
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 space-y-4">

        {/* Stats */}
        <StatsStrip entries={allEntries} />

        {/* Quick log */}
        <QuickLogBar onAdd={handleAdd} activePond={activePond} />

        {/* Templates */}
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick templates</p>
          <QuickTemplates onAdd={handleAdd} activePond={activePond} />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {["ALL", "STARRED", ...Object.keys(CATEGORIES)].map(k => {
            const cat    = CATEGORIES[k];
            const active = filterCat === k;
            return (
              <motion.button key={k} whileTap={{ scale:0.92 }} onClick={() => setFilterCat(k)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider border transition-all
                  ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}>
                {k === "STARRED" ? <Star size={8} className={active ? "fill-white" : "fill-amber-400"} />
                  : cat ? <cat.icon size={8} /> : null}
                {k === "STARRED" ? "Starred" : k}
              </motion.button>
            );
          })}
          <span className="ml-auto text-[9px] font-black text-slate-400 uppercase">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </span>
          <AnimatePresence>
            {activeFilters && (
              <motion.button initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8 }}
                onClick={() => { setFilterCat("ALL"); setFilterStatus("ALL"); setSearch(""); }}
                className="flex items-center gap-1 text-[9px] font-black text-red-400 hover:text-red-600 uppercase transition-colors">
                <X size={9} /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline */}
        <AnimatePresence mode="wait">
          {grouped.length === 0 ? (
            <motion.div key="empty" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="bg-white border border-slate-200 py-16 text-center">
              <BookOpen size={28} className="text-slate-200 mx-auto mb-3" />
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No entries match your filters</p>
              <p className="text-[9px] text-slate-300 mt-1 font-bold uppercase">Use the bar above to add one</p>
            </motion.div>
          ) : (
            <motion.div key="timeline" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              {grouped.map(([date, dateEntries]) => (
                <div key={date}>
                  <DateSeparator date={date} count={dateEntries.length} />
                  <div className="pl-1 pt-2">
                    <AnimatePresence>
                      {dateEntries.map(entry => (
                        <TimelineEntry
                          key={entry.id}
                          entry={entry}
                          onStar={toggleStar}
                          onDelete={handleDelete}
                          isManual={entry.source === "manual"}
                          isNew={newIds.has(entry.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}

              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25 }}
                className="flex items-center gap-3 py-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">End of log</span>
                <div className="flex-1 h-px bg-slate-200" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}