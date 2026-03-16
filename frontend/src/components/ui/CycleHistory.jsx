import React, { useState, useEffect } from "react";
import { X, Trophy, Loader, CheckCircle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { usePond } from "../../context/PondContext";

// ── Cycle History row ───────────────────────────────────────────────────────
function CycleRow({ cycle }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-emerald-700 flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-black">C{cycle.cycleNo}</span>
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 uppercase">{cycle.species} · DOC {cycle.finalDoc}</p>
            <p className="text-[9px] text-slate-400 font-bold">
              {new Date(cycle.harvestDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase">Net Profit</p>
            <p className={`text-sm font-black ${cycle.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              ₹{(cycle.netProfit / 100000).toFixed(2)}L
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase">Harvest</p>
            <p className="text-sm font-black text-slate-800">{cycle.finalBiomassKg?.toFixed(0)} kg</p>
          </div>
          {open ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="p-4 grid grid-cols-3 gap-3 border-t border-slate-100">
          {[
            { label: "Final Avg Wt",  value: `${cycle.finalAvgWeight}g`              },
            { label: "Survival",      value: `${cycle.survivalPct}%`                 },
            { label: "FCR",           value: cycle.fcr                               },
            { label: "Gross Revenue", value: `₹${(cycle.grossRevenue/100000).toFixed(2)}L` },
            { label: "Total Cost",    value: `₹${(cycle.totalCost/100000).toFixed(2)}L`    },
            { label: "ROI",           value: cycle.roi                               },
            { label: "Avg DO",        value: cycle.avgDo ? `${cycle.avgDo} mg/L` : "—" },
            { label: "Avg Temp",      value: cycle.avgTemp ? `${cycle.avgTemp}°C` : "—" },
            { label: "Avg pH",        value: cycle.avgPh ?? "—"                       },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className="text-xs font-black text-slate-700">{value}</p>
            </div>
          ))}
          {cycle.notes && (
            <div className="col-span-3 mt-1 text-[10px] text-slate-500 italic border-t border-slate-100 pt-2">
              {cycle.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Complete Harvest Modal ──────────────────────────────────────────────────
export function CompleteHarvestModal({ onClose }) {
  const { completeCycle, activePond, brain, doc, farmConfig } = usePond();
  const b  = brain || {};
  const fc = farmConfig || {};

  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [confirm, setConfirm] = useState(false);

  const handleComplete = async () => {
    if (!confirm) { setConfirm(true); return; }
    setLoading(true); setError("");
    try {
      await completeCycle({
        notes,
        finalBiomassKg:  b.currentBiomassKg || 0,
        finalAvgWeight:  b.currentAvgWeight  || 0,
        survivalPct:     b.survivalProb       || 0,
        fcr:             fc.fcrTarget         || 1.5,
        grossRevenue:    (b.grossRevenue  || 0) * 100000,
        totalCost:       (b.totalCost     || 0) * 100000,
        netProfit:       (b.netProfit     || 0) * 100000,
        roi:             b.roi || "0%",
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-md font-sans overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-emerald-50">
          <div className="flex items-center gap-2.5">
            <Trophy size={16} className="text-emerald-700" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800">Complete Harvest</p>
              <p className="text-[9px] text-emerald-600 font-bold uppercase">{activePond?.label} · DOC {doc}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-400 hover:text-emerald-700 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Final Biomass",  value: `${b.currentBiomassKg || "—"} kg`,  color: "text-emerald-700" },
              { label: "Avg Weight",     value: `${b.currentAvgWeight || "—"} g`,   color: "text-blue-700"    },
              { label: "Net Profit",     value: `₹${b.netProfit || "0"}L`,          color: (b.netProfit||0)>=0?"text-emerald-700":"text-red-600" },
              { label: "Days of Culture",value: `${doc} days`,                       color: "text-slate-700"   },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className={`text-base font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
              Harvest Notes (optional)
            </label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Final observations, issues, buyer details..."
              className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-xs font-mono
                resize-none focus:outline-none focus:border-green-600 focus:bg-white transition-colors" />
          </div>

          {error && <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

          {confirm && !saved && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 px-3 py-2.5">
              <RotateCcw size={13} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-amber-700">
                This will archive the current cycle and reset the pond for new stocking. Click again to confirm.
              </p>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2.5">
              <CheckCircle size={13} className="text-green-600" />
              <p className="text-[11px] font-black text-green-700">Cycle archived! Pond reset for next stocking.</p>
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-500 text-[10px] font-black
                uppercase tracking-widest py-2.5 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleComplete} disabled={loading || saved}
              className={`flex-[2] text-white text-[10px] font-black uppercase tracking-widest py-2.5
                flex items-center justify-center gap-2 transition-all
                ${saved ? "bg-emerald-500" : confirm ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-700 hover:bg-emerald-800"}
                ${loading ? "opacity-60" : ""}`}>
              {saved    ? <><CheckCircle size={12}/> Done!</>
              : loading ? <><Loader size={12} className="animate-spin"/> Archiving…</>
              : confirm ? <><RotateCcw size={12}/> Yes, Complete Harvest</>
              :           <><Trophy size={12}/> Complete Harvest</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cycle History Viewer ───────────────────────────────────────────────────
export function CycleHistoryPanel() {
  const { getCycleHistory, activePond } = usePond();
  const [cycles,  setCycles]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePond?._id) return;
    setLoading(true);
    getCycleHistory(activePond._id)
      .then(data => setCycles(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activePond?._id]);

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader size={16} className="animate-spin text-slate-300" />
    </div>
  );
  if (!cycles.length) return (
    <div className="text-center py-8">
      <Trophy size={24} className="text-slate-200 mx-auto mb-2" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No completed cycles yet</p>
      <p className="text-[9px] text-slate-300 mt-1">Complete your first harvest to see history here</p>
    </div>
  );
  return (
    <div className="space-y-2">
      {cycles.map(c => <CycleRow key={c._id} cycle={c} />)}
    </div>
  );
}