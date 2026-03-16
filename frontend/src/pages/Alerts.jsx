import React, { useState, useMemo, useEffect, useRef } from "react";
import { usePond } from "../context/PondContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Check, Clock, AlertTriangle, ChevronRight,
  Repeat, Fish, Droplets, FlaskConical, Wrench,
  Leaf, Calendar, Filter, X, Circle,
  CheckCircle2, Timer, History, Zap, Target
} from "lucide-react";

const STORAGE_KEY = "fathom_tasks_v1";

const CATEGORIES = [
  { key:"Water Quality", icon:Droplets,     color:"bg-blue-500",   light:"bg-blue-50   border-blue-200",   text:"text-blue-700"   },
  { key:"Feeding",       icon:Leaf,         color:"bg-green-600",  light:"bg-green-50  border-green-200",  text:"text-green-700"  },
  { key:"Medicine",      icon:FlaskConical, color:"bg-purple-500", light:"bg-purple-50 border-purple-200", text:"text-purple-700" },
  { key:"Maintenance",   icon:Wrench,       color:"bg-amber-500",  light:"bg-amber-50  border-amber-200",  text:"text-amber-700"  },
  { key:"Sampling",      icon:Fish,         color:"bg-cyan-500",   light:"bg-cyan-50   border-cyan-200",   text:"text-cyan-700"   },
  { key:"Harvest",       icon:Target,       color:"bg-red-500",    light:"bg-red-50    border-red-200",    text:"text-red-700"    },
];
const PRIORITIES = ["High", "Medium", "Low"];
const PRIORITY_CFG = {
  High:   { color:"text-red-600",   bg:"bg-red-50   border-red-200",   dot:"bg-red-500"   },
  Medium: { color:"text-amber-700", bg:"bg-amber-50 border-amber-200", dot:"bg-amber-400" },
  Low:    { color:"text-slate-500", bg:"bg-slate-50 border-slate-200", dot:"bg-slate-300" },
};
const STATUS_CFG = {
  pending:       { label:"Pending",     color:"text-slate-500", bg:"bg-slate-50  border-slate-200", icon:Circle       },
  "in-progress": { label:"In Progress", color:"text-blue-700",  bg:"bg-blue-50   border-blue-200",  icon:Timer        },
  done:          { label:"Done",        color:"text-green-700", bg:"bg-green-50  border-green-200", icon:CheckCircle2 },
};

function buildDefaultTasks(ponds) {
  const today = new Date().toISOString().split("T")[0];
  const tasks = []; let id = 1;
  ponds.forEach(pond => {
    tasks.push(
      { id:id++, title:"Morning water quality check",    category:"Water Quality", priority:"High",   status:"pending", pondId:pond._id, pondLabel:pond.label, dueDate:today, recurring:"daily",  notes:"Check DO, pH, temp, ammonia",        completedAt:null, createdAt:today },
      { id:id++, title:"Feed ration — morning",          category:"Feeding",       priority:"High",   status:"pending", pondId:pond._id, pondLabel:pond.label, dueDate:today, recurring:"daily",  notes:`${pond.feedingFrequency||4}x daily`, completedAt:null, createdAt:today },
      { id:id++, title:"Weekly water exchange",          category:"Water Quality", priority:"Medium", status:"pending", pondId:pond._id, pondLabel:pond.label, dueDate:today, recurring:"weekly", notes:`${pond.waterExchange||"10% weekly"}`,completedAt:null, createdAt:today },
      { id:id++, title:"ABW sampling (avg body weight)", category:"Sampling",      priority:"Medium", status:"pending", pondId:pond._id, pondLabel:pond.label, dueDate:today, recurring:"weekly", notes:"Weigh 30 shrimp from 3 corners",     completedAt:null, createdAt:today },
      { id:id++, title:"Aeration check and maintenance", category:"Maintenance",   priority:"Low",    status:"pending", pondId:pond._id, pondLabel:pond.label, dueDate:today, recurring:"weekly", notes:"Inspect paddlewheel bearings",        completedAt:null, createdAt:today },
    );
  });
  return tasks;
}

