import React, { useState, useMemo, useCallback } from "react";
import { usePond } from "../context/PondContext";
import {
  ShieldAlert, Zap, AlertTriangle, ChevronRight,
  HeartPulse, CheckCircle2, FlaskConical,
  Droplets, Thermometer, Wind, AlertCircle,
  Info, RefreshCw, Clock, Target,
  Cpu, Waves, Bug, Flame, Anchor, Radio,
  ArrowUpRight, ArrowDownRight, BatteryWarning,
  ShieldCheck, Siren, Minus
} from "lucide-react";

// ─── Design tokens matching app system ────────────────────────────────────────
const BG        = "#f0f2f0";
const GREEN     = "#1a7a3c";
const GREEN_LT  = "#e8f5ed";
const GREEN_BD  = "#b8ddc8";

// ─── Species ranges ────────────────────────────────────────────────────────────
const SPECIES_RANGES = {
  Vannamei: { doMin:4.5,doOpt:6.5,doMax:10,tempMin:23,tempMax:31,tempOpt:28,phMin:7.5,phMax:8.5,phOpt:8.0,ammoniaMax:0.3,salinityMin:5,salinityOpt:15,salinityMax:35 },
  Monodon:  { doMin:4.0,doOpt:5.5,doMax:10,tempMin:25,tempMax:32,tempOpt:29,phMin:7.5,phMax:8.5,phOpt:8.0,ammoniaMax:0.3,salinityMin:10,salinityOpt:20,salinityMax:35 },
  Tilapia:  { doMin:3.0,doOpt:5.0,doMax:12,tempMin:25,tempMax:35,tempOpt:30,phMin:6.5,phMax:9.0,phOpt:7.5,ammoniaMax:0.5,salinityMin:0,salinityOpt:5,salinityMax:20 },
  Catfish:  { doMin:3.0,doOpt:5.0,doMax:12,tempMin:24,tempMax:32,tempOpt:28,phMin:6.5,phMax:8.5,phOpt:7.5,ammoniaMax:0.5,salinityMin:0,salinityOpt:2,salinityMax:15 },
  Rohu:     { doMin:4.0,doOpt:5.5,doMax:12,tempMin:25,tempMax:35,tempOpt:30,phMin:7.0,phMax:8.5,phOpt:7.8,ammoniaMax:0.4,salinityMin:0,salinityOpt:2,salinityMax:10 },
};

// ─── Scoring ───────────────────────────────────────────────────────────────────
function scoreParam(value, min, max, opt) {
  if (value == null) return { score: null, status: "idle" };
  if (value <= min || value >= max) return { score: 10, status: "critical" };
  const distFromOpt = Math.abs(value - opt) / ((max - min) / 2);
  const score = Math.max(0, Math.min(100, Math.round(100 - distFromOpt * 45)));
  return { score, status: score >= 80 ? "ok" : score >= 50 ? "warn" : "critical" };
}

function computeDOCrash(sd, ranges) {
  if (sd.do == null) return { risk:"unknown", hoursToMin:null, label:"No DO data" };
  const margin = sd.do - ranges.doMin;
  const tempPenalty = sd.temp ? Math.max(0,(sd.temp-28)*0.08) : 0;
  const consumption = 0.15*(1+tempPenalty);
  const h = margin > 0 ? Math.round((margin/consumption)*10)/10 : 0;
  if (h <= 0 || sd.do <= ranges.doMin) return { risk:"crash",  hoursToMin:0,   label:"Below safe limit now" };
  if (h <= 3)                           return { risk:"high",   hoursToMin:h,   label:`${h}h to minimum` };
  if (h <= 8)                           return { risk:"moderate",hoursToMin:h,  label:`${h}h to minimum` };
  return                                       { risk:"low",    hoursToMin:h,   label:`${h}h+ safety margin` };
}

