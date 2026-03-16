import React, { useState, useMemo, useCallback } from "react";
import { usePond } from "../context/PondContext";
import {
  ShieldAlert, Zap, Activity, AlertTriangle, ChevronRight,
  HeartPulse, Timer, TrendingUp, CheckCircle2, FlaskConical,
  PlayCircle, Droplets, Thermometer, Wind, Fish, AlertCircle,
  Info, RefreshCw, TrendingDown, Minus, Clock, Target,
  BarChart2, Cpu, Waves, Bug, Flame, Anchor, Radio,
  ArrowUpRight, ArrowDownRight, ArrowRight, BatteryWarning,
  ShieldCheck, Eye, Siren, CircleDot
} from "lucide-react";

// ─── Species optimal ranges ────────────────────────────────────────────────────
const SPECIES_RANGES = {
  Vannamei: { doMin:4.5, doOpt:6.5, doMax:10, tempMin:23, tempMax:31, tempOpt:28, phMin:7.5, phMax:8.5, phOpt:8.0, ammoniaMax:0.3, salinityMin:5, salinityOpt:15, salinityMax:35 },
  Monodon:  { doMin:4.0, doOpt:5.5, doMax:10, tempMin:25, tempMax:32, tempOpt:29, phMin:7.5, phMax:8.5, phOpt:8.0, ammoniaMax:0.3, salinityMin:10, salinityOpt:20, salinityMax:35 },
  Tilapia:  { doMin:3.0, doOpt:5.0, doMax:12, tempMin:25, tempMax:35, tempOpt:30, phMin:6.5, phMax:9.0, phOpt:7.5, ammoniaMax:0.5, salinityMin:0, salinityOpt:5, salinityMax:20  },
  Catfish:  { doMin:3.0, doOpt:5.0, doMax:12, tempMin:24, tempMax:32, tempOpt:28, phMin:6.5, phMax:8.5, phOpt:7.5, ammoniaMax:0.5, salinityMin:0, salinityOpt:2, salinityMax:15  },
  Rohu:     { doMin:4.0, doOpt:5.5, doMax:12, tempMin:25, tempMax:35, tempOpt:30, phMin:7.0, phMax:8.5, phOpt:7.8, ammoniaMax:0.4, salinityMin:0, salinityOpt:2, salinityMax:10  },
};

// ─── Scoring ───────────────────────────────────────────────────────────────────
function scoreParam(value, min, max, opt) {
  if (value == null) return { score: null, status: "idle", deviation: 0 };
  if (value <= min || value >= max) return { score: 10, status: "critical", deviation: 1 };
  const range = max - min;
  const distFromOpt = Math.abs(value - opt) / (range / 2);
  const score = Math.max(0, Math.min(100, Math.round(100 - distFromOpt * 45)));
  const status = score >= 80 ? "ok" : score >= 50 ? "warn" : "critical";
  return { score, status, deviation: distFromOpt };
}

// ─── DO Crash Risk Engine ──────────────────────────────────────────────────────
function computeDOCrashRisk(sd, ranges) {
  const do_ = sd.do;
  const temp = sd.temp;
  if (do_ == null) return { risk: "unknown", hoursToMin: null, label: "No DO data", color: "text-slate-400" };
  const doMin = ranges.doMin;
  const margin = do_ - doMin;
  // Consumption rate increases ~8% per °C above 28 (Q10 rule simplified)
  const tempPenalty = temp ? Math.max(0, (temp - 28) * 0.08) : 0;
  const effectiveConsumption = 0.15 * (1 + tempPenalty); // mg/L/hr baseline drop
  const hoursToMin = margin > 0 ? Math.round((margin / effectiveConsumption) * 10) / 10 : 0;
  if (hoursToMin <= 0 || do_ <= doMin) return { risk: "crash", hoursToMin: 0, label: "Below safe limit now", color: "text-red-600" };
  if (hoursToMin <= 3) return { risk: "high",    hoursToMin, label: `${hoursToMin}h to minimum`, color: "text-red-500" };
  if (hoursToMin <= 8) return { risk: "moderate",hoursToMin, label: `${hoursToMin}h to minimum`, color: "text-amber-500" };
  return { risk: "low", hoursToMin, label: `${hoursToMin}h+ safety margin`, color: "text-green-600" };
}

