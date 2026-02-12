import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Zap, Bell, FileText, Scale, BarChart3, 
  Map as MapIcon, Activity, IndianRupee, Settings,
  Menu, ChevronLeft
} from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const nav = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/map", icon: <MapIcon size={18} />, label: "Ponds" },
    { to: "/feeding", icon: <Zap size={18} />, label: "Feeding" },
    { to: "/stock", icon: <Scale size={18} />, label: "Biomass" },
    { to: "/simulator", icon: <BarChart3 size={18} />, label: "Harvest" },
    { to: "/health", icon: <Activity size={18} />, label: "Health" },
    { to: "/economics", icon: <IndianRupee size={18} />, label: "Finance" },
    { to: "/setup", icon: <Settings size={18} />, label: "Setup" },
    { to: "/alerts", icon: <Bell size={18} />, label: "Alerts" },
    { to: "/reports", icon: <FileText size={18} />, label: "Logbook" },
  ];

  return (
    <aside 
      /* Reduced width from 260px to 200px to remove dead space */
      style={{ width: isCollapsed ? "70px" : "200px" }}
      className="sticky top-0 z-50 flex h-screen flex-col bg-[#fcfdfc] border-r border-stone-300 shadow-sm transition-all duration-200"
    >
      {/* FLAT TOGGLE BUTTON */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-green-700 text-white p-1 border border-stone-300 z-[70] hover:bg-green-800 cursor-pointer"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* BRANDING SECTION - Center aligned */}
      <div className={`mt-10 mb-8 flex items-center ${isCollapsed ? "justify-center" : "px-6"}`}>
        <h1 className="font-bold text-[#1a2e1a] text-lg tracking-tight uppercase">
          {isCollapsed ? "V" : "VANTAGE"}
        </h1>
      </div>

      {/* NAVIGATION LIST */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {nav.map((item) => (
          <NavLink 
            key={item.label} 
            to={item.to} 
            className={({ isActive }) => `
              no-underline flex items-center py-2.5 px-3 transition-none
              ${isActive 
                ? "bg-green-700 text-white" 
                : "text-stone-600 hover:bg-stone-200 hover:text-black"}
            `}
          >
            <div className={`shrink-0 ${isCollapsed ? "mx-auto" : "ml-1"}`}>
              {item.icon}
            </div>
            
            {!isCollapsed && (
              <span className="ml-3 text-[13px] font-semibold whitespace-nowrap">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pb-4" />
    </aside>
  );
}