function computeStress(sd, ranges, b) {
  const out = [];
  if (sd.do != null && sd.do < ranges.doOpt)
    out.push({ type:"Hypoxia", icon:Wind, detail:`DO ${sd.do} mg/L (opt: ${ranges.doOpt})`,
      severity: sd.do < ranges.doMin ? "critical":"warn", action:"Increase aeration immediately" });
  if (sd.temp != null) {
    if (sd.temp > ranges.tempMax)
      out.push({ type:"Heat Stress", icon:Flame, detail:`${sd.temp}°C exceeds max ${ranges.tempMax}°C`,
        severity:"critical", action:"Increase water exchange, shade pond" });
    else if (sd.temp < ranges.tempMin)
      out.push({ type:"Cold Stress", icon:Thermometer, detail:`${sd.temp}°C below min ${ranges.tempMin}°C`,
        severity:"critical", action:"Check heating, reduce feeding" });
    else if (sd.temp > ranges.tempMax-1.5)
      out.push({ type:"Near Heat Limit", icon:Thermometer, detail:`${sd.temp}°C approaching max`,
        severity:"warn", action:"Monitor closely, prepare water exchange" });
  }
  if (sd.ammonia != null && sd.ammonia > ranges.ammoniaMax*0.7)
    out.push({ type:"Ammonia Toxicity", icon:FlaskConical, detail:`NH₃ ${sd.ammonia} ppm (max: ${ranges.ammoniaMax})`,
      severity: sd.ammonia > ranges.ammoniaMax ? "critical":"warn",
      action:"Water exchange, reduce feeding, add probiotics" });
  if (sd.ph != null) {
    if (sd.ph > ranges.phMax || sd.ph < ranges.phMin)
      out.push({ type:"pH Stress", icon:Droplets, detail:`pH ${sd.ph} outside ${ranges.phMin}–${ranges.phMax}`,
        severity:"critical", action:"Apply lime (low pH) or water exchange (high pH)" });
    else if (sd.ph > ranges.phMax-0.3 || sd.ph < ranges.phMin+0.3)
      out.push({ type:"pH Borderline", icon:Droplets, detail:`pH ${sd.ph} near limits`,
        severity:"warn", action:"Monitor trend, prepare correction" });
  }
  return out;
}

function computeDiseaseRisk(sd, ranges) {
  return [
    { name:"Vibrio",           category:"bacterial",
      score:Math.min(100,((sd.temp||28)>30?40:0)+((sd.do||6)<4.5?40:0)+((sd.salinity||15)>30?20:0)) },
    { name:"EMS / AHPND",      category:"bacterial",
      score:Math.min(100,((sd.ammonia||0)>0.2?35:0)+((sd.temp||28)>31?30:0)+((sd.do||6)<4.5?35:0)) },
    { name:"White Spot (WSSV)",category:"viral",
      score:Math.min(100,(sd.temp!=null&&(sd.temp<25||sd.temp>33))?60:(sd.temp!=null&&sd.temp<26?30:10)) },
    { name:"Fungal Bloom",     category:"fungal",
      score:Math.min(100,((sd.do||6)<4?50:(sd.do||6)<5?25:0)+((sd.ammonia||0)>0.3?30:0)) },
  ];
}

function computeOxygenBudget(sd, fc) {
  const volume = (fc?.pondSize||1)*(fc?.waterDepth||1.2)*1000;
  const doBuffer = Math.max(0,(sd.do||0)-4.5);
  const aeratorCap = fc?.aeratorHP ? fc.aeratorHP*1.2 : 1.5;
  const consumption = 0.2;
  return {
    bufferMgL: doBuffer.toFixed(2),
    netBalance: (aeratorCap - consumption*volume/1e6).toFixed(2),
    aeratorCap,
  };
}

function computeForecast(sd, ranges, b) {
  const base = parseFloat(b?.yieldLossPrediction||"0");
  const doF  = sd.do   != null ? Math.max(0,(ranges.doOpt-sd.do)/ranges.doOpt*30) : 0;
  const tF   = sd.temp != null ? (sd.temp>ranges.tempMax?25:sd.temp<ranges.tempMin?20:0) : 0;
  const nF   = sd.ammonia != null ? Math.min(30,sd.ammonia/ranges.ammoniaMax*30) : 0;
  return [0,1,2,3,6].map((h,i) => ({
    hour: h===0?"Now":`+${h}h`,
    risk: Math.min(100,Math.round(base + i*(doF+tF+nF)/20)),
  }));
}

function computeCapacity(sd, fc, ranges) {
  const biomass = fc?.currentBiomass||0;
  const area    = fc?.pondSize||1;
  const maxB    = area*10000*0.6;
  const loadPct = maxB>0 ? Math.min(100,Math.round((biomass/maxB)*100)) : 0;
  return {
    loadPct,
    status: loadPct>90?"critical":loadPct>75?"warn":"ok",
    doSupport: sd.do!=null ? Math.min(100,Math.round((sd.do/ranges.doOpt)*100)) : 50,
    recommendation: loadPct>85 ? "Reduce stocking or increase aeration" : "Within safe range",
  };
}

// ─── Shared badge ──────────────────────────────────────────────────────────────
function Badge({ status, label }) {
  const cfg = {
    ok:       "bg-green-50 text-green-700 border-green-200",
    warn:     "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-600 border-red-200",
    idle:     "bg-gray-50 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full ${cfg[status]||cfg.idle}`}>
      {label}
    </span>
  );
}

