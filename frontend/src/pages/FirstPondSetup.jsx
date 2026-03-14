// frontend/src/pages/FirstPondSetup.jsx
import { useState } from "react";
import { usePond } from "../context/PondContext";
import { Fish, Loader, AlertCircle, Waves } from "lucide-react";

const SPECIES = ["Vannamei", "Monodon", "Tilapia", "Catfish", "Rohu", "Milkfish"];

export default function FirstPondSetup() {
  const { createPond } = usePond();

  const [form, setForm]       = useState({
    label:     "",
    species:   "Vannamei",
    area:      1000,
    fishCount: 50000,
    avgWeight: 1,
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === "label" || name === "species" ? value : Number(value) }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) { setError("Pond name is required."); return; }
    setLoading(true);
    try {
      await createPond(form);
      // PondContext auto-sets activePond → app re-renders into dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-50 font-mono py-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-700 mb-4">
            <Waves size={28} className="text-white" />
          </div>
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-900">
            Welcome to Vantage DSS
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            Set up your first pond to get started
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-8">

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
            — Pond Configuration —
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Pond Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Pond Name <span className="text-red-400">*</span>
              </label>
              <input
                name="label"
                type="text"
                value={form.label}
                onChange={handleChange}
                placeholder="e.g. Pond Alpha, Unit A1"
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
                  text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-600
                  focus:bg-white transition-colors"
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Species
              </label>
              <select
                name="species"
                value={form.species}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
                  text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white transition-colors"
              >
                {SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Area + Fish Count row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Pond Area (m²)
                </label>
                <input
                  name="area"
                  type="number"
                  min={1}
                  value={form.area}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
                    text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Stocked Count
                </label>
                <input
                  name="fishCount"
                  type="number"
                  min={1}
                  value={form.fishCount}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
                    text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Avg Weight */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Avg. Stocking Weight (g)
              </label>
              <input
                name="avgWeight"
                type="number"
                min={0.1}
                step={0.1}
                value={form.avgWeight}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono
                  text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-green-700 hover:bg-green-800 text-white
                text-[11px] font-black uppercase tracking-widest py-3
                transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader size={13} className="animate-spin" /> Creating pond…</>
              ) : (
                <><Fish size={13} /> Launch Dashboard</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-6">
          You can add more ponds anytime from the topbar
        </p>
      </div>
    </div>
  );
}