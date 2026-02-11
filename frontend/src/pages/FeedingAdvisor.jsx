import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, AlertTriangle, Scale, TrendingUp, DollarSign, 
  Activity, ShieldCheck, Target, Play, Pause, 
  Thermometer, Droplets, ChevronRight, Settings2, Clock
} from "lucide-react";

export default function FeedingAdvisor() {
  const [isPaused, setIsPaused] = useState(false);
  const [currentHour] = useState(new Date().getHours());
  const [isCrisis, setIsCrisis] = useState(false);
  const [liveDO, setLiveDO] = useState(6.4);
  const [liveTemp, setLiveTemp] = useState(28.2);

  // Simulation logic
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isCrisis) {
        setLiveDO(prev => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(1));
        setLiveTemp(prev => +(prev + (Math.random() * 0.1 - 0.05)).toFixed(1));
      } else {
        setLiveDO(2.8);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isCrisis]);

  const metabolicWindow = [40, 45, 60, 85, 95, 100, 90, 70, 40, 20, 10, 5, 5, 10, 30, 50, 70, 85, 90, 80, 60, 40, 30, 25];

  // FarmOS Industrial Palette
  const theme = isCrisis 
    ? { primary: "#ef4444", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" }
    : { primary: "#168039", bg: "bg-[#f3f6f9]", text: "text-[#168039]", border: "border-slate-200" };

  return (
    <div className={`min-h-screen ${theme.bg} text-[#2d3e50] font-sans p-6 transition-colors duration-500`}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* HEADER SECTION (FarmOS Style) */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Assets / Ponds / POND_04 / Feeding
            </p>
            <h1 className="text-3xl font-light">
              Feeding Advisor: <span className="font-bold uppercase tracking-tight">Bio-Logic Protocol</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCrisis(!isCrisis)}
              className={`px-4 py-2 text-xs font-bold uppercase rounded shadow-sm border transition-all ${
                isCrisis ? "bg-red-600 text-white border-red-700" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isCrisis ? <AlertTriangle size={14} className="inline mr-2"/> : <ShieldCheck size={14} className="inline mr-2"/>}
              {isCrisis ? "System Override" : "Test Alert"}
            </button>
            <button className="bg-[#168039] text-white px-6 py-2 text-xs font-bold uppercase rounded shadow-sm hover:bg-[#12662d]">
              Quick Log
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Vitals & Status */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* LIVE VITALS (Modular Table Style) */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-sm">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-slate-400" /> Real-Time Vitals
                </h3>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="divide-y divide-slate-100">
                <SensorRow icon={<Droplets size={16}/>} label="Oxygen (DO)" value={`${liveDO} mg/L`} trend="+2.1%" />
                <SensorRow icon={<Thermometer size={16}/>} label="Temperature" value={`${liveTemp}°C`} trend="Stable" />
                <SensorRow icon={<Scale size={16}/>} label="Est. Biomass" value="1,240 kg" trend="+12kg" />
              </div>
            </div>

            {/* PROTOCOL CARD (Dark Industrial Style) */}
            <div className="bg-[#2d3e50] text-white rounded-sm shadow-lg overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Target size={18} className="text-emerald-400" />
                <h3 className="font-bold text-sm tracking-tight uppercase">Active Protocol</h3>
              </div>
              <div className="p-6">
                <div className="text-5xl font-light mb-2">
                  {isCrisis ? <span className="text-red-400 font-bold">SUSPENDED</span> : "42.5 KG"}
                </div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  {isCrisis ? "CRITICAL OXYGEN STRESS DETECTED" : "OPTIMAL DIURNAL WINDOW"}
                </p>
                <div className="mt-6 h-1 w-full bg-white/10 rounded-full">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: isCrisis ? "100%" : "65%" }} 
                    className={`h-full ${isCrisis ? 'bg-red-500' : 'bg-emerald-400'}`} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Charting */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 shadow-sm rounded-sm">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-slate-400" /> Metabolic Efficiency (24H Cycle)
                </h3>
                <div className="flex gap-2">
                  <button className="text-[10px] font-bold bg-[#2d3e50] text-white px-2 py-0.5 rounded-sm">24H</button>
                  <button className="text-[10px] font-bold text-slate-400 px-2 py-0.5">7D</button>
                </div>
              </div>
              
              <div className="p-8 h-[350px] flex flex-col">
                <div className="flex-1 flex items-end gap-1 border-b border-slate-100 pb-2">
                  {metabolicWindow.map((val, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          isCrisis ? 'bg-red-100' :
                          i === currentHour ? 'bg-[#168039]' : 
                          'bg-slate-100 group-hover:bg-slate-200'
                        }`}
                      />
                      {i === currentHour && (
                        <div className="absolute -top-6 text-[8px] font-bold text-[#168039] uppercase">Now</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>00:00</span>
                  <span>{currentHour > 18 || currentHour < 6 ? 'Nocturnal Phase' : 'Diurnal Phase'}</span>
                  <span>23:59</span>
                </div>
              </div>
            </div>

            {/* ECONOMIC TILES (Modular Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EconomicBox label="Expenditure" value="$124.50" sub="Session Cost" icon={<DollarSign size={16}/>} />
              <EconomicBox label="Conversion" value="1.2 FCR" sub="Batch Perf." icon={<TrendingUp size={16}/>} />
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center justify-center gap-3 font-bold uppercase text-xs rounded-sm border shadow-sm transition-all h-full min-h-[80px] ${
                  isPaused ? "bg-[#2d3e50] text-white border-[#2d3e50]" : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isPaused ? <Play size={16} fill="white"/> : <Pause size={16} fill="currentColor"/>}
                {isPaused ? "Resume System" : "Pause System"}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR (FarmOS Industrial Footer) */}
        <div className="bg-white border-t-2 border-[#168039] shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 rounded-sm">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-slate-100 rounded-sm flex items-center justify-center text-[#168039]">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-tight">Execute Bio-Logic Feed</p>
              <p className="text-xs text-slate-400 font-medium">Auto-calculated dosing: <span className="text-slate-700">42.5kg @ 150g/min</span></p>
            </div>
          </div>
          <button className="w-full md:w-auto bg-[#168039] hover:bg-[#12662d] text-white px-10 py-4 rounded-sm font-bold uppercase text-sm tracking-widest shadow-md flex items-center justify-center gap-3">
            Start Operation <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function SensorRow({ icon, label, value, trend }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="text-slate-400 group-hover:text-[#168039] transition-colors">{icon}</div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-lg font-bold text-slate-800 tracking-tight">{value}</p>
        </div>
      </div>
      <div className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm uppercase">
        {trend}
      </div>
    </div>
  );
}

function EconomicBox({ label, value, sub, icon }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">{sub}</p>
      </div>
      <div className="text-slate-300">{icon}</div>
    </div>
  );
}