// ─── Section card wrapper ──────────────────────────────────────────────────────
function Card({ title, icon: Icon, iconColor = "text-slate-400", right, children, noPad }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          {Icon && <Icon size={13} className={iconColor} />}
          {title}
        </h3>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
      <div className={noPad ? "" : "p-5"}>{children}</div>
    </div>
  );
}

// ─── Param row ─────────────────────────────────────────────────────────────────
function ParamRow({ label, value, unit, icon: Icon, score, status, min, max, opt }) {
  const pct    = value != null ? Math.min(100,Math.max(0,((value-min)/(max-min))*100)) : 0;
  const optPct = ((opt-min)/(max-min))*100;
  const barColor = status==="critical" ? "#ef4444" : status==="warn" ? "#f59e0b" : GREEN;
  const valColor = status==="critical" ? "text-red-600" : status==="warn" ? "text-amber-600" : "text-gray-800";
  const statusLabel = status==="critical"?"Critical":status==="warn"?"Warning":status==="ok"?"Optimal":"—";

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <div className="w-32 flex items-center gap-2 shrink-0">
        <Icon size={14} className="text-gray-400 shrink-0" />
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="flex-1 relative h-1.5 bg-gray-100 rounded-full">
        <div className="absolute h-1.5 bg-green-100 rounded-full"
          style={{ left:`${Math.max(0,optPct-8)}%`, width:"16%" }} />
        <div className="absolute h-1.5 rounded-full transition-all duration-500"
          style={{ width:`${pct}%`, background:barColor }} />
        <div className="absolute w-0.5 h-3 -top-0.5 rounded-full opacity-50"
          style={{ left:`${optPct}%`, background:GREEN }} />
      </div>
      <div className="w-20 text-right shrink-0">
        <span className={`text-base font-bold ${valColor}`}>{value ?? "—"}</span>
        <span className="text-[10px] text-gray-400 ml-1">{unit}</span>
      </div>
      <div className="w-16 shrink-0">
        <Badge status={status==="ok"?"ok":status==="warn"?"warn":status==="critical"?"critical":"idle"} label={statusLabel}/>
      </div>
    </div>
  );
}

// ─── Stress signal row ─────────────────────────────────────────────────────────
function StressRow({ signal }) {
  const Icon = signal.icon;
  const isCrit = signal.severity === "critical";
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-lg border mb-2 last:mb-0
      ${isCrit ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
      <Icon size={14} className={`shrink-0 mt-0.5 ${isCrit?"text-red-500":"text-amber-500"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[11px] font-bold uppercase tracking-wide ${isCrit?"text-red-700":"text-amber-700"}`}>
            {signal.type}
          </span>
          <Badge status={isCrit?"critical":"warn"} label={isCrit?"Critical":"Warning"} />
        </div>
        <p className="text-[11px] text-gray-600">{signal.detail}</p>
        <p className="text-[10px] text-gray-500 mt-1">→ {signal.action}</p>
      </div>
    </div>
  );
}

// ─── Disease risk row ──────────────────────────────────────────────────────────
function DiseaseRow({ risk }) {
  const barColor = risk.score>=60?"bg-red-400":risk.score>=30?"bg-amber-400":"bg-green-400";
  const txtColor = risk.score>=60?"text-red-600":risk.score>=30?"text-amber-600":"text-green-600";
  const catColor = {bacterial:"text-violet-500",viral:"text-blue-500",fungal:"text-orange-500"}[risk.category]||"text-gray-400";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-36 shrink-0">
        <p className="text-[11px] font-semibold text-gray-700 leading-tight">{risk.name}</p>
        <p className={`text-[9px] uppercase font-bold ${catColor}`}>{risk.category}</p>
      </div>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
        <div className={`h-1.5 ${barColor} rounded-full transition-all duration-700`} style={{width:`${risk.score}%`}}/>
      </div>
      <span className={`text-[12px] font-bold w-10 text-right tabular-nums ${txtColor}`}>{risk.score}%</span>
    </div>
  );
}

