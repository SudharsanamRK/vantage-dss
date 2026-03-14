// frontend/src/components/layout/Topbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePond }     from "../../context/PondContext";
import { useAuth }     from "../../context/AuthContext";
import {
  Bell, Search, MapPin, LogOut,
  ChevronDown, Plus, Fish, Check, Loader
} from "lucide-react";

// ── Pond Selector Dropdown ────────────────────────────────────────────────────
function PondSelector() {
  const { ponds, activePond, switchPond, createPond } = usePond();
  const [open,        setOpen]        = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [newName,     setNewName]     = useState("");
  const [newSpecies,  setNewSpecies]  = useState("Vannamei");
  const [creating,    setCreating]    = useState(false);
  const [error,       setError]       = useState("");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { setError("Name required."); return; }
    setCreating(true);
    try {
      await createPond({ label: newName.trim(), species: newSpecies, area: 1000, fishCount: 50000 });
      setNewName(""); setShowNew(false); setOpen(false); setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200
          cursor-pointer hover:bg-slate-100 transition-colors"
      >
        <MapPin size={16} className="text-blue-600 shrink-0" />
        <div className="text-left">
          <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Active Unit</p>
          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
            {activePond?.label || "No Pond"}
          </p>
        </div>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 shadow-lg z-50 rounded-sm">

          {/* Pond list */}
          <div className="py-1 max-h-52 overflow-y-auto">
            {ponds.length === 0 ? (
              <p className="px-4 py-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                No ponds yet
              </p>
            ) : (
              ponds.map(pond => (
                <button
                  key={pond._id}
                  onClick={() => { switchPond(pond); setOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50
                    transition-colors text-left"
                >
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      {pond.label}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {pond.species} · {pond.area ?? "—"} m²
                    </p>
                  </div>
                  {activePond?._id === pond._id && (
                    <Check size={13} className="text-green-600 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Add new pond inline */}
          {!showNew ? (
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-green-700 hover:bg-green-50
                transition-colors text-[11px] font-black uppercase tracking-widest"
            >
              <Plus size={13} /> Add New Pond
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-3 space-y-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setError(""); }}
                placeholder="Pond name…"
                className="w-full border border-slate-300 px-2.5 py-1.5 text-xs font-mono
                  focus:outline-none focus:border-green-600 bg-slate-50"
              />
              <select
                value={newSpecies}
                onChange={e => setNewSpecies(e.target.value)}
                className="w-full border border-slate-300 px-2.5 py-1.5 text-xs font-mono
                  focus:outline-none focus:border-green-600 bg-slate-50"
              >
                {["Vannamei","Monodon","Tilapia","Catfish","Rohu","Milkfish"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-green-700 text-white text-[10px] font-black uppercase
                    tracking-widest py-1.5 hover:bg-green-800 transition-colors
                    flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  {creating ? <Loader size={11} className="animate-spin" /> : <><Fish size={11} /> Create</>}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNew(false); setError(""); setNewName(""); }}
                  className="px-3 border border-slate-200 text-[10px] font-black text-slate-500
                    hover:bg-slate-50 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Topbar ───────────────────────────────────────────────────────────────
export default function Topbar() {
  const { sensorData } = usePond();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">

      {/* LEFT — pond selector + search */}
      <div className="flex items-center gap-4">
        <PondSelector />

        <div className="hidden lg:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl w-64
          border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search farm records..."
            className="bg-transparent text-xs font-medium outline-none w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* RIGHT — status + user */}
      <div className="flex items-center gap-4">

        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <p className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">
            Stream: Healthy
          </p>
        </div>

        <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-900 uppercase leading-none">
              {user?.name || "Operator"}
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {user?.role || "farmer"}
            </p>
          </div>
          <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center
            text-white text-xs font-black italic shadow-lg border-2 border-white ring-1 ring-slate-200">
            {initials}
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-600
            hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg
            transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">Exit</span>
        </button>
      </div>
    </header>
  );
}