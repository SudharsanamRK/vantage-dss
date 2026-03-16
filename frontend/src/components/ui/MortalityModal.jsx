import React, { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Loader, TrendingDown } from "lucide-react";
import { usePond } from "../../context/PondContext";

const CAUSES = ["Unknown", "Hypoxia (Low DO)", "Disease", "Temperature Stress", "Ammonia Toxicity", "Predation", "Other"];

export default function MortalityModal({ onClose }) {
  const { logMortality, getMortalityHistory, activePond, doc, farmConfig } = usePond();
  const [count,    setCount]    = useState("");
  const [cause,    setCause]    = useState("Unknown");
  const [notes,    setNotes]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [history,  setHistory]  = useState([]);
  const [error,    setError]    = useState("");
  const [newSurv,  setNewSurv]  = useState(null);

  useEffect(() => {
    if (!activePond?._id) return;
    getMortalityHistory(activePond._id)
      .then(data => setHistory(Array.isArray(data) ? data.slice(0, 7) : []))
      .catch(() => {});
  }, [activePond?._id]);

  const totalDead   = history.reduce((s, l) => s + l.count, 0);
  const fc          = farmConfig || {};
  const origCount   = fc.fishCount || 0;
  const survivalPct = origCount > 0
    ? Math.max(0, ((origCount - totalDead - (parseFloat(count) || 0)) / origCount * 100)).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = parseInt(count);
    if (!n || n < 0) { setError("Enter a valid count (> 0)."); return; }
    setLoading(true); setError("");
    try {
      const res = await logMortality(n, cause, notes);
      setNewSurv(res.newSurvivalEstimate);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-md font-sans overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-red-50">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-red-500" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-red-800">Mortality Log</p>
              <p className="text-[9px] text-red-400 font-bold uppercase">
                {activePond?.label} · DOC {doc} · Stock: {origCount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-300 hover:text-red-600 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Cumulative stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-b border-slate-100">
          {[
            { label: "Total Dead (logged)", value: totalDead.toLocaleString("en-IN"), color: "text-red-600"   },
            { label: "Survival Est.",       value: `${farmConfig?.survivalEstimate ?? "—"}%`, color: "text-emerald-600" },
            { label: "New After This Log",  value: survivalPct ? `${survivalPct}%` : "—",     color: "text-blue-600"   },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className={`text-base font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
          )}

          {saved && newSurv !== null && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2.5">
              <CheckCircle size={13} className="text-green-600" />
              <p className="text-[11px] font-black text-green-700">
                Logged! Survival estimate updated to {newSurv}%
              </p>
            </div>
          )}

          {/* Count input */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
              Dead Shrimp Count *
            </label>
            <input
              type="number" min="1" value={count}
              onChange={e => { setCount(e.target.value); setError(""); }}
              placeholder="e.g. 120"
              className="w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-sm font-mono
                text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Cause */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
              Suspected Cause
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CAUSES.map(c => (
                <label key={c} className={`flex items-center gap-2 border px-3 py-2 cursor-pointer text-[10px]
                  font-black uppercase tracking-wider transition-all
                  ${cause === c
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  <input type="radio" name="cause" value={c}
                    checked={cause === c} onChange={() => setCause(c)} className="hidden" />
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cause === c ? "bg-red-500" : "bg-slate-300"}`} />
                  {c}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
              Notes (optional)
            </label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Location found, symptoms observed, action taken..."
              className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-xs font-mono
                resize-none focus:outline-none focus:border-red-500 focus:bg-white transition-colors" />
          </div>

          {/* Past logs */}
          {history.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <TrendingDown size={10} /> Recent Mortality Logs
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-1.5 bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-600">DOC {h.doc} · {h.cause}</p>
                      <p className="text-[8px] text-slate-400">{new Date(h.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <p className="text-xs font-black text-red-600">-{h.count.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-500 text-[10px] font-black
                uppercase tracking-widest py-2.5 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || saved}
              className={`flex-[2] text-white text-[10px] font-black uppercase tracking-widest py-2.5
                flex items-center justify-center gap-2 transition-all
                ${saved ? "bg-emerald-500" : loading ? "bg-slate-300" : "bg-red-600 hover:bg-red-700"}`}>
              {saved    ? <><CheckCircle size={12}/> Logged!</>
              : loading ? <><Loader size={12} className="animate-spin"/> Saving…</>
              :           <><AlertTriangle size={12}/> Log Mortality</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}