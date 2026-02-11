import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  Thermometer,
  Droplets,
  Map as MapIcon,
  Info,
  Activity,
  Maximize2,
  RefreshCcw,
  Settings2,
  ChevronRight,
  Target
} from "lucide-react";

/* --------------------------------------------------
   COLOR MAP (Matches farmOS Industrial Palette)
-------------------------------------------------- */
const COLOR_MAP = {
  blue: { bg: "bg-blue-600", text: "text-blue-600", glow: "bg-blue-400" },
  orange: { bg: "bg-orange-600", text: "text-orange-600", glow: "bg-orange-400" },
  emerald: { bg: "bg-[#168039]", text: "text-[#168039]", glow: "bg-emerald-400" },
};

const INITIAL_SENSORS = [
  { id: 1, type: "DO", icon: <Wind size={18} />, top: "25%", left: "20%", value: "6.2", label: "OXYGEN_NODE_01", color: "blue" },
  { id: 2, type: "TEMP", icon: <Thermometer size={18} />, top: "65%", left: "60%", value: "28°C", label: "THERMAL_PROBE_A", color: "orange" },
  { id: 3, type: "PH", icon: <Droplets size={18} />, top: "45%", left: "45%", value: "7.4", label: "ACIDITY_SCAN_04", color: "emerald" },
];

export default function PondMap() {
  const [sensors, setSensors] = useState(INITIAL_SENSORS);
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f6f9] text-[#2d3e50] font-sans p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER (FarmOS Style) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Assets / Ponds / POND_ALPHA_01</p>
            <h1 className="text-3xl font-light">Spatial Command: <span className="font-bold uppercase tracking-tight">POND_ALPHA_01</span></h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 text-xs font-bold uppercase rounded shadow-sm transition-all border ${
                showHeatmap ? "bg-[#2d3e50] text-white border-[#2d3e50]" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Activity size={14} className="inline mr-2" />
              {showHeatmap ? "Heatmap Active" : "Analyze Coverage"}
            </button>
            <button onClick={() => setSensors(INITIAL_SENSORS)} className="px-4 py-2 bg-white border border-slate-300 text-xs font-bold uppercase rounded shadow-sm hover:bg-slate-50">
              <RefreshCcw size={14} className="inline mr-2" /> Reset Nodes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
          
          {/* LEFT SIDEBAR: Inventory & Infrastructure (Matches Metadata Sidebar in Image) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* INVENTORY CARD */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-sm flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Settings2 size={14} className="text-slate-400" /> Sensor Inventory
                </h3>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto">
                {sensors.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-sm ${COLOR_MAP[s.color].bg} text-white`}>
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900">{s.label}</p>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Uplink: Stable</p>
                      </div>
                    </div>
                    <span className="text-sm font-black">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TOPOLOGY INFO (Matches Dark Sidebar Card) */}
            <div className="bg-[#2d3e50] text-white p-5 rounded-sm shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-emerald-400 mb-3">
                  <Target size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Topology AI</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Drag nodes to adjust spatial alignment. Triangulation analysis is recalculated in real-time based on perimeter GPS coordinates.
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                  <span>Coverage Index</span>
                  <span className="text-emerald-400">94.2%</span>
                </div>
              </div>
              <Maximize2 size={80} className="absolute -right-6 -bottom-6 text-white opacity-5" />
            </div>
          </div>

          {/* MAIN MAP AREA */}
          <div className="lg:col-span-9 relative rounded-sm border border-slate-200 overflow-hidden bg-white shadow-inner">
            {/* INDUSTRIAL GRID */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "linear-gradient(#2d3e50 1px, transparent 1px), linear-gradient(90deg, #2d3e50 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* HEATMAP LAYER */}
            <AnimatePresence>
              {showHeatmap && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
                  {sensors.map((s) => (
                    <div
                      key={`heat-${s.id}`}
                      className={`absolute rounded-full blur-[100px] ${COLOR_MAP[s.color].glow}`}
                      style={{ width: "400px", height: "400px", top: s.top, left: s.left, transform: "translate(-50%, -50%)" }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* NODES (Sharper, Industrial Style) */}
            {sensors.map((sensor) => (
              <motion.div
                key={sensor.id}
                drag
                dragMomentum={false}
                style={{ position: "absolute", top: sensor.top, left: sensor.left, transform: "translate(-50%, -50%)" }}
                className="cursor-grab active:cursor-grabbing z-20"
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-white rounded-sm shadow-md flex items-center justify-center border border-slate-300 relative">
                    <div className={COLOR_MAP[sensor.color].text}>
                      {sensor.icon}
                    </div>
                    {/* Status Dot */}
                    <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-[#168039] rounded-full border-2 border-white" />
                  </div>

                  <div className="mt-2 bg-[#2d3e50] px-2 py-1 rounded-sm shadow-lg flex items-center gap-2 border border-white/10">
                    <span className="text-[10px] text-white font-bold">{sensor.value}</span>
                    <span className="text-slate-500 text-[10px]">|</span>
                    <span className="text-[8px] text-slate-300 font-bold uppercase tracking-tight">{sensor.label}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* MAP DATA OVERLAYS */}
            <div className="absolute bottom-6 left-6 bg-white/90 border border-slate-200 p-3 rounded-sm shadow-sm">
              <p className="uppercase text-[9px] font-bold text-slate-400 tracking-widest mb-1">GPS Origin</p>
              <p className="text-xs font-mono font-bold tracking-tight text-[#2d3e50]">11.0168° N · 76.9558° E</p>
            </div>

            <div className="absolute bottom-6 right-6 text-right">
              <p className="uppercase text-[9px] font-bold text-slate-400 tracking-widest">Perimeter Dimensions</p>
              <p className="text-4xl font-light tracking-tighter text-[#2d3e50]">
                42.0<span className="text-slate-300">m</span> <span className="text-slate-200">×</span> 28.5<span className="text-slate-300">m</span>
              </p>
            </div>

            <div className="absolute top-6 right-6 bg-white border border-slate-200 px-3 py-1.5 rounded-sm shadow-sm flex items-center gap-2">
              <MapIcon size={14} className="text-[#168039]" />
              <span className="text-[10px] font-bold uppercase text-slate-600 tracking-widest">
                Sector Alpha Pond
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}