import React from "react";
import { usePond } from "../../context/PondContext";
import { 
  Cpu, Bell, Search, MapPin, 
  UserCircle, Settings, LogOut, Info 
} from "lucide-react";

export default function Topbar() {
  const { mode, setMode, sensorData } = usePond();
  const isCritical = mode === "CRITICAL";

  return (
    <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
      
      {/* 1. ASSET NAVIGATOR (Critical for farmers with multiple ponds) */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
          <MapPin size={16} className="text-blue-600" />
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Active Unit</p>
            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{sensorData?.label || "POND_01"}</p>
          </div>
        </div>

        {/* Global Search - IRL users need to find "Logs" or "Alarms" fast */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-xl w-64 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search farm records..." 
            className="bg-transparent text-xs font-medium outline-none w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* 2. SYSTEM STATUS & TOOLS */}
      <div className="flex items-center gap-4">
        
        {/* Real-time Integrity Indicator */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
           <div className={`h-2 w-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
           <p className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">
             {isCritical ? "Uplink Error" : "Stream: Healthy"}
           </p>
        </div>

        {/* Global Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* 3. USER PROFILE (The IRL "I'm logged in" feeling) */}
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-900 uppercase leading-none">John Doe</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Head Operator</p>
          </div>
          <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-black italic shadow-lg border-2 border-white ring-1 ring-slate-200">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}