// ─── Biological Stress Signals ─────────────────────────────────────────────────
function computeStressSignals(sd, ranges, b) {
  const signals = [];
  // Hypoxia stress
  if (sd.do != null && sd.do < ranges.doOpt) {
    const severity = sd.do < ranges.doMin ? "critical" : "warn";
    signals.push({ type: "Hypoxia", icon: Wind, detail: `DO at ${sd.do} mg/L (opt: ${ranges.doOpt})`, severity, action: "Increase aeration immediately" });
  }
  // Thermal stress
  if (sd.temp != null) {
    if (sd.temp > ranges.tempMax) signals.push({ type: "Heat Stress", icon: Flame, detail: `${sd.temp}°C exceeds max ${ranges.tempMax}°C`, severity: "critical", action: "Increase water exchange, shade pond" });
    else if (sd.temp < ranges.tempMin) signals.push({ type: "Cold Stress", icon: Thermometer, detail: `${sd.temp}°C below min ${ranges.tempMin}°C`, severity: "critical", action: "Check heating, reduce feeding" });
    else if (sd.temp > ranges.tempMax - 1.5) signals.push({ type: "Near Heat Limit", icon: Thermometer, detail: `${sd.temp}°C approaching max`, severity: "warn", action: "Monitor closely, prepare water exchange" });
  }
  // Ammonia toxicity
  if (sd.ammonia != null && sd.ammonia > ranges.ammoniaMax * 0.7) {
    const severity = sd.ammonia > ranges.ammoniaMax ? "critical" : "warn";
    signals.push({ type: "Ammonia Toxicity", icon: FlaskConical, detail: `NH₃ ${sd.ammonia} ppm (max: ${ranges.ammoniaMax})`, severity, action: "Water exchange, reduce feeding, add probiotics" });
  }
  // pH stress
  if (sd.ph != null) {
    if (sd.ph > ranges.phMax || sd.ph < ranges.phMin) signals.push({ type: "pH Stress", icon: Droplets, detail: `pH ${sd.ph} outside range ${ranges.phMin}–${ranges.phMax}`, severity: "critical", action: "Apply lime (low pH) or water exchange (high pH)" });
    else if (sd.ph > ranges.phMax - 0.3 || sd.ph < ranges.phMin + 0.3) signals.push({ type: "pH Borderline", icon: Droplets, detail: `pH ${sd.ph} near limits`, severity: "warn", action: "Monitor pH trend, prepare correction" });
  }
  // Feed-DO interaction stress
  if (sd.do != null && b?.feedEfficiency) {
    const fce = parseFloat(b.feedEfficiency);
    if (!isNaN(fce) && fce < 1.2 && sd.do < ranges.doOpt) {
      signals.push({ type: "Feed-DO Conflict", icon: Target, detail: `Low DO reducing FCR (${b.feedEfficiency})`, severity: "warn", action: "Reduce feed to 60%, boost aeration before feeding" });
    }
  }
  return signals;
}

// ─── Disease Risk Categories ───────────────────────────────────────────────────
function computeDiseaseRisk(sd, ranges) {
  const risks = [];
  // Vibrio risk (elevated by high temp + low DO)
  const vibrioScore = ((sd.temp || 28) > 30 ? 40 : 0) + ((sd.do || 6) < 4.5 ? 40 : 0) + ((sd.salinity || 15) > 30 ? 20 : 0);
  risks.push({ name: "Vibrio", score: Math.min(100, vibrioScore), category: "bacterial" });
  // EMS/AHPND (acute hepatopancreatic) — triggered by stress
  const emsScore = ((sd.ammonia || 0) > 0.2 ? 35 : 0) + ((sd.temp || 28) > 31 ? 30 : 0) + ((sd.do || 6) < 4.5 ? 35 : 0);
  risks.push({ name: "EMS/AHPND", score: Math.min(100, emsScore), category: "bacterial" });
  // White Spot (WSSV) — temperature-driven
  const wssScore = (sd.temp != null && (sd.temp < 25 || sd.temp > 33)) ? 60 : (sd.temp != null && sd.temp < 26 ? 30 : 10);
  risks.push({ name: "White Spot (WSSV)", score: Math.min(100, wssScore), category: "viral" });
  // Fungal — low DO + organics
  const fungalScore = ((sd.do || 6) < 4 ? 50 : (sd.do || 6) < 5 ? 25 : 0) + ((sd.ammonia || 0) > 0.3 ? 30 : 0);
  risks.push({ name: "Fungal Bloom", score: Math.min(100, fungalScore), category: "fungal" });
  return risks;
}

// ─── Oxygen Budget ─────────────────────────────────────────────────────────────
function computeOxygenBudget(sd, fc) {
  const volume = (fc?.pondSize || 1) * (fc?.waterDepth || 1.2) * 1000; // m³ → liters
  const doCurrent = sd.do || 0;
  const doSafe = 4.5;
  const doBuffer = Math.max(0, doCurrent - doSafe);
  const oxygenMassKg = (doBuffer * volume) / 1e6; // kg O2 above safe threshold
  const consumptionRate = 0.2; // mg/L/hr rough estimate
  const aeratorCapacity = fc?.aeratorHP ? fc.aeratorHP * 1.2 : 1.5; // kg O2/hr
  return {
    bufferMgL: doBuffer.toFixed(2),
    bufferKg: oxygenMassKg.toFixed(2),
    consumptionRate,
    aeratorCapacity,
    netBalance: (aeratorCapacity - consumptionRate * volume / 1e6).toFixed(2),
  };
}

// ─── 6-Hour Risk Forecast ──────────────────────────────────────────────────────
function computeRiskForecast(sd, ranges, b) {
  const baseRisk = parseFloat(b?.yieldLossPrediction || "0");
  const doFactor = sd.do != null ? Math.max(0, (ranges.doOpt - sd.do) / ranges.doOpt * 30) : 0;
  const tempFactor = sd.temp != null ? (sd.temp > ranges.tempMax ? 25 : sd.temp < ranges.tempMin ? 20 : 0) : 0;
  const nh3Factor = sd.ammonia != null ? Math.min(30, sd.ammonia / ranges.ammoniaMax * 30) : 0;
  const points = [0, 1, 2, 3, 6].map((h, i) => {
    const degradation = i * (doFactor + tempFactor + nh3Factor) / 20;
    return {
      hour: h === 0 ? "Now" : `+${h}h`,
      risk: Math.min(100, Math.round(baseRisk + degradation)),
    };
  });
  return points;
}