// ─── Treatment card ────────────────────────────────────────────────────────────
function TreatmentCard({ treatment, onExecute }) {
  const [expanded, setExpanded] = useState(false);
  const urgency = treatment.urgency || "standard";
  const border = urgency==="immediate"?"border-l-4 border-red-400":urgency==="high"?"border-l-4 border-amber-400":"border-l-4 border-blue-400";
  const badge  = urgency==="immediate"?"bg-red-50 text-red-700 border-red-200":urgency==="high"?"bg-amber-50 text-amber-700 border-amber-200":"bg-blue-50 text-blue-700 border-blue-200";
  const badgeLabel = urgency==="immediate"?"Immediate":urgency==="high"?"High Priority":"Standard";

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${border}`}>
      <div className="p-4 flex items-start gap-4">
        <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
          <FlaskConical size={14} className="text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-bold text-gray-800">{treatment.label}</p>
            <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-full ${badge}`}>
              {badgeLabel}
            </span>
          </div>
          <p className="text-[11px] text-gray-500">{treatment.desc}</p>
          <div className="flex gap-5 mt-2.5">
            {treatment.expectedDO && (
              <div><p className="text-[9px] text-gray-400 uppercase font-bold">DO After</p>
                <p className="text-[12px] font-bold text-green-700">+{treatment.expectedDO} mg/L</p></div>
            )}
            {treatment.cost && (
              <div><p className="text-[9px] text-gray-400 uppercase font-bold">OPEX Est.</p>
                <p className="text-[12px] font-bold text-gray-700">{treatment.cost}</p></div>
            )}
            {treatment.duration && (
              <div><p className="text-[9px] text-gray-400 uppercase font-bold">Duration</p>
                <p className="text-[12px] font-bold text-gray-700">{treatment.duration}</p></div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={() => onExecute(treatment)}
            className="text-white text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-wider transition-colors"
            style={{background:GREEN}}>
            Execute
          </button>
          <button onClick={() => setExpanded(e => !e)}
            className="border border-gray-200 text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-colors">
            {expanded?"Less":"Steps"}
          </button>
        </div>
      </div>
      {expanded && treatment.steps && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Protocol Steps</p>
          <ol className="space-y-1.5">
            {treatment.steps.map((step,i) => (
              <li key={i} className="flex gap-2 text-[11px] text-gray-600">
                <span className="text-[10px] font-bold text-gray-400 w-4 shrink-0 mt-0.5">{i+1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ─── Forecast bars ─────────────────────────────────────────────────────────────
function ForecastBars({ points }) {
  return (
    <div className="flex gap-2 items-end h-20">
      {points.map(p => {
        const barColor = p.risk>=60?"bg-red-400":p.risk>=30?"bg-amber-400":"bg-green-400";
        const h = Math.max(8,(p.risk/100)*100);
        return (
          <div key={p.hour} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-gray-600 tabular-nums">{p.risk}%</span>
            <div className="w-full bg-gray-100 rounded flex-1 flex items-end overflow-hidden">
              <div className={`w-full ${barColor} rounded transition-all`} style={{height:`${h}%`}}/>
            </div>
            <span className="text-[9px] text-gray-400 font-semibold uppercase">{p.hour}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat metric (top strip) ───────────────────────────────────────────────────
function StatMetric({ label, value, sub, status, pulse }) {
  const statusColor = {
    green: "text-green-600", red: "text-red-600", amber: "text-amber-600",
    blue: "text-blue-600", muted: "text-gray-400",
  }[status] || "text-gray-800";
  return (
    <div className="flex flex-col gap-0.5 px-5 py-4 min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-xl font-bold leading-none tracking-tight ${statusColor} ${pulse?"animate-pulse":""}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Oxygen Budget ─────────────────────────────────────────────────────────────
function OxygenBudgetPanel({ budget, sd, ranges }) {
  const cap   = ranges.doMax || 10;
  const safePct    = (ranges.doMin/cap)*100;
  const optPct     = (ranges.doOpt/cap)*100;
  const currentPct = ((sd.do||0)/cap)*100;
  const barColor   = (sd.do||0)<ranges.doMin?"bg-red-500":(sd.do||0)<ranges.doOpt?"bg-amber-400":"bg-green-500";

  return (
    <div>
      <div className="relative h-3 bg-gray-100 rounded-full mb-2">
        <div className="absolute h-3 bg-red-50 rounded-l-full" style={{width:`${safePct}%`}}/>
        <div className="absolute w-0.5 h-3 bg-red-300" style={{left:`${safePct}%`}}/>
        <div className="absolute w-0.5 h-3 bg-green-400" style={{left:`${optPct}%`}}/>
        <div className={`absolute h-3 rounded-full transition-all ${barColor}`} style={{width:`${Math.min(100,currentPct)}%`}}/>
      </div>
      <div className="flex justify-between text-[9px] font-semibold text-gray-400 uppercase mb-5">
        <span>0</span>
        <span className="text-red-400">Min {ranges.doMin}</span>
        <span className="text-green-600">Opt {ranges.doOpt}</span>
        <span>{cap} mg/L</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Buffer above min</p>
          <p className="text-lg font-bold text-gray-800">{budget.bufferMgL}<span className="text-[10px] text-gray-400 ml-1">mg/L</span></p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Net O₂ balance</p>
          <p className={`text-lg font-bold ${parseFloat(budget.netBalance)>=0?"text-green-700":"text-red-600"}`}>
            {parseFloat(budget.netBalance)>=0?"+":""}{budget.netBalance}
            <span className="text-[10px] text-gray-400 ml-1">kg/hr</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Health() {
  const { sensorData, farmConfig, brain, activePond, updatePond, addLog, logs } = usePond();

  // New state for refresh animation
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sd      = sensorData || {};
  const fc      = farmConfig || {};
  const b       = brain      || {};
  const species = fc.species || "Vannamei";
  const ranges  = SPECIES_RANGES[species] || SPECIES_RANGES.Vannamei;

  const paramScores = useMemo(() => ({
    do:       scoreParam(sd.do,      0,  ranges.doMax||12, ranges.doOpt),
    temp:     scoreParam(sd.temp,    15, 42,               ranges.tempOpt),
    ph:       scoreParam(sd.ph,      4,  11,               ranges.phOpt),
    ammonia:  scoreParam(sd.ammonia, 0,  1.2,              0.05),
    salinity: scoreParam(sd.salinity,0,  40,               ranges.salinityOpt),
  }), [sd, ranges]);

  const wqScore = useMemo(() => {
    const w = {do:0.35,temp:0.20,ph:0.20,ammonia:0.20,salinity:0.05};
    let total=0, wSum=0;
    Object.entries(w).forEach(([k,wt]) => {
      if (paramScores[k].score!=null) { total+=paramScores[k].score*wt; wSum+=wt; }
    });
    return wSum>0 ? Math.round(total/wSum) : null;
  }, [paramScores]);

  const doCrash   = useMemo(() => computeDOCrash(sd, ranges),          [sd, ranges]);
  const stress    = useMemo(() => computeStress(sd, ranges, b),         [sd, ranges, b]);
  const diseases  = useMemo(() => computeDiseaseRisk(sd, ranges),       [sd, ranges]);
  const budget    = useMemo(() => computeOxygenBudget(sd, fc),          [sd, fc]);
  const forecast  = useMemo(() => computeForecast(sd, ranges, b),       [sd, ranges, b]);
  const capacity  = useMemo(() => computeCapacity(sd, fc, ranges),      [sd, fc, ranges]);

  const mortalityRisk = Math.max(0,(100-parseFloat(b.survivalProb||100))).toFixed(1);
  const isHighRisk    = parseFloat(mortalityRisk)>20;
  const critAlerts    = b.alerts?.length||0;

  const treatments = useMemo(() => (b.treatments||[]).map(t => ({
    ...t,
    urgency:  t.id==="aeration"&&(sd.do||0)<ranges.doMin?"immediate":t.id==="water_exchange"&&(sd.ammonia||0)>ranges.ammoniaMax?"high":"standard",
    cost:     t.id==="aeration"?"₹350/hr":t.id==="water_exchange"?"₹800–1,200":"₹400–600",
    duration: t.id==="aeration"?"2–4 hrs":"30–60 min",
    expectedDO: t.id==="aeration"?"+1.5–2.5":undefined,
    steps: t.id==="aeration"
      ? ["Check aerator motor and impeller","Start emergency aeration at max capacity","Monitor DO every 15 min","Reduce feeding by 50% until DO stable","Log intervention in Logbook"]
      : t.id==="water_exchange"
      ? ["Close inlet, drain 20–30% pond volume","Introduce fresh water slowly","Check inlet water DO and pH","Recheck ammonia after 2 hrs","Resume normal feeding after stabilization"]
      : ["Assess condition of stock","Apply treatment as directed","Monitor response for 2 hours","Log outcome in Logbook"],
  })), [b.treatments, sd, ranges]);

  // Modified Execute Logic to react to real-time changes
  const handleExecute = useCallback(async (t) => {
    // Define the biological impact of the intervention
    let effect = {};
    if (t.id === "aeration") {
      effect = { do: Math.min(ranges.doMax, (sd.do || 0) + 1.2) };
    } else if (t.id === "water_exchange") {
      effect = { 
        ammonia: Math.max(0, (sd.ammonia || 0) - 0.1),
        temp: ranges.tempOpt,
        ph: ranges.phOpt
      };
    }

    // Apply the update to the global context
    if (Object.keys(effect).length > 0) {
      await updatePond(effect);
    }

    addLog(`Intervention: ${t.label}`, "Health Doctor");
    alert(`Initiated: ${t.label}. Sensors will reflect changes.`);
  }, [sd, ranges, updatePond, addLog]);

  // Functional Refresh Logic
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate re-fetching sensor data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  }, []);

  const wqLabel = wqScore==null?"No Data":wqScore>=85?"Excellent":wqScore>=70?"Good":wqScore>=50?"Fair":wqScore>=30?"Poor":"Critical";
  const wqStatus = wqScore==null?"idle":wqScore>=70?"ok":wqScore>=50?"warn":"critical";

  return (
    <div className="min-h-full font-sans" style={{background:BG}}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              FATHOM / Health Doctor / {activePond?.label || "—"}
            </p>
            <h1 className="text-3xl font-light text-gray-800 tracking-tight">
              Biological Diagnostics: <span className="font-black">{activePond?.label || "Active Pond"}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
              Live · {species}
            </div>
            {/* Added handleRefresh and animation to Refresh button */}
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-gray-500 transition-colors">
              <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""}/> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Critical alert banners ───────────────────────────────────────────── */}
      {critAlerts > 0 && b.alerts?.map((alert, i) => (
        <div key={i} className="flex items-center gap-3 px-8 py-3 bg-red-600">
          <Siren size={13} className="text-white shrink-0 animate-pulse"/>
          <p className="text-[11px] font-bold text-white uppercase tracking-wider">{alert}</p>
          <ChevronRight size={12} className="text-red-200 ml-auto"/>
        </div>
      ))}

      {/* ── Warning banners ──────────────────────────────────────────────────── */}
      {(b.warnings?.length>0) && (
        <div className="px-8 pt-4">
          <div className="max-w-[1600px] mx-auto space-y-2">
            {b.warnings.map((w,i) => (
              <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <Info size={13} className="text-amber-500 mt-0.5 shrink-0"/>
                <div>
                  <p className="text-[11px] font-bold text-amber-700">{typeof w==="string"?w:w.message}</p>
                  {w.advice && <p className="text-[10px] text-gray-600 mt-0.5">{w.advice}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Metric strip ─────────────────────────────────────────────────────── */}
      <div className="px-8 pt-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-gray-100">
            <StatMetric label="Health Index"  value={`${b.healthScore??"—"}/100`}
              sub={`WQ: ${wqScore??"—"}`}
              status={(b.healthScore||100)>=75?"blue":(b.healthScore||100)>=45?"amber":"red"} />
            <StatMetric label="Mortality Risk" value={`${mortalityRisk}%`}
              sub={isHighRisk?"High Alert — act now":"Within safe range"}
              status={isHighRisk?"red":"green"} pulse={isHighRisk}/>
            <StatMetric label="DO Status" value={sd.do!=null?`${sd.do} mg/L`:"—"}
              sub={doCrash.label}
              status={doCrash.risk==="crash"||doCrash.risk==="high"?"red":doCrash.risk==="moderate"?"amber":"green"}/>
            <StatMetric label="Active Alerts" value={critAlerts+(b.warnings?.length||0)}
              sub={critAlerts>0?`${critAlerts} critical`:"No critical alerts"}
              status={critAlerts>0?"red":(b.warnings?.length||0)>0?"amber":"green"}/>
            <StatMetric label="Survival Est." value={b.survivalProb?`${b.survivalProb}%`:"—"}
              sub={`Yield risk: ${b.yieldLossPrediction||"0%"}`}
              status={parseFloat(b.survivalProb||100)>=85?"green":"amber"}/>
            <StatMetric label="Pond Load" value={`${capacity.loadPct}%`}
              sub={capacity.recommendation}
              status={capacity.status==="critical"?"red":capacity.status==="warn"?"amber":"green"}/>
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT 8 cols ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Water Quality Diagnostics */}
            <Card
              title="Water Quality Diagnostics"
              icon={Droplets} iconColor="text-blue-500"
              right={<>
                <span className={`text-[11px] font-bold ${wqStatus==="ok"?"text-green-600":wqStatus==="warn"?"text-amber-600":"text-red-600"}`}>{wqLabel}</span>
                <Badge status={wqStatus} label={`${wqScore??"—"} / 100`}/>
              </>}>
              <div className="px-1">
                <ParamRow label="Dissolved O₂" value={sd.do}      unit="mg/L" icon={Wind}        {...paramScores.do}       min={0}  max={ranges.doMax||12} opt={ranges.doOpt}   />
                <ParamRow label="Temperature"   value={sd.temp}    unit="°C"   icon={Thermometer}  {...paramScores.temp}     min={15} max={42}               opt={ranges.tempOpt} />
                <ParamRow label="pH Level"       value={sd.ph}      unit="pH"   icon={Droplets}     {...paramScores.ph}       min={4}  max={11}               opt={ranges.phOpt}   />
                <ParamRow label="Ammonia NH₃"   value={sd.ammonia} unit="ppm"  icon={FlaskConical} {...paramScores.ammonia}  min={0}  max={1.2}              opt={0.05}           />
                <ParamRow label="Salinity"       value={sd.salinity}unit="ppt"  icon={Waves}        {...paramScores.salinity} min={0}  max={40}               opt={ranges.salinityOpt}/>
              </div>
              {/* WQ bar */}
              <div className="px-1 pt-4 mt-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-28 shrink-0">Composite WQ</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{width:`${wqScore||0}%`, background:(wqScore||0)>=70?GREEN:(wqScore||0)>=50?"#f59e0b":"#ef4444"}}/>
                  </div>
                  <span className="text-sm font-bold text-gray-700 tabular-nums w-8 text-right">{wqScore??"—"}</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5">DO (35%) · Ammonia (20%) · pH (20%) · Temp (20%) · Salinity (5%)</p>
              </div>
            </Card>

            {/* Stress + Disease side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card title="Biological Stress Signals" icon={HeartPulse} iconColor="text-red-500"
                right={<span className={`text-[11px] font-bold ${stress.length===0?"text-green-600":stress.some(s=>s.severity==="critical")?"text-red-600":"text-amber-600"}`}>
                  {stress.length===0?"All Clear":`${stress.length} Signal${stress.length>1?"s":""}`}
                </span>}>
                {stress.length>0 ? stress.map((s,i)=><StressRow key={i} signal={s}/>)
                  : <div className="text-center py-8">
                      <CheckCircle2 size={28} className="mx-auto mb-2 text-green-400"/>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">No Active Stress Indicators</p>
                      <p className="text-[10px] text-gray-300 mt-1">{species} within normal parameters</p>
                    </div>
                }
              </Card>

              <Card title="Disease Risk Assessment" icon={Bug} iconColor="text-violet-500"
                right={<span className="text-[10px] text-gray-400 font-semibold">Environment-derived</span>}>
                <div className="space-y-0">
                  {diseases.map((r,i)=><DiseaseRow key={i} risk={r}/>)}
                </div>
                <p className="text-[9px] text-gray-300 pt-3 mt-2 border-t border-gray-100">
                  Derived from DO, temp, ammonia, salinity. Not a substitute for pathogen testing.
                </p>
              </Card>
            </div>

            {/* DO Crash + Oxygen Budget side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card title="DO Crash Predictor" icon={BatteryWarning} iconColor="text-amber-500">
                <div className="flex items-end gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Time to Critical</p>
                    <p className={`text-4xl font-bold tracking-tight
                      ${doCrash.risk==="crash"||doCrash.risk==="high"?"text-red-600":doCrash.risk==="moderate"?"text-amber-600":"text-green-600"}`}>
                      {doCrash.hoursToMin!=null?`${doCrash.hoursToMin}h`:"—"}
                    </p>
                  </div>
                  <div className="flex-1 pb-1">
                    <p className={`text-[11px] font-bold uppercase
                      ${doCrash.risk==="crash"||doCrash.risk==="high"?"text-red-600":doCrash.risk==="moderate"?"text-amber-600":"text-green-600"}`}>
                      {doCrash.risk==="crash"?"Below safe limit":doCrash.risk==="high"?"HIGH RISK — Act now":doCrash.risk==="moderate"?"Monitor closely":"Safe"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{doCrash.label}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                  {[
                    {label:"Current DO",   val:`${sd.do??"—"} mg/L`},
                    {label:"Safe Min",      val:`${ranges.doMin} mg/L`},
                    {label:"Temp Effect",   val:sd.temp?`${sd.temp>28?"+":""}${((sd.temp-28)*0.08*100).toFixed(0)}%`:"—"},
                  ].map(({label,val})=>(
                    <div key={label}>
                      <p className="text-[9px] text-gray-400 uppercase font-bold">{label}</p>
                      <p className="text-sm font-bold text-gray-700">{val}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Oxygen Budget" icon={Cpu} iconColor="text-blue-500">
                <OxygenBudgetPanel budget={budget} sd={sd} ranges={ranges}/>
              </Card>
            </div>
          </div>

          {/* ── RIGHT 4 cols ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* 6-Hour Risk Forecast */}
            <Card title="6-Hour Risk Forecast" icon={Radio} iconColor="text-blue-500">
              <ForecastBars points={forecast}/>
              <p className="text-[9px] text-gray-400 mt-3">
                Projected risk based on DO trend, temperature, and ammonia rate of change.
              </p>
            </Card>

            {/* Mortality Risk */}
            <Card title="Mortality Risk" icon={ShieldAlert} iconColor="text-gray-500"
              right={<Badge status={isHighRisk?"critical":parseFloat(mortalityRisk)>8?"warn":"ok"}
                label={isHighRisk?"High Alert":parseFloat(mortalityRisk)>8?"Elevated":"Low Risk"}/>}>
              <div className="flex items-end gap-3 mb-4">
                <p className={`text-5xl font-bold tracking-tight
                  ${isHighRisk?"text-red-600":parseFloat(mortalityRisk)>8?"text-amber-600":"text-green-600"}`}>
                  {mortalityRisk}%
                </p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase pb-1">12-hour window</p>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div className="absolute h-2 bg-amber-100" style={{left:"20%",width:"40%"}}/>
                <div className="absolute h-2 bg-red-100"   style={{left:"60%",width:"40%"}}/>
                <div className={`absolute h-2 w-1 -ml-0.5 rounded-full transition-all ${isHighRisk?"bg-red-500":"bg-green-500"}`}
                  style={{left:`${Math.min(99,parseFloat(mortalityRisk))}%`}}/>
              </div>
              <div className="space-y-2">
                {[
                  {label:"Feed Efficiency", value:b.feedEfficiency||"—"},
                  {label:"Survival Est.",    value:b.survivalProb?`${b.survivalProb}%`:"—"},
                  {label:"Yield Risk",       value:b.yieldLossPrediction||"0%"},
                  {label:"Risk Level",       value:b.riskLevel||"Low"},
                ].map(({label,value})=>(
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
                    <span className="text-[11px] font-bold text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Carrying Capacity */}
            <Card title="Carrying Capacity" icon={Anchor} iconColor="text-gray-500">
              <div className="flex items-end gap-3 mb-3">
                <span className={`text-4xl font-bold
                  ${capacity.status==="critical"?"text-red-600":capacity.status==="warn"?"text-amber-600":"text-green-600"}`}>
                  {capacity.loadPct}%
                </span>
                <span className="text-[10px] text-gray-400 font-semibold uppercase pb-1">of max biomass load</span>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full mb-2 overflow-hidden">
                <div className="absolute h-3 bg-amber-100" style={{left:"70%",width:"15%"}}/>
                <div className="absolute h-3 bg-red-100"   style={{left:"85%",width:"15%"}}/>
                <div className={`h-3 rounded-full transition-all ${capacity.status==="critical"?"bg-red-400":capacity.status==="warn"?"bg-amber-400":"bg-green-500"}`}
                  style={{width:`${capacity.loadPct}%`}}/>
              </div>
              <div className="flex justify-between text-[9px] font-semibold text-gray-400 uppercase mb-4">
                <span>0%</span><span className="text-amber-400">70%</span><span className="text-red-400">85%</span><span>100%</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <p className="text-[10px] text-gray-600 font-medium">{capacity.recommendation}</p>
                <p className="text-[9px] text-gray-400 mt-1">DO support index: {capacity.doSupport}/100</p>
              </div>
            </Card>

          </div>
        </div>

        {/* ── Treatment Console ─────────────────────────────────────────────── */}
        <div className="max-w-[1600px] mx-auto mt-5">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Zap size={13} className="text-yellow-500"/> Treatment Console — Intervention Engine
              </h3>
              <Badge
                status={treatments.some(t=>t.urgency==="immediate")?"critical":treatments.length>0?"warn":"ok"}
                label={treatments.some(t=>t.urgency==="immediate")?"Immediate Action Required":treatments.length>0?`${treatments.length} Treatment${treatments.length>1?"s":""} Recommended`:"No Interventions Required"}
              />
            </div>

            <div className="p-5">
              {treatments.length>0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {treatments.map(t=><TreatmentCard key={t.id} treatment={t} onExecute={handleExecute}/>)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldCheck size={32} className="mx-auto mb-3 text-green-400"/>
                  <p className="text-[12px] font-bold uppercase tracking-wide text-gray-400">No Emergency Actions Required</p>
                  <p className="text-[10px] text-gray-300 mt-1.5">All biological parameters within safe thresholds for {species}</p>
                </div>
              )}
            </div>

            {(logs?.length||0)>0 && (
              <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={11} className="text-gray-400"/>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Recent Interventions</p>
                </div>
                <div className="flex gap-6 overflow-x-auto">
                  {(logs||[]).slice(0,5).map((l,i)=>(
                    <div key={l.id||i} className="flex items-center gap-2 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"/>
                      <p className="text-[10px] text-gray-600 font-semibold">{l.type}</p>
                      <p className="text-[9px] text-gray-400">{l.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}