// frontend/src/pages/PondSetupWizard.jsx
import { useState } from "react";
import { usePond } from "../context/PondContext";
import { useAuth } from "../context/AuthContext";
import {
  Building2, Fish, Waves, Zap, Droplets,
  Leaf, IndianRupee, Settings, Bell,
  ChevronRight, ChevronLeft, Check, Loader,
  AlertCircle, Info
} from "lucide-react";

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Farm Info",       icon: Building2  },
  { id: 2, label: "Pond Details",    icon: Waves      },
  { id: 3, label: "Stocking",        icon: Fish       },
  { id: 4, label: "Infrastructure",  icon: Zap        },
  { id: 5, label: "Water Quality",   icon: Droplets   },
  { id: 6, label: "Feed & Mgmt",     icon: Leaf       },
  { id: 7, label: "Financials",      icon: IndianRupee},
  { id: 8, label: "Monitoring",      icon: Settings   },
  { id: 9, label: "Alerts",          icon: Bell       },
];

// ─── Initial form state (all 9 steps) ─────────────────────────────────────────
const INITIAL = {
  // Step 1
  farmName: "", ownerName: "", location: "", farmSize: "",
  farmSizeUnit: "acres", numPonds: 1, cultureType: "Semi-intensive", waterType: "Freshwater",
  // Step 2
  label: "", pondArea: "", pondAreaUnit: "acres", depthMin: "", depthMax: "",
  pondType: "Earthen", waterCapacity: "", soilType: "Clay",
  // Step 3
  species: "Vannamei", seedSource: "", stockingDensity: "", stockingDate: "",
  avgSeedWeight: "", seedSize: "", survivalEstimate: 90, fishCount: "",
  // Step 4
  waterSource: "Borewell", waterExchange: "", aerationType: "Paddle wheel",
  numAerators: "", backupPower: false, drainageSystem: "",
  // Step 5
  temp: "", ph: "", do: "", salinity: "", ammonia: "", nitrite: "", alkalinity: "", transparency: "",
  // Step 6
  feedBrand: "", feedProtein: "", feedingMethod: "Manual", feedingFrequency: 4,
  feedingTray: false, fcrTarget: 1.5, biomassEstimate: "",
  // Step 7
  seedCost: "", feedCostPerKg: "", laborCost: "", electricityCost: "",
  medicineCost: "", targetHarvestWeight: "", targetHarvestDays: 120, expectedPrice: "",
  // Step 8
  monitoringMode: "Manual data entry", loggingFrequency: "Daily logs",
  // Step 9
  alertDo: 3.5, alertPhMin: 7.0, alertPhMax: 9.0, alertAmmonia: 0.1, notifyMethod: "App",
};

// ─── Reusable field components ────────────────────────────────────────────────
function Label({ children, hint }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{children}</label>
      {hint && (
        <span title={hint} className="text-slate-300 cursor-help"><Info size={11} /></span>
      )}
    </div>
  );
}

function Input({ name, value, onChange, type = "text", placeholder, min, step }) {
  return (
    <input
      name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder} min={min} step={step}
      className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
        text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-600
        focus:bg-white transition-colors"
    />
  );
}