// ─── Carrying Capacity Health ──────────────────────────────────────────────────
function computeCarryingCapacity(sd, fc, ranges) {
  const biomass = fc?.currentBiomass || 0; // kg
  const pondArea = fc?.pondSize || 1; // ha
  const stockingDensity = biomass / (pondArea * 10000); // kg/m²
  const doScore = sd.do != null ? Math.min(100, (sd.do / ranges.doOpt) * 100) : 50;
  const maxBiomass = pondArea * 10000 * 0.6; // rough: 600g/m² for Vannamei
  const loadPct = maxBiomass > 0 ? Math.round((biomass / maxBiomass) * 100) : 0;
  return {
    loadPct: Math.min(100, loadPct),
    status: loadPct > 90 ? "critical" : loadPct > 75 ? "warn" : "ok",
    doSupport: Math.round(doScore),
    recommendation: loadPct > 85 ? "Reduce stocking or increase aeration" : "Within safe range",
  };
}

// ─── Trend Arrow ──────────────────────────────────────────────────────────────
function TrendIcon({ value, threshold, inverted = false }) {
  if (value == null) return <Minus size={12} className="text-slate-300" />;
  const isGood = inverted ? value <= threshold : value >= threshold;
  if (isGood) return <ArrowUpRight size={12} className="text-green-500" />;
  return <ArrowDownRight size={12} className="text-red-400" />;
}

// ─── Status Chip ──────────────────────────────────────────────────────────────
function StatusChip({ status, label }) {
  const map = {
    ok:       "bg-green-100 text-green-700 border-green-200",
    warn:     "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-red-100 text-red-700 border-red-200",
    idle:     "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${map[status] || map.idle}`}>
      {label}
    </span>
  );
}

// ─── Inline Score Bar ──────────────────────────────────────────────────────────
function MiniScoreBar({ score, status }) {
  const color = status === "critical" ? "bg-red-500" : status === "warn" ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-100">
        <div className={`h-1 ${color} transition-all`} style={{ width: `${score ?? 0}%` }} />
      </div>
      <span className={`text-[10px] font-black tabular-nums ${
        status === "critical" ? "text-red-600" : status === "warn" ? "text-amber-600" : "text-green-700"
      }`}>{score ?? "—"}</span>
    </div>
  );
}

// ─── Parameter Diagnostic Row ──────────────────────────────────────────────────
function ParamRow({ label, value, unit, icon: Icon, score, status, min, max, opt, detail }) {
  const pct = value != null ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  const optPct = ((opt - min) / (max - min)) * 100;
  const dotColor = status === "critical" ? "bg-red-500 animate-pulse" : status === "warn" ? "bg-amber-400 animate-pulse" : "bg-green-500";
  const valColor = status === "critical" ? "text-red-600" : status === "warn" ? "text-amber-700" : "text-green-700";

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="w-28 flex items-center gap-2">
        <Icon size={13} className="text-slate-400 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">{label}</span>
      </div>
      <div className="flex-1 relative h-1.5 bg-slate-100">
        {/* optimal zone */}
        <div className="absolute h-1.5 bg-green-100"
          style={{ left: `${Math.max(0, optPct - 8)}%`, width: "16%" }} />
        {/* current value bar */}
        <div className={`absolute h-1.5 ${dotColor.replace(" animate-pulse","").replace("bg-","bg-")}`}
          style={{ width: `${pct}%`, background: status === "critical" ? "#ef4444" : status === "warn" ? "#f59e0b" : "#22c55e" }} />
        {/* optimal marker */}
        <div className="absolute w-0.5 h-3 -top-0.5 bg-green-500 opacity-60"
          style={{ left: `${optPct}%` }} />
      </div>
      <div className="w-16 text-right">
        <span className={`text-sm font-black ${valColor}`}>{value ?? "—"}</span>
        <span className="text-[9px] text-slate-400 ml-0.5">{unit}</span>
      </div>
      <div className="w-20">
        <MiniScoreBar score={score} status={status} />
      </div>
      <div className="w-16 flex justify-end">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      </div>
    </div>
  );
}

