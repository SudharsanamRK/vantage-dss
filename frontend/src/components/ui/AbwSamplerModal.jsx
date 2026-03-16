import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Scale, CheckCircle, Loader, TrendingUp, RefreshCw } from "lucide-react";
import { usePond } from "../../context/PondContext";

export default function AbwSamplerModal({ onClose }) {
  const { logAbwSample, getAbwHistory, activePond, brain, doc } = usePond();
  const [weights,  setWeights]  = useState(["", "", "", "", ""]);
  const [notes,    setNotes]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [history,  setHistory]  = useState([]);
  const [histLoad, setHistLoad] = useState(false);
  const [error,    setError]    = useState("");

  // Load past samples
  useEffect(() => {
    if (!activePond?._id) return;
    setHistLoad(true);
    getAbwHistory(activePond._id)
      .then(data => setHistory(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {})
      .finally(() => setHistLoad(false));
  }, [activePond?._id]);

  const validWeights = weights.map(w => parseFloat(w)).filter(w => !isNaN(w) && w > 0);
  const liveAvg      = validWeights.length
    ? (validWeights.reduce((a, b) => a + b, 0) / validWeights.length).toFixed(2)
    : null;

  const addRow    = () => setWeights(p => [...p, ""]);
  const removeRow = (i) => setWeights(p => p.filter((_, idx) => idx !== i));
  const setRow    = (i, v) => setWeights(p => p.map((w, idx) => idx === i ? v : w));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validWeights.length < 1) { setError("Enter at least 1 weight."); return; }
    setLoading(true); setError("");
    try {
      await logAbwSample(validWeights, notes);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const growthVsTarget = liveAvg && brain?.currentAvgWeight
    ? ((parseFloat(liveAvg) - brain.currentAvgWeight) / brain.currentAvgWeight * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-lg font-sans overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-green-700" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">ABW Sampling</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">
                {activePond?.label} · DOC {doc}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Live average strip */}
          <div className="px-5 py-3 bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Average</p>
              <p className="text-2xl font-black text-white tracking-tight">
                {liveAvg ? `${liveAvg} g` : "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Brain Estimate</p>
              <p className="text-sm font-black text-emerald-400">{brain?.currentAvgWeight ?? "—"} g</p>
            </div>
            {growthVsTarget !== null && (
              <div className={`px-3 py-1 border text-[10px] font-black uppercase ${
                parseFloat(growthVsTarget) >= 0
                  ? "border-green-500/40 text-green-400"
                  : "border-red-500/40 text-red-400"}`}>
                {parseFloat(growthVsTarget) >= 0 ? "+" : ""}{growthVsTarget}% vs model
              </div>
            )}
          </div>

          {/* Weight inputs */}
          <form id="abw-form" onSubmit={handleSubmit} className="p-5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Shrimp weights (g) — sample 10–30 shrimp from 3 corners
            </p>

            {error && (
              <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-2">
                {error}
              </p>
            )}

            <div className="grid grid-cols-5 gap-2">
              {weights.map((w, i) => (
                <div key={i} className="relative group">
                  <input
                    type="number" step="0.1" min="0.1" max="100"
                    value={w}
                    onChange={e => setRow(i, e.target.value)}
                    placeholder={`#${i + 1}`}
                    className="w-full bg-slate-50 border border-slate-200 px-2 py-2 text-xs font-mono
                      text-center text-slate-900 focus:outline-none focus:border-green-600
                      focus:bg-white transition-colors"
                  />
                  {weights.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white
                        hidden group-hover:flex items-center justify-center text-[8px] rounded-full">
                      <X size={8} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addRow}
                className="bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300
                  flex items-center justify-center transition-colors py-2">
                <Plus size={14} className="text-slate-400" />
              </button>
            </div>

            {/* Sample count */}
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
              <span>{validWeights.length} weights entered</span>
              <span>
                {validWeights.length > 0
                  ? `Min: ${Math.min(...validWeights)}g · Max: ${Math.max(...validWeights)}g`
                  : "Enter weights above"}
              </span>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Sampled from NE corner, shrimp looked healthy"
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-mono
                  text-slate-900 resize-none focus:outline-none focus:border-green-600 focus:bg-white transition-colors"
              />
            </div>
          </form>

          {/* Past samples */}
          {(history.length > 0 || histLoad) && (
            <div className="px-5 pb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                <TrendingUp size={11} /> Past Samples
                {histLoad && <RefreshCw size={10} className="animate-spin text-slate-300" />}
              </p>
              <div className="space-y-1.5">
                {history.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-[10px] font-black text-slate-700">
                        DOC {s.doc} · {s.sampleSize} shrimp
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <p className="text-sm font-black text-emerald-600">{s.avgWeight} g</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-500 text-[10px] font-black
              uppercase tracking-widest py-2.5 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="abw-form" disabled={loading || saved}
            className={`flex-[2] text-white text-[10px] font-black uppercase tracking-widest py-2.5
              flex items-center justify-center gap-2 transition-all
              ${saved ? "bg-emerald-500" : loading ? "bg-slate-300" : "bg-green-700 hover:bg-green-800"}`}>
            {saved    ? <><CheckCircle size={12}/> Saved &amp; Updated!</>
            : loading ? <><Loader size={12} className="animate-spin"/> Saving…</>
            :           <><Scale size={12}/> Save Sample</>}
          </button>
        </div>
      </div>
    </div>
  );
}