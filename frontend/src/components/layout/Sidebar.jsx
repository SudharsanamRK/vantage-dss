import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Zap, Bell, FileText, Scale, BarChart3, 
  Map as MapIcon, Activity, IndianRupee, Settings,
  Menu, ChevronLeft, Terminal
} from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Navigation configuration matching your dashboard modules
  const nav = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/map", icon: <MapIcon size={20} />, label: "Spatial" },
    { to: "/feeding", icon: <Zap size={20} />, label: "Bio-Logic" },
    { to: "/stock", icon: <Scale size={20} />, label: "Stock Pulse" },
    { to: "/simulator", icon: <BarChart3 size={20} />, label: "Harvest Sim" },
    { to: "/health", icon: <Activity size={20} />, label: "Health Doctor" },
    { to: "/economics", icon: <IndianRupee size={20} />, label: "Economics" },
    { to: "/setup", icon: <Settings size={20} />, label: "Farm Setup" },
    { to: "/alerts", icon: <Bell size={20} />, label: "Signals" },
    { to: "/reports", icon: <FileText size={20} />, label: "Archive" },
  ];

  return (
    <aside 
      className={`sticky top-0 z-50 flex h-screen flex-col bg-white border-r border-slate-200 transition-all duration-500 ease-in-out shadow-2xl ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* TOGGLE BUTTON: Floating action to collapse/expand */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-slate-900 text-white p-1.5 rounded-full border-4 border-white hover:scale-110 transition-transform z-[60] shadow-md"
      >
        {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* BRANDING SECTION: Vantage Identity */}
      <div className={`mt-8 mb-12 transition-all duration-500 flex flex-col ${isCollapsed ? "items-center" : "px-10"}`}>
        <h1 className={`font-black italic text-slate-900 uppercase leading-none transition-all duration-500 ${isCollapsed ? "text-2xl" : "text-3xl tracking-[-0.1em]"}`}>
          {isCollapsed ? "V" : "VANTAGE"}
        </h1>
        {!isCollapsed && (
          <span className="block text-[6px] font-black tracking-[0.3em] text-blue-600 mt-2 ml-0.5 opacity-90 whitespace-nowrap uppercase">
            Precision Aquaculture Intelligence
          </span>
        )}
      </div>

      {/* NAVIGATION: Main links with centered active state logic */}
      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-3 custom-scrollbar">
        {nav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center rounded-2xl transition-all duration-300 group relative ${
                isCollapsed 
                  ? "justify-center h-12 w-12 mx-auto" // Perfect centered square when collapsed
                  : "px-4 py-3 gap-4 mx-2"            // Spacious row when expanded
              } ${
                isActive
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`
            }
          >
            {/* ICON: Subtle rotation on hover for expanded state */}
            <div className={`shrink-0 transition-transform duration-300 ${!isCollapsed && "group-hover:rotate-12"}`}>
              {item.icon}
            </div>
            
            {/* LABEL: Hidden during collapse, animated entrance */}
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-opacity duration-300">
                {item.label}
              </span>
            )}

            {/* TOOLTIP: Only visible when the sidebar is minimized */}
            {isCollapsed && (
              <div className="absolute left-16 bg-slate-900 text-white text-[8px] font-bold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl border border-white/10">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* OPERATOR INFO / NODE STATUS: Bottom anchor */}
      <div className={`transition-all duration-500 overflow-hidden ${
        isCollapsed ? "h-0 opacity-0 mb-0" : "h-auto p-5 m-6 bg-slate-50 rounded-[2rem] border border-slate-100"
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Terminal size={12} className="text-blue-500" />
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
            Node Integrity: 99%
          </p>
        </div>
        <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-700 font-mono tracking-tighter">
              PND_ALPHA_01
            </p>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        </div>
      </div>
    </aside>
  );
}