// ─── Stress Signal Card ────────────────────────────────────────────────────────
function StressCard({ signal }) {
  const Icon = signal.icon;
  const cfg = {
    critical: { border: "border-red-200 bg-red-50", icon: "text-red-500", text: "text-red-700", badge: "bg-red-100 text-red-700 border-red-200" },
    warn:     { border: "border-amber-200 bg-amber-50", icon: "text-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-700 border-amber-200" },
  };
  const c = cfg[signal.severity] || cfg.warn;
  return (
    <div className={`p-3 border ${c.border}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={13} className={`${c.icon} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`text-[10px] font-black uppercase tracking-wider ${c.text}`}>{signal.type}</p>
            <StatusChip status={signal.severity} label={signal.severity === "critical" ? "CRITICAL" : "WARNING"} />
          </div>
          <p className="text-[10px] text-slate-600 font-medium">{signal.detail}</p>
          <p className="text-[9px] text-slate-500 mt-1">→ {signal.action}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Disease Risk Bar ──────────────────────────────────────────────────────────
function DiseaseRiskRow({ risk }) {
  const color = risk.score >= 60 ? "bg-red-500" : risk.score >= 30 ? "bg-amber-400" : "bg-green-400";
  const textColor = risk.score >= 60 ? "text-red-600" : risk.score >= 30 ? "text-amber-600" : "text-green-600";
  const catColor = { bacterial: "text-violet-500", viral: "text-blue-500", fungal: "text-orange-500" }[risk.category] || "text-slate-400";
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="w-32">
        <p className="text-[10px] font-black text-slate-700">{risk.name}</p>
        <p className={`text-[8px] uppercase font-bold ${catColor}`}>{risk.category}</p>
      </div>
      <div className="flex-1 h-1.5 bg-slate-100">
        <div className={`h-1.5 ${color} transition-all duration-700`} style={{ width: `${risk.score}%` }} />
      </div>
      <span className={`text-[11px] font-black w-10 text-right tabular-nums ${textColor}`}>
        {risk.score}%
      </span>
    </div>
  );
}

// ─── Treatment Action Card (redesigned, no hover simulation) ──────────────────
function TreatmentActionCard({ treatment, onExecute }) {
  const [expanded, setExpanded] = useState(false);
  const urgency = treatment.urgency || "standard";
  const urgencyCfg = {
    immediate: { border: "border-l-4 border-red-400", badge: "bg-red-100 text-red-700 border-red-200", label: "Immediate" },
    high:      { border: "border-l-4 border-amber-400", badge: "bg-amber-100 text-amber-700 border-amber-200", label: "High Priority" },
    standard:  { border: "border-l-4 border-blue-400", badge: "bg-blue-50 text-blue-700 border-blue-200", label: "Standard" },
  };
  const uc = urgencyCfg[urgency] || urgencyCfg.standard;

  return (
    <div className={`bg-white border border-slate-200 ${uc.border} transition-all`}>
      <div className="p-4 flex items-start gap-4">
        <div className="p-2 bg-slate-100 text-slate-600 mt-0.5">
          <FlaskConical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{treatment.label}</p>
            <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border ${uc.badge}`}>
              {uc.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">{treatment.desc}</p>
          <div className="flex gap-4 mt-2">
            {treatment.expectedDO && (
              <div>
                <p className="text-[8px] text-slate-400 uppercase font-black">DO After</p>
                <p className="text-[11px] font-black text-green-700">+{treatment.expectedDO} mg/L</p>
              </div>
            )}
            {treatment.cost && (
              <div>
                <p className="text-[8px] text-slate-400 uppercase font-black">OPEX Est.</p>
                <p className="text-[11px] font-black text-slate-700">{treatment.cost}</p>
              </div>
            )}
            {treatment.duration && (
              <div>
                <p className="text-[8px] text-slate-400 uppercase font-black">Duration</p>
                <p className="text-[11px] font-black text-slate-700">{treatment.duration}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onExecute(treatment)}
            className="bg-slate-900 hover:bg-blue-700 text-white text-[9px] font-black px-4 py-2 uppercase tracking-widest transition-colors whitespace-nowrap"
          >
            Execute
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="border border-slate-200 text-[9px] font-black px-4 py-2 uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
          >
            {expanded ? "Less" : "Steps"}
          </button>
        </div>
      </div>
      {expanded && treatment.steps && (
        <div className="px-4 pb-4 border-t border-slate-100 mt-1 pt-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Protocol Steps</p>
          <ol className="space-y-1">
            {treatment.steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-[10px] text-slate-600">
                <span className="text-[9px] font-black text-slate-400 w-4 shrink-0 mt-0.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ─── 6-Hour Forecast Bar ───────────────────────────────────────────────────────
function ForecastBar({ points }) {
  const max = Math.max(100, ...points.map(p => p.risk));
  return (
    <div className="flex gap-1 items-end h-16">
      {points.map(p => {
        const heightPct = (p.risk / max) * 100;
        const color = p.risk >= 60 ? "bg-red-400" : p.risk >= 30 ? "bg-amber-400" : "bg-green-400";
        return (
          <div key={p.hour} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] font-black text-slate-600 tabular-nums">{p.risk}%</span>
            <div className="w-full bg-slate-100 flex-1 flex items-end">
              <div className={`w-full ${color} transition-all`} style={{ height: `${Math.max(8, heightPct)}%` }} />
            </div>
            <span className="text-[8px] text-slate-400 font-bold uppercase">{p.hour}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Command Strip Metric ──────────────────────────────────────────────────────
function CommandMetric({ label, value, sub, color, pulse }) {
  return (
    <div className="flex flex-col justify-between p-4 min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-black leading-tight tracking-tight ${color} ${pulse ? "animate-pulse" : ""}`}>{value}</p>
      <p className="text-[9px] text-slate-400 font-bold mt-1">{sub}</p>
    </div>
  );
}