// ─── localStorage helpers ──────────────────────────────────────────────────────
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }
  return null;
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch { /* ignore quota errors */ }
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
function getCatCfg(cat) { return CATEGORIES.find(c => c.key === cat) || CATEGORIES[0]; }
function isOverdue(dueDate, status) {
  if (status === "done") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

// ─── Add Task Modal ────────────────────────────────────────────────────────────
function AddTaskModal({ onClose, onAdd, ponds, defaultPondId }) {
  const [form, setForm] = useState({
    title:"", category:"Water Quality", priority:"Medium",
    pondId: defaultPondId || ponds[0]?._id || "",
    dueDate: new Date().toISOString().split("T")[0],
    recurring:"none", notes:"",
  });
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Task title is required."); return; }
    const pond = ponds.find(p => p._id === form.pondId);
    onAdd({
      ...form,
      id: Date.now(),
      status: "pending",
      pondLabel: pond?.label || "Farm",
      completedAt: null,
      createdAt: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  const f = "w-full bg-slate-50 border border-slate-300 px-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-green-600 focus:bg-white transition-colors";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.97 }}
        className="bg-white border border-slate-200 shadow-2xl w-full max-w-md font-sans">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-green-700"/>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">New Task</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={15}/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <p className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Task Title *</label>
            <input className={f} value={form.title} onChange={e => setForm(p => ({...p, title:e.target.value}))} placeholder="e.g. Check DO levels" autoFocus/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Category</label>
              <select className={f} value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Priority</label>
              <select className={f} value={form.priority} onChange={e => setForm(p => ({...p, priority:e.target.value}))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Pond</label>
              <select className={f} value={form.pondId} onChange={e => setForm(p => ({...p, pondId:e.target.value}))}>
                <option value="">All Ponds</option>
                {ponds.map(p => <option key={p._id} value={p._id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Due Date</label>
              <input type="date" className={f} value={form.dueDate} onChange={e => setForm(p => ({...p, dueDate:e.target.value}))}/>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Recurring</label>
            <div className="grid grid-cols-4 gap-2">
              {[["none","One-time"],["daily","Daily"],["weekly","Weekly"],["monthly","Monthly"]].map(([val, lbl]) => (
                <label key={val} className={`flex items-center justify-center gap-1 border p-2 cursor-pointer text-[9px] font-black uppercase tracking-wider
                  ${form.recurring===val ? "border-green-600 bg-green-50 text-green-800" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  <input type="radio" name="rec" value={val} checked={form.recurring===val} onChange={() => setForm(p => ({...p, recurring:val}))} className="hidden"/>
                  {val==="none" ? <Circle size={8}/> : <Repeat size={8}/>}{lbl}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Notes (optional)</label>
            <textarea className={`${f} resize-none`} rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes:e.target.value}))} placeholder="Additional details..."/>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-300 text-slate-500 text-[10px] font-black uppercase tracking-widest py-2.5 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white text-[10px] font-black uppercase tracking-widest py-2.5 transition-colors flex items-center justify-center gap-2">
              <Plus size={11}/> Add Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onStatusChange, onDelete }) {
  const cat     = getCatCfg(task.category);
  const CatIcon = cat.icon;
  const priCfg  = PRIORITY_CFG[task.priority] || PRIORITY_CFG.Medium;
  const statCfg = STATUS_CFG[task.status]     || STATUS_CFG.pending;
  const StatIcon= statCfg.icon;
  const overdue = isOverdue(task.dueDate, task.status);
  const next    = task.status==="pending" ? "in-progress" : task.status==="in-progress" ? "done" : "pending";

  return (
    <motion.div layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:.97 }}
      className={`bg-white border shadow-sm overflow-hidden transition-all ${task.status==="done" ? "opacity-60" : ""} ${overdue ? "border-red-300" : "border-slate-200"}`}>
      <div className={`h-0.5 w-full ${cat.color}`}/>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={() => onStatusChange(task.id, next)}
            className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
              ${task.status==="done" ? "border-green-500 bg-green-500" : task.status==="in-progress" ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:border-green-500"}`}>
            {task.status==="done"        && <Check size={10} className="text-white"/>}
            {task.status==="in-progress" && <div className="w-2 h-2 rounded-full bg-blue-500"/>}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className={`text-sm font-black text-slate-800 leading-tight ${task.status==="done" ? "line-through text-slate-400" : ""}`}>{task.title}</p>
              <button onClick={() => onDelete(task.id)} className="text-slate-300 hover:text-red-400 transition-colors shrink-0"><X size={12}/></button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black uppercase rounded-sm ${cat.light} ${cat.text}`}><CatIcon size={8}/>{task.category}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black uppercase rounded-sm ${priCfg.bg} ${priCfg.color}`}><span className={`w-1.5 h-1.5 rounded-full ${priCfg.dot}`}/>{task.priority}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black uppercase rounded-sm ${statCfg.bg} ${statCfg.color}`}><StatIcon size={8}/>{statCfg.label}</span>
              {task.recurring!=="none" && <span className="inline-flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black uppercase rounded-sm bg-indigo-50 border-indigo-200 text-indigo-700"><Repeat size={8}/>{task.recurring}</span>}
            </div>
            <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1"><Fish size={9}/>{task.pondLabel || "All Ponds"}</span>
              <span className={`flex items-center gap-1 ${overdue ? "text-red-500" : ""}`}><Calendar size={9}/>{overdue ? "OVERDUE · " : ""}{task.dueDate}</span>
            </div>
            {task.notes      && <p className="text-[10px] text-slate-400 mt-2 font-medium italic">{task.notes}</p>}
            {task.completedAt&& <p className="text-[9px] text-green-600 font-black mt-1.5 flex items-center gap-1"><CheckCircle2 size={9}/>Completed at {task.completedAt}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Reports() {
  const { ponds, activePond, addLog } = usePond();

  // ── Initialise from localStorage, fall back to generated defaults ──────────
  const [tasks, setTasks] = useState(() => {
    const saved = loadTasks();
    return saved !== null ? saved : [];
  });

  // Track whether we've seeded defaults so we don't re-seed on every render
  const seededRef = useRef(false);

  // ── Seed default tasks only once, when ponds are first available and
  //    localStorage was empty ─────────────────────────────────────────────────
  useEffect(() => {
    if (seededRef.current) return;
    if (ponds.length === 0) return;
    const saved = loadTasks();
    if (saved === null || saved.length === 0) {
      const defaults = buildDefaultTasks(ponds);
      setTasks(defaults);
      saveTasks(defaults);
    }
    seededRef.current = true;
  }, [ponds]);

  // ── Persist every tasks change to localStorage ─────────────────────────────
  useEffect(() => {
    // Skip the very first render when tasks is still the initial empty/loaded value
    // to avoid overwriting a valid saved state with [] before ponds have loaded.
    if (tasks.length > 0 || seededRef.current) {
      saveTasks(tasks);
    }
  }, [tasks]);

  const [showModal,    setShowModal]    = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterPond,   setFilterPond]   = useState("all");
  const [activeTab,    setActiveTab]    = useState("tasks");

  useEffect(() => {
    if (activePond?._id) setFilterPond(activePond._id);
  }, [activePond?._id]);

  // ── Mutators (all go through setTasks → useEffect persists) ───────────────
  const handleAdd = (task) => {
    setTasks(prev => [task, ...prev]);
    addLog(`Task created: ${task.title}`, "Operator");
  };

  const handleStatusChange = (id, next) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, status: next };
      if (next === "done") {
        updated.completedAt = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
        addLog(`Task completed: ${t.title}`, "Operator");
      } else {
        // If cycling back to pending/in-progress, clear completedAt
        if (next !== "done") updated.completedAt = null;
      }
      return updated;
    }));
  };

  const handleDelete = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  // ── Derived state ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => tasks.filter(t =>
    (filterStatus === "all" || t.status === filterStatus) &&
    (filterCat    === "all" || t.category === filterCat)  &&
    (filterPond   === "all" || t.pondId === filterPond)
  ), [tasks, filterStatus, filterCat, filterPond]);

  const counts = useMemo(() => ({
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    done:       tasks.filter(t => t.status === "done").length,
    overdue:    tasks.filter(t => isOverdue(t.dueDate, t.status)).length,
  }), [tasks]);

  const history   = useMemo(() => tasks.filter(t => t.status === "done").sort((a, b) => b.id - a.id), [tasks]);
  const today     = new Date().toISOString().split("T")[0];
  const todayTasks= tasks.filter(t => t.dueDate === today && t.status !== "done");

  const sel = "bg-white border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-green-600 transition-colors cursor-pointer";

  return (
    <div className="min-h-full bg-[#f3f6f9] text-slate-800 font-sans p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <nav className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">
              Operations / {activePond?.label || "Farm"} / Task Manager
            </nav>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Task Manager: <span className="font-black uppercase">Daily Ops</span>
            </h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors shadow-sm">
            <Plus size={13}/> New Task
          </button>
        </header>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label:"Total Tasks",  value:counts.total,      color:"text-slate-900", bg:"bg-white border border-slate-200" },
            { label:"Pending",      value:counts.pending,    color:"text-slate-700", bg:"bg-slate-50 border border-slate-200" },
            { label:"In Progress",  value:counts.inProgress, color:"text-blue-700",  bg:"bg-blue-50 border border-blue-200" },
            { label:"Completed",    value:counts.done,       color:"text-green-700", bg:"bg-green-50 border border-green-200" },
            { label:"Overdue",      value:counts.overdue,    color:"text-red-700",   bg:counts.overdue>0 ? "bg-red-50 border border-red-200" : "bg-white border border-slate-200" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} p-4 shadow-sm`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
              <p className={`text-3xl font-light tracking-tight ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">

            {/* Tabs */}
            <div className="flex gap-0 border-b border-slate-200">
              {[["tasks","Tasks"], ["history","History"]].map(([tab, lbl]) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab===tab ? "border-green-700 text-green-700" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                  {lbl}
                </button>
              ))}
            </div>

            {activeTab === "tasks" && <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <Filter size={13} className="text-slate-400"/>
                <select className={sel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <select className={sel} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
                </select>
                <select className={sel} value={filterPond} onChange={e => setFilterPond(e.target.value)}>
                  <option value="all">All Ponds</option>
                  {ponds.map(p => <option key={p._id} value={p._id}>{p.label}</option>)}
                </select>
                {(filterStatus!=="all" || filterCat!=="all" || filterPond!=="all") && (
                  <button onClick={() => { setFilterStatus("all"); setFilterCat("all"); setFilterPond("all"); }}
                    className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-1">
                    <X size={10}/>Clear
                  </button>
                )}
                <span className="ml-auto text-[9px] font-black text-slate-400 uppercase">{filtered.length} task{filtered.length!==1?"s":""}</span>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 text-center">
                  <CheckCircle2 size={28} className="text-slate-200 mx-auto mb-3"/>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {counts.total === 0 ? "No tasks yet — create your first task" : "No tasks match your filters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filtered.map(task => (
                      <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onDelete={handleDelete}/>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>}

            {activeTab === "history" && (
              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                    <History size={13}/>Completed Tasks
                  </h3>
                </div>
                {history.length === 0 ? (
                  <div className="p-12 text-center">
                    <History size={24} className="text-slate-200 mx-auto mb-2"/>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No completed tasks yet</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[9px] text-slate-400 font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-5 py-3">Task</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Pond</th>
                        <th className="px-5 py-3">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map(task => {
                        const cat = getCatCfg(task.category);
                        const CatIcon = cat.icon;
                        return (
                          <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3">
                              <p className="font-black text-slate-600 line-through text-xs">{task.title}</p>
                              {task.notes && <p className="text-[9px] text-slate-400 italic mt-0.5">{task.notes}</p>}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black uppercase rounded-sm ${cat.light} ${cat.text}`}>
                                <CatIcon size={8}/>{task.category}
                              </span>
                            </td>
                            <td className="px-5 py-3"><span className="text-[10px] font-black text-slate-500">{task.pondLabel || "All"}</span></td>
                            <td className="px-5 py-3">
                              <span className="text-[10px] font-black text-green-600 flex items-center gap-1">
                                <CheckCircle2 size={10}/>{task.completedAt || task.dueDate}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-5">

            {/* Today's schedule */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Clock size={13}/>Today's Schedule
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {todayTasks.slice(0, 6).map(task => {
                  const cat = getCatCfg(task.category);
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status==="in-progress" ? "bg-blue-500 animate-pulse" : isOverdue(task.dueDate, task.status) ? "bg-red-500 animate-pulse" : "bg-slate-300"}`}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-700 truncate">{task.title}</p>
                        <p className={`text-[9px] font-bold uppercase ${cat.text}`}>{task.category}</p>
                      </div>
                      <button onClick={() => handleStatusChange(task.id, task.status==="pending" ? "in-progress" : "done")}
                        className="text-[8px] font-black uppercase px-2 py-1 border transition-colors hover:bg-green-50 hover:border-green-300 hover:text-green-700 text-slate-400 border-slate-200 shrink-0">
                        {task.status==="pending" ? "Start" : "Done"}
                      </button>
                    </div>
                  );
                })}
                {todayTasks.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <CheckCircle2 size={20} className="text-green-300 mx-auto mb-2"/>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">All done for today!</p>
                  </div>
                )}
              </div>
            </div>

            {/* By category */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Filter size={13}/>By Category
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {CATEGORIES.map(cat => {
                  const total = tasks.filter(t => t.category === cat.key).length;
                  const done  = tasks.filter(t => t.category === cat.key && t.status === "done").length;
                  if (total === 0) return null;
                  const CatIcon = cat.icon;
                  return (
                    <div key={cat.key} className="flex items-center gap-3">
                      <div className={`w-6 h-6 ${cat.color} flex items-center justify-center shrink-0`}>
                        <CatIcon size={11} className="text-white"/>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black uppercase text-slate-600">{cat.key}</span>
                          <span className="text-[9px] font-black text-slate-400">{done}/{total}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5">
                          <div className={`h-1.5 ${cat.color} transition-all`} style={{ width: total>0 ? `${(done/total)*100}%` : "0%" }}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick add templates */}
            <div className="bg-[#1e293b] text-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                  <Zap size={13}/>Quick Add Templates
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { title:"Water quality test",    category:"Water Quality", priority:"High",   recurring:"daily"  },
                  { title:"Feed tray assessment",  category:"Feeding",       priority:"High",   recurring:"daily"  },
                  { title:"Probiotic application", category:"Medicine",      priority:"Medium", recurring:"weekly" },
                  { title:"Pond net inspection",   category:"Maintenance",   priority:"Low",    recurring:"weekly" },
                  { title:"Mortality count",       category:"Sampling",      priority:"Medium", recurring:"daily"  },
                ].map(tmpl => (
                  <button key={tmpl.title}
                    onClick={() => {
                      const pond = activePond || ponds[0];
                      handleAdd({
                        ...tmpl,
                        id: Date.now() + Math.random(),
                        status: "pending",
                        pondId: pond?._id || "",
                        pondLabel: pond?.label || "Farm",
                        dueDate: new Date().toISOString().split("T")[0],
                        notes: "",
                        completedAt: null,
                        createdAt: new Date().toISOString().split("T")[0],
                      });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left">
                    <Plus size={10} className="text-green-400 shrink-0"/>
                    <span className="text-[10px] font-bold text-slate-300 truncate">{tmpl.title}</span>
                    <span className="ml-auto text-[8px] font-black text-slate-500 uppercase shrink-0">{tmpl.recurring}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <AddTaskModal
            onClose={() => setShowModal(false)}
            onAdd={handleAdd}
            ponds={ponds}
            defaultPondId={activePond?._id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}