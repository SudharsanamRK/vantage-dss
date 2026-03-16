import React, { useState } from "react";
import { Droplets, X, Loader, CheckCircle, Plus, Wind, Thermometer, FlaskConical } from "lucide-react";
import { usePond } from "../../context/PondContext";

const FIELDS = [
  { name: "do",      label: "Dissolved Oxygen", unit: "mg/L", icon: Wind,        step: "0.1", placeholder: "6.2"  },
  { name: "temp",    label: "Temperature",       unit: "°C",   icon: Thermometer, step: "0.1", placeholder: "29"   },
  { name: "ph",      label: "pH Level",          unit: "pH",   icon: Droplets,    step: "0.01",placeholder: "7.9"  },
  { name: "ammonia", label: "Ammonia (NH₃)",     unit: "ppm",  icon: FlaskConical,step: "0.01",placeholder: "0.09" },
];

export default function QuickWaterWidget() {
  const { updatePond, addLog, activePond } = usePond();
  const [open,    setOpen]    = useState(false);
  const [form,    setForm]    = useState({ do: "", temp: "", ph: "", ammonia: "" });
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {};
    Object.entries(form).forEach(([k, v]) => { if (v !== "") data[k] = parseFloat(v); });
    if (!Object.keys(data).length) return;
    setLoading(true);
    try {
      await updatePond(data);
      addLog(`Water quality updated — DO: ${data.do ?? "—"} · Temp: ${data.temp ?? "—"} · pH: ${data.ph ?? "—"} · NH₃: ${data.ammonia ?? "—"}`, "Operator");
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); setForm({ do: "", temp: "", ph: "", ammonia: "" }); }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!activePond) return null;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Quick Water Log"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-700 hover:bg-green-600
          text-white shadow-2xl shadow-green-900/40 flex items-center justify-center
          transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ borderRadius: 0 }}
      >
        <Droplets size={22} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-sm font-sans overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-green-700">
              <div className="flex items-center gap-2.5">
                <Droplets size={16} className="text-white" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-white">Quick Water Log</p>
                  <p className="text-[9px] text-green-200 font-bold uppercase">{activePond.label}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-green-200 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Enter current readings — leave blank to skip
              </p>
              {FIELDS.map(({ name, label, unit, icon: Icon, step, placeholder }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                      {label}
                    </label>
                    <div className="flex items-center border border-slate-200 bg-slate-50 focus-within:border-green-600 focus-within:bg-white transition-colors">
                      <input
                        type="number" step={step} placeholder={placeholder}
                        value={form[name]}
                        onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                        className="flex-1 bg-transparent px-3 py-2 text-sm font-mono text-slate-900
                          placeholder-slate-300 focus:outline-none"
                      />
                      <span className="pr-3 text-[10px] font-black text-slate-400 uppercase">{unit}</span>
                    </div>
                  </div>
                </div>
              ))}

              <button type="submit" disabled={loading || saved}
                className={`w-full mt-2 py-3 font-black uppercase tracking-widest text-[11px]
                  flex items-center justify-center gap-2 transition-all
                  ${saved    ? "bg-emerald-500 text-white"
                  : loading ? "bg-slate-200 text-slate-400"
                  :           "bg-green-700 hover:bg-green-800 text-white"}`}>
                {saved    ? <><CheckCircle size={13}/> Saved!</>
                : loading ? <><Loader size={13} className="animate-spin"/> Saving…</>
                :           <><Plus size={13}/> Log Reading</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}