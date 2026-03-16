import React, { useState, useEffect } from "react";
import { usePond } from "../context/PondContext";
import {
  Building2, Fish, Droplets, Leaf, IndianRupee, Bell,
  ChevronDown, ChevronUp, Save, Check, AlertCircle,
  Loader, RefreshCw, Pencil
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE     = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("fathom_token");

const SPECIES  = ["Vannamei","Monodon","Tilapia","Catfish","Rohu","Milkfish","Carp","Others"];
const CULTURE  = ["Extensive","Semi-intensive","Intensive"];
const WATER_T  = ["Freshwater","Brackish water","Marine"];
const POND_T   = ["Earthen","Lined","Concrete"];
const SOIL_T   = ["Clay","Sandy","Loamy","Mixed"];
const AERATION = ["Paddle wheel","Air diffuser","Both","None"];
const FEED_M   = ["Manual","Auto feeder","Broadcast","Tray feeding"];

// ─── Reusable field components ────────────────────────────────────────────────
function Label({ children }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
      {children}
    </label>
  );
}

function Input({ name, value, onChange, type = "text", placeholder, min, step, disabled }) {
  return (
    <input
      name={name} type={type} value={value ?? ""} onChange={onChange}
      placeholder={placeholder} min={min} step={step} disabled={disabled}
      className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
        text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-600
        focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function Select({ name, value, onChange, options }) {
  return (
    <select name={name} value={value ?? ""} onChange={onChange}
      className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
        text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white transition-colors">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ name, value, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div onClick={() => onChange({ target: { name, type: "checkbox", checked: !value } })}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-green-600" : "bg-slate-300"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
      </div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </label>
  );
}

function Row({ children }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }) {
  return <div><Label>{label}</Label>{children}</div>;
}

// ─── Accordion Section wrapper ────────────────────────────────────────────────
function Section({ icon, title, color, isOpen, onToggle, children, saving, saved, error, onSave }) {
  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">

      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
              <Check size={11} /> Saved
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase">
              <AlertCircle size={11} /> Error
            </span>
          )}
          {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="border-t border-slate-100">
          <div className="p-6 space-y-4">
            {children}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-between">
            {error && (
              <p className="text-[10px] font-bold text-red-500">{error}</p>
            )}
            {!error && <div />}
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white
                px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving
                ? <><Loader size={12} className="animate-spin" /> Saving…</>
                : <><Save size={12} /> Save Changes</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Setup Page ──────────────────────────────────────────────────────────
export default function Setup() {
  const { activePond, fetchAllPonds } = usePond();

  // Which accordion is open
  const [open, setOpen] = useState(null);

  // Per-section form state
  const [forms, setForms] = useState({});

  // Per-section UI state
  const [sectionState, setSectionState] = useState({});

  // Populate form when activePond loads
  useEffect(() => {
    if (!activePond) return;
    setForms({
      farm:     {
        farmName: activePond.farmName, ownerName: activePond.ownerName,
        location: activePond.location, farmSize: activePond.farmSize,
        farmSizeUnit: activePond.farmSizeUnit || "acres",
        numPonds: activePond.numPonds, cultureType: activePond.cultureType || "Semi-intensive",
        waterType: activePond.waterType || "Freshwater",
        label: activePond.label, pondArea: activePond.pondArea,
        pondAreaUnit: activePond.pondAreaUnit || "acres",
        depthMin: activePond.depthMin, depthMax: activePond.depthMax,
        pondType: activePond.pondType || "Earthen",
        waterCapacity: activePond.waterCapacity, soilType: activePond.soilType || "Clay",
      },
      stocking: {
        species: activePond.species || "Vannamei",
        seedSource: activePond.seedSource, stockingDensity: activePond.stockingDensity,
        fishCount: activePond.fishCount, stockingDate: activePond.stockingDate
          ? new Date(activePond.stockingDate).toISOString().split("T")[0] : "",
        seedSize: activePond.seedSize, avgSeedWeight: activePond.avgSeedWeight,
        survivalEstimate: activePond.survivalEstimate || 85,
      },
      water:    {
        temp: activePond.temp, ph: activePond.ph, do: activePond.do,
        salinity: activePond.salinity, ammonia: activePond.ammonia,
        nitrite: activePond.nitrite, alkalinity: activePond.alkalinity,
        transparency: activePond.transparency,
      },
      feed:     {
        feedBrand: activePond.feedBrand, feedProtein: activePond.feedProtein,
        feedingMethod: activePond.feedingMethod || "Manual",
        feedingFrequency: activePond.feedingFrequency || 4,
        feedingTray: activePond.feedingTray || false,
        fcrTarget: activePond.fcrTarget || 1.5,
        biomassEstimate: activePond.biomassEstimate,
      },
      finance:  {
        seedCost: activePond.seedCost, feedCostPerKg: activePond.feedCostPerKg,
        laborCost: activePond.laborCost, electricityCost: activePond.electricityCost,
        medicineCost: activePond.medicineCost, expectedPrice: activePond.expectedPrice,
        targetHarvestWeight: activePond.targetHarvestWeight,
        targetHarvestDays: activePond.targetHarvestDays || 120,
      },
      alerts:   {
        alertDo: activePond.alertDo || 3.5,
        alertPhMin: activePond.alertPhMin || 7.0,
        alertPhMax: activePond.alertPhMax || 9.0,
        alertAmmonia: activePond.alertAmmonia || 0.1,
        notifyMethod: activePond.notifyMethod || "App",
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePond?._id]); // only re-populate when pond changes, not every render

  const toggle = (key) => setOpen(prev => prev === key ? null : key);

  const handleChange = (section, e) => {
    const { name, value, type, checked } = e.target;
    setForms(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleSave = async (section) => {
    setSectionState(prev => ({ ...prev, [section]: { saving: true, saved: false, error: "" } }));
    try {
      const token = getToken();
      const res   = await fetch(`${BASE}/pond/${activePond._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(forms[section]),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to save.");

      setSectionState(prev => ({ ...prev, [section]: { saving: false, saved: true, error: "" } }));
      fetchAllPonds(); // re-sync context

      // Clear "Saved" tick after 3s
      setTimeout(() => {
        setSectionState(prev => ({ ...prev, [section]: { ...prev[section], saved: false } }));
      }, 3000);
    } catch (err) {
      setSectionState(prev => ({ ...prev, [section]: { saving: false, saved: false, error: err.message } }));
    }
  };

  const ss = (key) => sectionState[key] || {};
  const f  = (key) => forms[key] || {};
  const ch = (key) => (e) => handleChange(key, e);

  if (!activePond) {
    return (
      <div className="p-10 flex items-center justify-center min-h-full">
        <div className="text-center">
          <RefreshCw size={24} className="text-slate-300 mx-auto mb-3 animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Loading pond data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-5 bg-[#f8f9fa] min-h-full font-sans">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <nav className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">
            Settings / Pond Configuration
          </nav>
          <h1 className="text-2xl font-light text-slate-800 tracking-tight">
            Setup: <span className="font-semibold text-slate-900">{activePond.label}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-sm">
          <Pencil size={13} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Edit Mode
          </span>
        </div>
      </div>

      {/* ── Accordions ── */}
      <div className="space-y-3">

        {/* 1. Farm & Pond Details */}
        <Section
          icon={<Building2 size={16} className="text-white" />}
          title="Farm & Pond Details"
          color="bg-slate-700"
          isOpen={open === "farm"}
          onToggle={() => toggle("farm")}
          saving={ss("farm").saving}
          saved={ss("farm").saved}
          error={ss("farm").error}
          onSave={() => handleSave("farm")}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Farm Info</p>
          <Row>
            <Field label="Farm Name"><Input name="farmName" value={f("farm").farmName} onChange={ch("farm")} placeholder="e.g. Blue Ocean Farm" /></Field>
            <Field label="Owner Name"><Input name="ownerName" value={f("farm").ownerName} onChange={ch("farm")} placeholder="Full name" /></Field>
          </Row>
          <Field label="Location"><Input name="location" value={f("farm").location} onChange={ch("farm")} placeholder="District, State" /></Field>
          <Row>
            <Field label="Farm Size"><Input name="farmSize" value={f("farm").farmSize} onChange={ch("farm")} type="number" min="0" /></Field>
            <Field label="Unit"><Select name="farmSizeUnit" value={f("farm").farmSizeUnit} onChange={ch("farm")} options={["acres","hectares","m²"]} /></Field>
          </Row>
          <Row>
            <Field label="Culture Type"><Select name="cultureType" value={f("farm").cultureType} onChange={ch("farm")} options={CULTURE} /></Field>
            <Field label="Water Type"><Select name="waterType" value={f("farm").waterType} onChange={ch("farm")} options={WATER_T} /></Field>
          </Row>

          <div className="border-t border-slate-100 pt-4 mt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Pond Details</p>
            <Field label="Pond Name / ID"><Input name="label" value={f("farm").label} onChange={ch("farm")} placeholder="e.g. Pond A1" /></Field>
            <Row>
              <Field label="Pond Area"><Input name="pondArea" value={f("farm").pondArea} onChange={ch("farm")} type="number" min="0" /></Field>
              <Field label="Unit"><Select name="pondAreaUnit" value={f("farm").pondAreaUnit} onChange={ch("farm")} options={["acres","hectares","m²"]} /></Field>
            </Row>
            <Row>
              <Field label="Min Depth (m)"><Input name="depthMin" value={f("farm").depthMin} onChange={ch("farm")} type="number" step="0.1" min="0" /></Field>
              <Field label="Max Depth (m)"><Input name="depthMax" value={f("farm").depthMax} onChange={ch("farm")} type="number" step="0.1" min="0" /></Field>
            </Row>
            <Row>
              <Field label="Pond Type"><Select name="pondType" value={f("farm").pondType} onChange={ch("farm")} options={POND_T} /></Field>
              <Field label="Soil Type"><Select name="soilType" value={f("farm").soilType} onChange={ch("farm")} options={SOIL_T} /></Field>
            </Row>
          </div>
        </Section>

        {/* 2. Stocking Info */}
        <Section
          icon={<Fish size={16} className="text-white" />}
          title="Stocking Information"
          color="bg-blue-600"
          isOpen={open === "stocking"}
          onToggle={() => toggle("stocking")}
          saving={ss("stocking").saving}
          saved={ss("stocking").saved}
          error={ss("stocking").error}
          onSave={() => handleSave("stocking")}
        >
          <Row>
            <Field label="Species"><Select name="species" value={f("stocking").species} onChange={ch("stocking")} options={SPECIES} /></Field>
            <Field label="Seed Source / Hatchery"><Input name="seedSource" value={f("stocking").seedSource} onChange={ch("stocking")} placeholder="Hatchery name" /></Field>
          </Row>
          <Row>
            <Field label="Stocking Density (per m²)"><Input name="stockingDensity" value={f("stocking").stockingDensity} onChange={ch("stocking")} type="number" min="0" /></Field>
            <Field label="Total Stocked Count"><Input name="fishCount" value={f("stocking").fishCount} onChange={ch("stocking")} type="number" min="0" /></Field>
          </Row>
          <Row>
            <Field label="Stocking Date"><Input name="stockingDate" value={f("stocking").stockingDate} onChange={ch("stocking")} type="date" /></Field>
            <Field label="Seed Size / Stage"><Input name="seedSize" value={f("stocking").seedSize} onChange={ch("stocking")} placeholder="e.g. PL12" /></Field>
          </Row>
          <Row>
            <Field label="Avg Seed Weight (g)"><Input name="avgSeedWeight" value={f("stocking").avgSeedWeight} onChange={ch("stocking")} type="number" step="0.001" min="0" /></Field>
            <Field label="Survival Estimate (%)"><Input name="survivalEstimate" value={f("stocking").survivalEstimate} onChange={ch("stocking")} type="number" min="0" max="100" /></Field>
          </Row>
        </Section>

        {/* 3. Water Quality Baseline */}
        <Section
          icon={<Droplets size={16} className="text-white" />}
          title="Water Quality Baseline"
          color="bg-cyan-600"
          isOpen={open === "water"}
          onToggle={() => toggle("water")}
          saving={ss("water").saving}
          saved={ss("water").saved}
          error={ss("water").error}
          onSave={() => handleSave("water")}
        >
          <div className="bg-blue-50 border border-blue-200 px-3 py-2 text-[10px] font-bold text-blue-700 mb-2">
            These values update the live sensor readings shown on your dashboard.
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "temp",         label: "Temperature",      unit: "°C",   step: "0.1"  },
              { name: "ph",           label: "pH",               unit: "pH",   step: "0.01" },
              { name: "do",           label: "Dissolved Oxygen", unit: "mg/L", step: "0.1"  },
              { name: "salinity",     label: "Salinity",         unit: "ppt",  step: "0.1"  },
              { name: "ammonia",      label: "Ammonia (TAN)",    unit: "ppm",  step: "0.01" },
              { name: "nitrite",      label: "Nitrite",          unit: "ppm",  step: "0.01" },
              { name: "alkalinity",   label: "Alkalinity",       unit: "mg/L", step: "1"    },
              { name: "transparency", label: "Transparency",     unit: "cm",   step: "1"    },
            ].map(({ name, label, unit, step }) => (
              <div key={name}>
                <Label>{label} <span className="text-slate-300 normal-case font-bold">({unit})</span></Label>
                <Input name={name} value={f("water")[name]} onChange={ch("water")} type="number" step={step} min="0" placeholder="0" />
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Feed & Management */}
        <Section
          icon={<Leaf size={16} className="text-white" />}
          title="Feed & Management"
          color="bg-green-700"
          isOpen={open === "feed"}
          onToggle={() => toggle("feed")}
          saving={ss("feed").saving}
          saved={ss("feed").saved}
          error={ss("feed").error}
          onSave={() => handleSave("feed")}
        >
          <Row>
            <Field label="Feed Brand"><Input name="feedBrand" value={f("feed").feedBrand} onChange={ch("feed")} placeholder="e.g. CP, Growel" /></Field>
            <Field label="Feed Protein (%)"><Input name="feedProtein" value={f("feed").feedProtein} onChange={ch("feed")} type="number" min="0" max="100" placeholder="35" /></Field>
          </Row>
          <Row>
            <Field label="Feeding Method"><Select name="feedingMethod" value={f("feed").feedingMethod} onChange={ch("feed")} options={FEED_M} /></Field>
            <Field label="Frequency (times/day)"><Input name="feedingFrequency" value={f("feed").feedingFrequency} onChange={ch("feed")} type="number" min="1" max="12" /></Field>
          </Row>
          <Row>
            <Field label="Target FCR"><Input name="fcrTarget" value={f("feed").fcrTarget} onChange={ch("feed")} type="number" step="0.1" min="0.5" placeholder="1.5" /></Field>
            <Field label="Current Biomass Est. (kg)"><Input name="biomassEstimate" value={f("feed").biomassEstimate} onChange={ch("feed")} type="number" min="0" placeholder="Optional" /></Field>
          </Row>
          <Toggle name="feedingTray" value={f("feed").feedingTray} onChange={ch("feed")} label="Using feeding trays for feed assessment" />
        </Section>

        {/* 5. Financial Inputs */}
        <Section
          icon={<IndianRupee size={16} className="text-white" />}
          title="Financial Inputs"
          color="bg-emerald-600"
          isOpen={open === "finance"}
          onToggle={() => toggle("finance")}
          saving={ss("finance").saving}
          saved={ss("finance").saved}
          error={ss("finance").error}
          onSave={() => handleSave("finance")}
        >
          <div className="bg-amber-50 border border-amber-200 px-3 py-2 text-[10px] font-bold text-amber-700 mb-2">
            All values in ₹. Changes will immediately update the financial forecast on your dashboard.
          </div>
          <Row>
            <Field label="Seed Cost (₹ per 1000)"><Input name="seedCost" value={f("finance").seedCost} onChange={ch("finance")} type="number" min="0" placeholder="350" /></Field>
            <Field label="Feed Cost (₹ per kg)"><Input name="feedCostPerKg" value={f("finance").feedCostPerKg} onChange={ch("finance")} type="number" min="0" placeholder="70" /></Field>
          </Row>
          <Row>
            <Field label="Labour Cost (₹/month)"><Input name="laborCost" value={f("finance").laborCost} onChange={ch("finance")} type="number" min="0" placeholder="12000" /></Field>
            <Field label="Electricity Cost (₹/month)"><Input name="electricityCost" value={f("finance").electricityCost} onChange={ch("finance")} type="number" min="0" placeholder="6000" /></Field>
          </Row>
          <Row>
            <Field label="Medicine Cost (₹/cycle)"><Input name="medicineCost" value={f("finance").medicineCost} onChange={ch("finance")} type="number" min="0" placeholder="20000" /></Field>
            <Field label="Expected Selling Price (₹/kg)"><Input name="expectedPrice" value={f("finance").expectedPrice} onChange={ch("finance")} type="number" min="0" placeholder="420" /></Field>
          </Row>
          <Row>
            <Field label="Target Harvest Weight (g)"><Input name="targetHarvestWeight" value={f("finance").targetHarvestWeight} onChange={ch("finance")} type="number" min="0" placeholder="22" /></Field>
            <Field label="Target Culture Days"><Input name="targetHarvestDays" value={f("finance").targetHarvestDays} onChange={ch("finance")} type="number" min="1" placeholder="120" /></Field>
          </Row>
        </Section>

        {/* 6. Alert Thresholds */}
        <Section
          icon={<Bell size={16} className="text-white" />}
          title="Alert Thresholds"
          color="bg-red-600"
          isOpen={open === "alerts"}
          onToggle={() => toggle("alerts")}
          saving={ss("alerts").saving}
          saved={ss("alerts").saved}
          error={ss("alerts").error}
          onSave={() => handleSave("alerts")}
        >
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-500 mb-2">
            You will be alerted when sensor readings cross these limits.
          </div>
          <Row>
            <Field label="DO Alert Below (mg/L)">
              <Input name="alertDo" value={f("alerts").alertDo} onChange={ch("alerts")} type="number" step="0.1" min="0" />
            </Field>
            <Field label="Ammonia Alert Above (ppm)">
              <Input name="alertAmmonia" value={f("alerts").alertAmmonia} onChange={ch("alerts")} type="number" step="0.01" min="0" />
            </Field>
          </Row>
          <Row>
            <Field label="pH Alert Min">
              <Input name="alertPhMin" value={f("alerts").alertPhMin} onChange={ch("alerts")} type="number" step="0.1" min="0" />
            </Field>
            <Field label="pH Alert Max">
              <Input name="alertPhMax" value={f("alerts").alertPhMax} onChange={ch("alerts")} type="number" step="0.1" min="0" />
            </Field>
          </Row>
          <Field label="Notification Method">
            <div className="grid grid-cols-3 gap-3 mt-1">
              {["App","SMS","Both"].map(opt => (
                <label key={opt} className={`flex items-center justify-center gap-2 border p-3 cursor-pointer transition-all
                  ${f("alerts").notifyMethod === opt ? "border-green-600 bg-green-50 text-green-800" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  <input type="radio" name="notifyMethod" value={opt}
                    checked={f("alerts").notifyMethod === opt}
                    onChange={ch("alerts")} className="accent-green-700" />
                  <span className="text-xs font-black uppercase tracking-wider">{opt}</span>
                </label>
              ))}
            </div>
          </Field>
        </Section>

      </div>
    </div>
  );
}