function Select({ name, value, onChange, options }) {
  return (
    <select
      name={name} value={value} onChange={onChange}
      className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
        text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white transition-colors"
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

function Toggle({ name, value, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange({ target: { name, type: "checkbox", checked: !value } })}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? "bg-green-600" : "bg-slate-300"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
      </div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </label>
  );
}

function Row({ children }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Field({ children, label, hint }) {
  return (
    <div>
      <Label hint={hint}>{label}</Label>
      {children}
    </div>
  );
}

function OptionalBadge() {
  return <span className="ml-1 text-[9px] font-bold text-slate-300 uppercase">(optional)</span>;
}

function WaterQualityField({ label, name, value, onChange, unit, hint, placeholder = "Unknown" }) {
  return (
    <div>
      <Label hint={hint}>{label} <OptionalBadge /></Label>
      <div className="relative">
        <Input name={name} value={value} onChange={onChange} type="number" step="0.01" placeholder={placeholder} />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Step content renderers ───────────────────────────────────────────────────

function Step1({ form, onChange }) {
  return (
    <div className="space-y-4">
      <Row>
        <Field label="Farm Name">
          <Input name="farmName" value={form.farmName} onChange={onChange} placeholder="e.g. Blue Ocean Farm" />
        </Field>
        <Field label="Owner / Operator Name">
          <Input name="ownerName" value={form.ownerName} onChange={onChange} placeholder="Full name" />
        </Field>
      </Row>
      <Field label="Location" hint="District, State or GPS coordinates">
        <Input name="location" value={form.location} onChange={onChange} placeholder="e.g. Nellore, Andhra Pradesh" />
      </Field>
      <Row>
        <Field label="Total Farm Size">
          <Input name="farmSize" value={form.farmSize} onChange={onChange} type="number" min="0" placeholder="0" />
        </Field>
        <Field label="Unit">
          <Select name="farmSizeUnit" value={form.farmSizeUnit} onChange={onChange}
            options={["acres", "hectares", "m²"]} />
        </Field>
      </Row>
      <Row>
        <Field label="Number of Ponds" hint="Total ponds on this farm">
          <Input name="numPonds" value={form.numPonds} onChange={onChange} type="number" min="1" />
        </Field>
        <Field label="Culture Type">
          <Select name="cultureType" value={form.cultureType} onChange={onChange}
            options={["Extensive", "Semi-intensive", "Intensive"]} />
        </Field>
      </Row>
      <Field label="Water Type" hint="Determines water chemistry ranges and species suitability">
        <Select name="waterType" value={form.waterType} onChange={onChange}
          options={["Freshwater", "Brackish water", "Marine"]} />
      </Field>
    </div>
  );
}

function Step2({ form, onChange }) {
  return (
    <div className="space-y-4">
      <Field label="Pond Name / ID">
        <Input name="label" value={form.label} onChange={onChange} placeholder="e.g. Pond Alpha, Unit A1" />
      </Field>
      <Row>
        <Field label="Pond Area">
          <Input name="pondArea" value={form.pondArea} onChange={onChange} type="number" min="0" placeholder="0" />
        </Field>
        <Field label="Unit">
          <Select name="pondAreaUnit" value={form.pondAreaUnit} onChange={onChange}
            options={["acres", "hectares", "m²"]} />
        </Field>
      </Row>
      <Row>
        <Field label="Min Depth (m)" hint="Shallow end depth">
          <Input name="depthMin" value={form.depthMin} onChange={onChange} type="number" min="0" step="0.1" placeholder="0.5" />
        </Field>
        <Field label="Max Depth (m)" hint="Deep end depth">
          <Input name="depthMax" value={form.depthMax} onChange={onChange} type="number" min="0" step="0.1" placeholder="1.5" />
        </Field>
      </Row>
      <Row>
        <Field label="Pond Type">
          <Select name="pondType" value={form.pondType} onChange={onChange}
            options={["Earthen", "Lined", "Concrete"]} />
        </Field>
        <Field label="Water Capacity (m³)" hint="Approx. volume">
          <Input name="waterCapacity" value={form.waterCapacity} onChange={onChange} type="number" min="0" placeholder="Optional" />
        </Field>
      </Row>
      <Field label="Bottom Soil Type" hint="Affects oxygen prediction, ammonia buildup and water retention">
        <Select name="soilType" value={form.soilType} onChange={onChange}
          options={["Clay", "Sandy", "Loamy", "Mixed"]} />
      </Field>
    </div>
  );
}

function Step3({ form, onChange }) {
  return (
    <div className="space-y-4">
      <Row>
        <Field label="Species">
          <Select name="species" value={form.species} onChange={onChange}
            options={["Vannamei","Monodon","Tilapia","Catfish","Rohu","Milkfish","Carp","Others"]} />
        </Field>
        <Field label="Seed Source / Hatchery">
          <Input name="seedSource" value={form.seedSource} onChange={onChange} placeholder="Hatchery name" />
        </Field>
      </Row>
      <Row>
        <Field label="Stocking Density (per m²)" hint="Used for biomass prediction and feed calculation">
          <Input name="stockingDensity" value={form.stockingDensity} onChange={onChange} type="number" min="0" placeholder="e.g. 60" />
        </Field>
        <Field label="Total Stocked Count">
          <Input name="fishCount" value={form.fishCount} onChange={onChange} type="number" min="0" placeholder="e.g. 50000" />
        </Field>
      </Row>
      <Row>
        <Field label="Stocking Date">
          <Input name="stockingDate" value={form.stockingDate} onChange={onChange} type="date" />
        </Field>
        <Field label="Seed Size / Stage" hint="e.g. PL12, PL15, Fingerling">
          <Input name="seedSize" value={form.seedSize} onChange={onChange} placeholder="e.g. PL12" />
        </Field>
      </Row>
      <Row>
        <Field label="Avg. Seed Weight (g)">
          <Input name="avgSeedWeight" value={form.avgSeedWeight} onChange={onChange} type="number" step="0.01" min="0" placeholder="e.g. 0.001" />
        </Field>
        <Field label="Survival Rate Estimate (%)" hint="Used for disease risk and yield projection">
          <Input name="survivalEstimate" value={form.survivalEstimate} onChange={onChange} type="number" min="0" max="100" />
        </Field>
      </Row>
    </div>
  );
}

function Step4({ form, onChange }) {
  return (
    <div className="space-y-4">
      <Row>
        <Field label="Water Source">
          <Select name="waterSource" value={form.waterSource} onChange={onChange}
            options={["Borewell","Canal","River","Reservoir","Tidal","Mixed"]} />
        </Field>
        <Field label="Water Exchange System">
          <Input name="waterExchange" value={form.waterExchange} onChange={onChange} placeholder="e.g. 20% weekly" />
        </Field>
      </Row>
      <Row>
        <Field label="Aeration Type" hint="Used for oxygen modeling">
          <Select name="aerationType" value={form.aerationType} onChange={onChange}
            options={["Paddle wheel","Air diffuser","Both","None"]} />
        </Field>
        <Field label="Number of Aerators">
          <Input name="numAerators" value={form.numAerators} onChange={onChange} type="number" min="0" placeholder="0" />
        </Field>
      </Row>
      <Field label="Drainage System">
        <Input name="drainageSystem" value={form.drainageSystem} onChange={onChange} placeholder="e.g. Central drain, Sluice gate" />
      </Field>
      <div className="pt-1">
        <Toggle name="backupPower" value={form.backupPower} onChange={onChange}
          label="Backup power available (generator / UPS)" />
      </div>
    </div>
  );
}

function Step5({ form, onChange }) {
  return (
    <div className="space-y-1">
      <div className="bg-blue-50 border border-blue-200 px-3 py-2 mb-4 flex items-start gap-2">
        <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-[10px] font-bold text-blue-700">
          Enter current baseline readings if available. Leave blank or type 0 if unknown — you can update these anytime from the dashboard.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <WaterQualityField name="temp"         label="Temperature"         unit="°C"    value={form.temp}         onChange={onChange} hint="Optimal: 26–30°C for Vannamei" />
        <WaterQualityField name="ph"           label="pH"                  unit="pH"    value={form.ph}           onChange={onChange} hint="Optimal: 7.5–8.5" />
        <WaterQualityField name="do"           label="Dissolved Oxygen"    unit="mg/L"  value={form.do}           onChange={onChange} hint="Critical below 3.5 mg/L" />
        <WaterQualityField name="salinity"     label="Salinity"            unit="ppt"   value={form.salinity}     onChange={onChange} hint="Vannamei: 10–25 ppt" />
        <WaterQualityField name="ammonia"      label="Ammonia (TAN)"       unit="ppm"   value={form.ammonia}      onChange={onChange} hint="Alert above 0.1 ppm" />
        <WaterQualityField name="nitrite"      label="Nitrite"             unit="ppm"   value={form.nitrite}      onChange={onChange} />
        <WaterQualityField name="alkalinity"   label="Alkalinity"          unit="mg/L"  value={form.alkalinity}   onChange={onChange} hint="Optimal: 80–120 mg/L" />
        <WaterQualityField name="transparency" label="Transparency"        unit="cm"    value={form.transparency} onChange={onChange} hint="Secchi disk reading. Optimal: 25–40cm" />
      </div>
    </div>
  );
}

function Step6({ form, onChange }) {
  return (
    <div className="space-y-4">
      <Row>
        <Field label="Feed Brand">
          <Input name="feedBrand" value={form.feedBrand} onChange={onChange} placeholder="e.g. CP, Growel, Higashimaru" />
        </Field>
        <Field label="Feed Protein (%)" hint="Used for feed prediction">
          <Input name="feedProtein" value={form.feedProtein} onChange={onChange} type="number" min="0" max="100" placeholder="e.g. 35" />
        </Field>
      </Row>
      <Row>
        <Field label="Feeding Method">
          <Select name="feedingMethod" value={form.feedingMethod} onChange={onChange}
            options={["Manual","Auto feeder","Broadcast","Tray feeding"]} />
        </Field>
        <Field label="Feeding Frequency (times/day)">
          <Input name="feedingFrequency" value={form.feedingFrequency} onChange={onChange} type="number" min="1" max="12" />
        </Field>
      </Row>
      <Row>
        <Field label="Target FCR" hint="Feed Conversion Ratio. Lower is better. Typical: 1.2–1.8">
          <Input name="fcrTarget" value={form.fcrTarget} onChange={onChange} type="number" step="0.1" min="0.5" placeholder="1.5" />
        </Field>
        <Field label="Current Biomass Estimate (kg)" hint="Approx. total fish weight in pond now">
          <Input name="biomassEstimate" value={form.biomassEstimate} onChange={onChange} type="number" min="0" placeholder="Optional" />
        </Field>
      </Row>
      <div className="pt-1">
        <Toggle name="feedingTray" value={form.feedingTray} onChange={onChange}
          label="Using feeding trays for feed assessment" />
      </div>
    </div>
  );
}

function Step7({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 px-3 py-2 flex items-start gap-2">
        <Info size={13} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[10px] font-bold text-amber-700">
          All values in Indian Rupees (₹). Used for the profitability dashboard and financial forecasting.
        </p>
      </div>
      <Row>
        <Field label="Seed Cost (₹ per 1000)" hint="Cost of purchasing seeds/juveniles">
          <Input name="seedCost" value={form.seedCost} onChange={onChange} type="number" min="0" placeholder="e.g. 800" />
        </Field>
        <Field label="Feed Cost (₹ per kg)">
          <Input name="feedCostPerKg" value={form.feedCostPerKg} onChange={onChange} type="number" min="0" placeholder="e.g. 65" />
        </Field>
      </Row>
      <Row>
        <Field label="Labour Cost (₹/month)">
          <Input name="laborCost" value={form.laborCost} onChange={onChange} type="number" min="0" placeholder="e.g. 15000" />
        </Field>
        <Field label="Electricity Cost (₹/month)">
          <Input name="electricityCost" value={form.electricityCost} onChange={onChange} type="number" min="0" placeholder="e.g. 8000" />
        </Field>
      </Row>
      <Row>
        <Field label="Medicine / Treatment Cost (₹/cycle)">
          <Input name="medicineCost" value={form.medicineCost} onChange={onChange} type="number" min="0" placeholder="Optional" />
        </Field>
        <Field label="Expected Selling Price (₹/kg)">
          <Input name="expectedPrice" value={form.expectedPrice} onChange={onChange} type="number" min="0" placeholder="e.g. 450" />
        </Field>
      </Row>
      <Row>
        <Field label="Target Harvest Weight (g/fish)" hint="Expected body weight at harvest">
          <Input name="targetHarvestWeight" value={form.targetHarvestWeight} onChange={onChange} type="number" min="0" placeholder="e.g. 20" />
        </Field>
        <Field label="Target Culture Days" hint="Planned days from stocking to harvest">
          <Input name="targetHarvestDays" value={form.targetHarvestDays} onChange={onChange} type="number" min="1" placeholder="120" />
        </Field>
      </Row>
    </div>
  );
}

function Step8({ form, onChange }) {
  return (
    <div className="space-y-6">
      <Field label="How will you track this pond?">
        <div className="grid grid-cols-2 gap-3 mt-1">
          {["Manual data entry","Sensor integration"].map(opt => (
            <label key={opt} className={`flex items-center gap-3 border p-4 cursor-pointer transition-all
              ${form.monitoringMode === opt ? "border-green-600 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="monitoringMode" value={opt}
                checked={form.monitoringMode === opt} onChange={onChange} className="accent-green-700" />
              <span className="text-xs font-bold text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Logging Frequency">
        <div className="grid grid-cols-2 gap-3 mt-1">
          {["Daily logs","Weekly sampling","Real-time sensor","Every 2 days"].map(opt => (
            <label key={opt} className={`flex items-center gap-3 border p-4 cursor-pointer transition-all
              ${form.loggingFrequency === opt ? "border-green-600 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="loggingFrequency" value={opt}
                checked={form.loggingFrequency === opt} onChange={onChange} className="accent-green-700" />
              <span className="text-xs font-bold text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Step9({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 px-3 py-2 mb-2 flex items-start gap-2">
        <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[10px] font-bold text-slate-500">
          Set your alert thresholds. You'll be notified when sensor readings cross these limits.
        </p>
      </div>
      <Row>
        <Field label="DO Alert Below (mg/L)" hint="Trigger alert when DO drops below this">
          <Input name="alertDo" value={form.alertDo} onChange={onChange} type="number" step="0.1" min="0" />
        </Field>
        <Field label="Ammonia Alert Above (ppm)">
          <Input name="alertAmmonia" value={form.alertAmmonia} onChange={onChange} type="number" step="0.01" min="0" />
        </Field>
      </Row>
      <Row>
        <Field label="pH Alert Min">
          <Input name="alertPhMin" value={form.alertPhMin} onChange={onChange} type="number" step="0.1" min="0" />
        </Field>
        <Field label="pH Alert Max">
          <Input name="alertPhMax" value={form.alertPhMax} onChange={onChange} type="number" step="0.1" min="0" />
        </Field>
      </Row>
      <Field label="Notification Method">
        <div className="grid grid-cols-3 gap-3 mt-1">
          {["App","SMS","Both"].map(opt => (
            <label key={opt} className={`flex items-center justify-center gap-2 border p-3 cursor-pointer transition-all
              ${form.notifyMethod === opt ? "border-green-600 bg-green-50 text-green-800" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
              <input type="radio" name="notifyMethod" value={opt}
                checked={form.notifyMethod === opt} onChange={onChange} className="accent-green-700" />
              <span className="text-xs font-black uppercase tracking-wider">{opt}</span>
            </label>
          ))}
        </div>
      </Field>
    </div>
  );
}

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9];

// Validation — only step 1 & 2 have required fields
function validate(step, form) {
  if (step === 1 && !form.farmName.trim()) return "Farm name is required.";
  if (step === 2 && !form.label.trim())    return "Pond name is required.";
  return null;
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function PondSetupWizard() {
  const { createPondFull } = usePond();
  const { user }           = useAuth();

  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState({ ...INITIAL, ownerName: user?.name || "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const next = () => {
    const err = validate(step, form);
    if (err) { setError(err); return; }
    setError("");
    setStep(s => Math.min(s + 1, 9));
  };

  const back = () => { setError(""); setStep(s => Math.max(s - 1, 1)); };

  const submit = async () => {
    const err = validate(step, form);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await createPondFull(form);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Done screen ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-mono">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-700 flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-white" />
          </div>
          <h1 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-2">
            Pond Created!
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Redirecting to dashboard…
          </p>
        </div>
      </div>
    );
  }

  const StepContent = STEP_COMPONENTS[step - 1];
  const stepInfo    = STEPS[step - 1];
  const StepIcon    = stepInfo.icon;
  const progress    = ((step - 1) / 8) * 100;

  return (
    <div
      className="min-h-screen bg-slate-50 font-mono flex flex-col"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      {/* ── Top brand bar ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 flex items-center justify-center">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">VANTAGE DSS</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Farm Setup Wizard</p>
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Step {step} of 9
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div className="w-full h-1 bg-slate-200">
        <div
          className="h-1 bg-green-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Step sidebar ── */}
        <div className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-200 py-8 px-4 gap-1">
          {STEPS.map(s => {
            const Icon = s.icon;
            const active   = s.id === step;
            const complete = s.id < step;
            return (
              <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all
                ${active ? "bg-green-700 text-white" : complete ? "text-green-700" : "text-slate-400"}`}>
                <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${
                  complete ? "text-green-600" : active ? "text-white" : "text-slate-300"
                }`}>
                  {complete ? <Check size={13} /> : <Icon size={13} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 overflow-y-auto py-8 px-6 lg:px-12">
          <div className="max-w-2xl mx-auto">

            {/* Step header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-700 flex items-center justify-center">
                <StepIcon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Step {step} of 9
                </p>
                <h2 className="text-base font-black uppercase tracking-widest text-slate-900">
                  {stepInfo.label}
                </h2>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-[11px] font-bold text-red-600">{error}</p>
              </div>
            )}

            {/* Step content */}
            <div className="bg-white border border-slate-200 shadow-sm p-6">
              <StepContent form={form} onChange={handleChange} />
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={back}
                disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-600
                  text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Back
              </button>

              {step < 9 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800
                    text-white text-[11px] font-black uppercase tracking-widest transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800
                    text-white text-[11px] font-black uppercase tracking-widest transition-colors
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader size={13} className="animate-spin" /> Saving…</>
                  ) : (
                    <><Check size={13} /> Launch Farm</>
                  )}
                </button>
              )}
            </div>

            {/* Step dots (mobile) */}
            <div className="flex justify-center gap-2 mt-6 lg:hidden">
              {STEPS.map(s => (
                <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${
                  s.id === step ? "bg-green-700 w-4" : s.id < step ? "bg-green-400" : "bg-slate-300"
                }`} />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}