// ─── Oxygen Budget Panel ───────────────────────────────────────────────────────
function OxygenBudget({ budget, sd, ranges }) {
  const doSafe = ranges.doMin;
  const current = sd.do ?? 0;
  const capacity = ranges.doMax || 10;
  const sections = [
    { label: "Safe threshold", val: doSafe, color: "#ef4444", pct: (doSafe / capacity) * 100 },
    { label: "Current DO", val: current, color: current < doSafe ? "#ef4444" : current < ranges.doOpt ? "#f59e0b" : "#22c55e", pct: (current / capacity) * 100 },
    { label: "Optimum", val: ranges.doOpt, color: "#22c55e", pct: (ranges.doOpt / capacity) * 100 },
  ];

  return (
    <div>
      <div className="relative h-4 bg-slate-100 mb-3">
        {/* Safe zone tint */}
        <div className="absolute h-4 bg-red-50" style={{ width: `${sections[0].pct}%` }} />
        {/* Optimal zone tint */}
        <div className="absolute h-4 bg-green-50 opacity-70"
          style={{ left: `${sections[2].pct - 5}%`, width: "10%" }} />
        {/* Safe threshold marker */}
        <div className="absolute w-0.5 h-4 bg-red-400" style={{ left: `${sections[0].pct}%` }} />
        {/* Optimal marker */}
        <div className="absolute w-0.5 h-4 bg-green-400" style={{ left: `${sections[2].pct}%` }} />
        {/* Current DO indicator */}
        <div className="absolute top-0 w-2 h-4 -ml-1 transition-all"
          style={{ left: `${sections[1].pct}%`, background: sections[1].color }} />
      </div>
      <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-4">
        <span>0 mg/L</span>
        <span className="text-red-400">Min: {doSafe}</span>
        <span className="text-green-500">Opt: {ranges.doOpt}</span>
        <span>{capacity} mg/L</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 border border-slate-100 p-3">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Buffer above min</p>
          <p className="text-base font-black text-slate-800">{budget.bufferMgL} <span className="text-[9px] font-bold text-slate-400">mg/L</span></p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Net O₂ Balance</p>
          <p className={`text-base font-black ${parseFloat(budget.netBalance) >= 0 ? "text-green-700" : "text-red-600"}`}>
            {parseFloat(budget.netBalance) >= 0 ? "+" : ""}{budget.netBalance} <span className="text-[9px] font-bold text-slate-400">kg/hr</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Health Page ──────────────────────────────────────────────────────────
export default function Health() {
  const { sensorData, farmConfig, brain, activePond, updatePond, addLog, logs } = usePond();

  const sd      = sensorData  || {};
  const fc      = farmConfig  || {};
  const b       = brain       || {};
  const species = fc.species  || "Vannamei";
  const ranges  = SPECIES_RANGES[species] || SPECIES_RANGES.Vannamei;

  // ─── Computed diagnostics ──────────────────────────────────────────────────
  const paramScores = useMemo(() => ({
    do:      scoreParam(sd.do,      0,  ranges.doMax || 12,   ranges.doOpt),
    temp:    scoreParam(sd.temp,    15, 42,                   ranges.tempOpt),
    ph:      scoreParam(sd.ph,      4,  11,                   ranges.phOpt),
    ammonia: scoreParam(sd.ammonia, 0,  1.2,                  0.05),
    salinity:scoreParam(sd.salinity,0,  40,                   ranges.salinityOpt),
  }), [sd, ranges]);

  const wqScore = useMemo(() => {
    const w = { do: 0.35, temp: 0.20, ph: 0.20, ammonia: 0.20, salinity: 0.05 };
    let total = 0, wSum = 0;
    Object.entries(w).forEach(([k, wt]) => {
      if (paramScores[k].score != null) { total += paramScores[k].score * wt; wSum += wt; }
    });
    return wSum > 0 ? Math.round(total / wSum) : null;
  }, [paramScores]);

  const doCrash      = useMemo(() => computeDOCrashRisk(sd, ranges), [sd, ranges]);
  const stressSignals= useMemo(() => computeStressSignals(sd, ranges, b), [sd, ranges, b]);
  const diseaseRisks = useMemo(() => computeDiseaseRisk(sd, ranges), [sd, ranges]);
  const oxygenBudget = useMemo(() => computeOxygenBudget(sd, fc), [sd, fc]);
  const forecast     = useMemo(() => computeRiskForecast(sd, ranges, b), [sd, ranges, b]);
  const capacity     = useMemo(() => computeCarryingCapacity(sd, fc, ranges), [sd, fc, ranges]);

  const mortalityRisk  = Math.max(0, (100 - parseFloat(b.survivalProb || 100))).toFixed(1);
  const isHighRisk     = parseFloat(mortalityRisk) > 20;
  const criticalAlerts = b.alerts?.length || 0;
  const hasWarnings    = (b.warnings?.length || 0) > 0;

  // Enrich treatments with protocol steps, urgency, cost, duration
  const enrichedTreatments = useMemo(() => {
    return (b.treatments || []).map(t => ({
      ...t,
      urgency: t.id === "aeration" && (sd.do || 0) < ranges.doMin ? "immediate"
             : t.id === "water_exchange" && (sd.ammonia || 0) > ranges.ammoniaMax ? "high"
             : "standard",
      cost: t.id === "aeration" ? "₹350/hr" : t.id === "water_exchange" ? "₹800–1,200" : "₹400–600",
      duration: t.id === "aeration" ? "2–4 hrs" : "30–60 min",
      expectedDO: t.id === "aeration" ? "+1.5–2.5" : undefined,
      steps: t.id === "aeration"
        ? ["Check aerator motor and impeller", "Start emergency aeration at max capacity", "Monitor DO every 15 min", "Reduce feeding by 50% until DO stable", "Log intervention in Logbook"]
        : t.id === "water_exchange"
        ? ["Close inlet, drain 20–30% pond volume", "Introduce fresh water slowly", "Check inlet water DO and pH before entry", "Recheck ammonia after 2 hrs", "Resume normal feeding after stabilization"]
        : ["Assess condition of stock", "Apply treatment as directed", "Monitor response for 2 hours", "Log outcome in Logbook"],
    }));
  }, [b.treatments, sd, ranges]);

  const handleExecute = useCallback(async (t) => {
    const newData = t.effect?.(sd);
    if (newData) await updatePond(newData);
    addLog(`Intervention: ${t.label}`, "Health Doctor");
  }, [sd, updatePond, addLog]);

  // ─── WQ rating text ───────────────────────────────────────────────────────
  const wqRating = wqScore == null ? "No Data"
    : wqScore >= 85 ? "Excellent"
    : wqScore >= 70 ? "Good"
    : wqScore >= 50 ? "Fair"
    : wqScore >= 30 ? "Poor"
    : "Critical";

  const wqColor = wqScore == null ? "text-slate-400"
    : wqScore >= 70 ? "text-green-600"
    : wqScore >= 50 ? "text-amber-600"
    : "text-red-600";

  return (
    <div className="min-h-full bg-[#f8f9fa] text-slate-800 font-sans">

      {/* ═══════════════════════════════════════════════════════════════════════
          ZONE 1: COMMAND STRIP — Critical situational awareness at a glance
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 text-white border-b border-slate-700">
        {/* Header row */}
        <div className="px-6 pt-4 pb-3 flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-slate-800">
          <div>
            <nav className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">
              FATHOM / Health Doctor / {activePond?.label || "—"}
            </nav>
            <h1 className="text-2xl font-light text-white tracking-tight">
              Biological Diagnostics — <span className="font-black italic text-blue-400">{activePond?.label || "Active Pond"}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live · {species}</span>
            <button className="ml-4 p-1.5 text-slate-500 hover:text-white transition-colors">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Critical alert banners (only when alerts exist) */}
        {criticalAlerts > 0 && b.alerts?.map((alert, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-2.5 bg-red-950 border-b border-red-900">
            <Siren size={13} className="text-red-400 shrink-0 animate-pulse" />
            <p className="text-[11px] font-black text-red-300 uppercase tracking-wider">{alert}</p>
            <ChevronRight size={12} className="text-red-600 ml-auto" />
          </div>
        ))}

        {/* Metric strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-slate-800">
          <CommandMetric
            label="Health Index"
            value={`${b.healthScore ?? "—"}/100`}
            sub={`WQ Score: ${wqScore ?? "—"}`}
            color={(b.healthScore || 100) >= 75 ? "text-blue-400" : (b.healthScore || 100) >= 45 ? "text-amber-400" : "text-red-400"}
          />
          <CommandMetric
            label="Mortality Risk"
            value={`${mortalityRisk}%`}
            sub={isHighRisk ? "High Alert — act now" : "Within safe range"}
            color={isHighRisk ? "text-red-400" : "text-green-400"}
            pulse={isHighRisk}
          />
          <CommandMetric
            label="DO Status"
            value={sd.do != null ? `${sd.do} mg/L` : "—"}
            sub={doCrash.label}
            color={doCrash.risk === "crash" || doCrash.risk === "high" ? "text-red-400" : doCrash.risk === "moderate" ? "text-amber-400" : "text-green-400"}
          />
          <CommandMetric
            label="Active Alerts"
            value={criticalAlerts + (b.warnings?.length || 0)}
            sub={criticalAlerts > 0 ? `${criticalAlerts} critical` : "No critical alerts"}
            color={criticalAlerts > 0 ? "text-red-400 animate-pulse" : hasWarnings ? "text-amber-400" : "text-green-400"}
          />
          <CommandMetric
            label="Survival Est."
            value={b.survivalProb ? `${b.survivalProb}%` : "—"}
            sub={`Yield risk: ${b.yieldLossPrediction || "0%"}`}
            color={(parseFloat(b.survivalProb || 100)) >= 85 ? "text-emerald-400" : "text-amber-400"}
          />
          <CommandMetric
            label="Pond Load"
            value={`${capacity.loadPct}%`}
            sub={capacity.recommendation}
            color={capacity.status === "critical" ? "text-red-400" : capacity.status === "warn" ? "text-amber-400" : "text-green-400"}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ZONE 2: DIAGNOSTICS GRID
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Warning banners */}
          {(b.warnings?.length > 0) && (
            <div className="space-y-2 mb-6">
              {b.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 px-4 py-3">
                  <Info size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-black text-amber-700 uppercase tracking-wider">{typeof w === "string" ? w : w.message}</p>
                    {w.advice && <p className="text-[10px] text-slate-600 mt-0.5 font-medium">{w.advice}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT 8 cols ─────────────────────────────────────────────── */}
            <div className="lg:col-span-8 space-y-6">

              {/* Section A: Water Quality Diagnostics */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                    <Droplets size={13} className="text-blue-500" /> Water Quality Diagnostics
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase ${wqColor}`}>{wqRating}</span>
                    <span className="text-[9px] text-slate-400 font-bold">WQ Score: {wqScore ?? "—"}/100</span>
                  </div>
                </div>
                <div className="p-5">
                  <ParamRow label="Dissolved O₂" value={sd.do}      unit="mg/L" icon={Wind}        {...paramScores.do}      min={0} max={ranges.doMax||12}  opt={ranges.doOpt} detail={`Min: ${ranges.doMin}`} />
                  <ParamRow label="Temperature"   value={sd.temp}    unit="°C"   icon={Thermometer} {...paramScores.temp}    min={15} max={42}               opt={ranges.tempOpt} detail={`${ranges.tempMin}–${ranges.tempMax}°C`} />
                  <ParamRow label="pH Level"      value={sd.ph}      unit="pH"   icon={Droplets}    {...paramScores.ph}      min={4} max={11}                opt={ranges.phOpt} detail={`${ranges.phMin}–${ranges.phMax}`} />
                  <ParamRow label="Ammonia NH₃"   value={sd.ammonia} unit="ppm"  icon={FlaskConical} {...paramScores.ammonia} min={0} max={1.2}               opt={0.05} detail={`Max: ${ranges.ammoniaMax}`} />
                  <ParamRow label="Salinity"      value={sd.salinity}unit="ppt"  icon={Waves}       {...paramScores.salinity}min={0} max={40}                opt={ranges.salinityOpt} detail={`Min: ${ranges.salinityMin}`} />
                </div>
                {/* WQ composite bar */}
                <div className="px-5 pb-4 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Composite WQ</span>
                    <div className="flex-1 h-2 bg-slate-100">
                      <div className={`h-2 transition-all ${(wqScore||0)>=70?"bg-green-500":(wqScore||0)>=50?"bg-amber-400":"bg-red-500"}`}
                        style={{ width: `${wqScore||0}%` }} />
                    </div>
                    <span className={`text-sm font-black w-10 text-right tabular-nums ${wqColor}`}>{wqScore ?? "—"}</span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1.5">DO (35%) · Ammonia (20%) · pH (20%) · Temp (20%) · Salinity (5%)</p>
                </div>
              </div>

              {/* Section B: Stress Signals + Disease Risk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Biological Stress Signals */}
                <div className="bg-white border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                      <HeartPulse size={13} className="text-red-500" /> Biological Stress Signals
                    </h2>
                    <span className={`text-[9px] font-black uppercase ${stressSignals.length === 0 ? "text-green-600" : stressSignals.some(s => s.severity === "critical") ? "text-red-600" : "text-amber-600"}`}>
                      {stressSignals.length === 0 ? "All Clear" : `${stressSignals.length} Signal${stressSignals.length > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    {stressSignals.length > 0
                      ? stressSignals.map((s, i) => <StressCard key={i} signal={s} />)
                      : (
                        <div className="text-center py-8">
                          <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Active Stress Indicators</p>
                          <p className="text-[9px] text-slate-300 mt-1">{species} within normal biological parameters</p>
                        </div>
                      )
                    }
                  </div>
                </div>

                {/* Disease Risk Assessment */}
                <div className="bg-white border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                      <Bug size={13} className="text-violet-500" /> Disease Risk Assessment
                    </h2>
                    <span className="text-[9px] text-slate-400 font-bold">Environment-derived</span>
                  </div>
                  <div className="p-5 space-y-1">
                    {diseaseRisks.map((r, i) => <DiseaseRiskRow key={i} risk={r} />)}
                    <p className="text-[8px] text-slate-300 pt-3 mt-3 border-t border-slate-100">
                      Risk derived from DO, temperature, ammonia, and salinity patterns. Not a substitute for pathogen testing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section C: DO Crash Risk + Oxygen Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* DO Crash Risk Predictor */}
                <div className="bg-white border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                      <BatteryWarning size={13} className="text-amber-500" /> DO Crash Predictor
                    </h2>
                  </div>
                  <div className="p-5">
                    <div className="flex items-end gap-4 mb-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time to Critical</p>
                        <p className={`text-3xl font-black tracking-tight ${doCrash.color}`}>
                          {doCrash.hoursToMin != null ? `${doCrash.hoursToMin}h` : "—"}
                        </p>
                      </div>
                      <div className="flex-1 pb-1">
                        <p className={`text-xs font-black uppercase ${doCrash.color}`}>
                          {doCrash.risk === "crash" ? "ALREADY BELOW SAFE LIMIT" :
                           doCrash.risk === "high" ? "HIGH RISK — Act now" :
                           doCrash.risk === "moderate" ? "Monitor closely" :
                           "Safe margin maintained"}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{doCrash.label}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase font-black">Current DO</p>
                        <p className="text-sm font-black text-slate-700">{sd.do ?? "—"} <span className="text-[9px] font-bold text-slate-400">mg/L</span></p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase font-black">Safe Min</p>
                        <p className="text-sm font-black text-slate-700">{ranges.doMin} <span className="text-[9px] font-bold text-slate-400">mg/L</span></p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase font-black">Temp Effect</p>
                        <p className="text-sm font-black text-slate-700">
                          {sd.temp ? `${sd.temp > 28 ? "+" : ""}${((sd.temp - 28) * 0.08 * 100).toFixed(0)}%` : "—"}
                          <span className="text-[9px] font-bold text-slate-400 ml-0.5">cons.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Oxygen Budget */}
                <div className="bg-white border border-slate-200 shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                      <Cpu size={13} className="text-blue-500" /> Oxygen Budget
                    </h2>
                  </div>
                  <div className="p-5">
                    <OxygenBudget budget={oxygenBudget} sd={sd} ranges={ranges} />
                  </div>
                </div>
              </div>

            </div>

            {/* ── RIGHT 4 cols ─────────────────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6">

              {/* 6-Hour Risk Forecast */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                    <Radio size={13} className="text-blue-500" /> 6-Hour Risk Forecast
                  </h2>
                </div>
                <div className="p-5">
                  <ForecastBar points={forecast} />
                  <p className="text-[8px] text-slate-400 mt-3">
                    Projected risk based on current DO trend, temperature, and ammonia rate of change.
                  </p>
                </div>
              </div>

              {/* Mortality Risk Panel */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                    <ShieldAlert size={13} className="text-slate-500" /> Mortality Risk
                  </h2>
                  <StatusChip
                    status={isHighRisk ? "critical" : parseFloat(mortalityRisk) > 8 ? "warn" : "ok"}
                    label={isHighRisk ? "High Alert" : parseFloat(mortalityRisk) > 8 ? "Elevated" : "Low Risk"}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-end gap-4 mb-4">
                    <p className={`text-4xl font-black tracking-tight ${isHighRisk ? "text-red-600" : parseFloat(mortalityRisk) > 8 ? "text-amber-600" : "text-green-600"}`}>
                      {mortalityRisk}%
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase pb-1">12-hour window</p>
                  </div>
                  <div className="relative h-2 bg-slate-100 mb-4">
                    <div className="absolute h-2 bg-amber-200" style={{ left: "20%", width: "40%" }} />
                    <div className="absolute h-2 bg-red-200" style={{ left: "60%", width: "40%" }} />
                    <div
                      className={`h-2 absolute top-0 w-1 -ml-0.5 ${isHighRisk ? "bg-red-600" : "bg-green-600"} transition-all`}
                      style={{ left: `${Math.min(99, parseFloat(mortalityRisk))}%` }}
                    />
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Feed Efficiency", value: b.feedEfficiency || "—" },
                      { label: "Survival Est.", value: b.survivalProb ? `${b.survivalProb}%` : "—" },
                      { label: "Yield Risk", value: b.yieldLossPrediction || "0%" },
                      { label: "Risk Level", value: b.riskLevel || "Low" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                        <span className="text-[11px] font-black text-slate-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Carrying Capacity Gauge */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                    <Anchor size={13} className="text-slate-500" /> Carrying Capacity
                  </h2>
                </div>
                <div className="p-5">
                  <div className="flex items-end gap-3 mb-3">
                    <span className={`text-3xl font-black ${
                      capacity.status === "critical" ? "text-red-600" :
                      capacity.status === "warn" ? "text-amber-600" : "text-green-600"
                    }`}>{capacity.loadPct}%</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase pb-1">of max biomass load</span>
                  </div>
                  <div className="relative h-3 bg-slate-100 mb-2">
                    <div className="absolute h-3 bg-amber-100" style={{ left: "70%", width: "15%" }} />
                    <div className="absolute h-3 bg-red-100" style={{ left: "85%", width: "15%" }} />
                    <div className={`h-3 transition-all ${
                      capacity.status === "critical" ? "bg-red-500" :
                      capacity.status === "warn" ? "bg-amber-400" : "bg-green-500"
                    }`} style={{ width: `${capacity.loadPct}%` }} />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-3">
                    <span>0%</span><span className="text-amber-400">70%</span><span className="text-red-400">85%</span><span>100%</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[9px] text-slate-500">{capacity.recommendation}</p>
                    <p className="text-[8px] text-slate-400 mt-1">DO support index: {capacity.doSupport}/100</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              ZONE 3: TREATMENT CONSOLE — Action-oriented, full width
          ═════════════════════════════════════════════════════════════════ */}
          <div className="mt-6">
            <div className="bg-white border border-slate-200 shadow-sm">
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Zap size={13} className="text-yellow-400" /> Treatment Console — Intervention Engine
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border ${
                    enrichedTreatments.some(t => t.urgency === "immediate")
                      ? "border-red-500 text-red-400 animate-pulse"
                      : enrichedTreatments.length > 0
                      ? "border-amber-500 text-amber-400"
                      : "border-green-600 text-green-400"
                  }`}>
                    {enrichedTreatments.some(t => t.urgency === "immediate")
                      ? "Immediate Action Required"
                      : enrichedTreatments.length > 0
                      ? `${enrichedTreatments.length} Treatment${enrichedTreatments.length > 1 ? "s" : ""} Recommended`
                      : "No Interventions Required"}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {enrichedTreatments.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {enrichedTreatments.map(t => (
                      <TreatmentActionCard key={t.id} treatment={t} onExecute={handleExecute} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-300">
                    <ShieldCheck size={32} className="mx-auto mb-3" />
                    <p className="text-[11px] font-black uppercase tracking-widest">No Emergency Actions Required</p>
                    <p className="text-[9px] text-slate-400 mt-1.5">All biological parameters within safe thresholds for {species}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Continue standard monitoring protocol</p>
                  </div>
                )}
              </div>

              {/* Intervention history strip */}
              {(logs?.length || 0) > 0 && (
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={11} className="text-slate-400" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Recent Interventions</p>
                  </div>
                  <div className="flex gap-6 overflow-x-auto">
                    {(logs || []).slice(0, 5).map((l, i) => (
                      <div key={l.id || i} className="flex items-center gap-2 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <p className="text-[9px] text-slate-600 font-bold">{l.type}</p>
                        <p className="text-[8px] text-slate-400">{l.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}