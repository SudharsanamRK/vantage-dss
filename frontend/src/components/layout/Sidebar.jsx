import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Waves,
  Leaf,
  FishingHookIcon,
  HeartPulse,
  Wallet,
  ListChecks,
  NotebookText,
  SlidersHorizontal,
  Menu,
  ChevronLeft
} from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const nav = [
    { to: "/",          icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/map",       icon: <Waves size={18} />,           label: "Ponds"     },
    { to: "/feeding",   icon: <Leaf size={18} />,           label: "Feeding"   },
    { to: "/simulator", icon: <FishingHookIcon size={18} />,         label: "Harvest"   },
    { to: "/health",    icon: <HeartPulse size={18} />,      label: "Health"    },
    { to: "/economics", icon: <Wallet size={18} />,          label: "Finance"   },
    { to: "/alerts",    icon: <ListChecks size={18} />,      label: "Tasks"     },
    { to: "/reports",   icon: <NotebookText size={18} />,    label: "Logbook"   },
    { to: "/setup",     icon: <SlidersHorizontal size={18} />, label: "Setup"   },
  ];

  return (
    <aside
      style={{ width: isCollapsed ? "70px" : "200px" }}
      className="sticky top-0 z-50 flex h-screen flex-col bg-[#fcfdfc] border-r border-stone-300 shadow-sm transition-all duration-200"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-green-700 text-white p-1 border border-stone-300 z-[70] hover:bg-green-800 cursor-pointer"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
      </button>

    <div className={`mt-10 mb-8 ${isCollapsed ? "flex justify-center" : "px-5"}`}>

      {isCollapsed ? (
        <div className="relative w-9 h-9 flex items-center justify-center bg-green-700 shadow-sm">
          <span className="text-white font-black text-sm tracking-tight">F</span>
          <div className="absolute -bottom-1 w-3 h-[2px] bg-green-400"></div>
        </div>
      ) : (
        <div className="flex items-center gap-3">

          {/* System badge */}
          <div className="relative w-9 h-9 bg-green-700 flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm tracking-tight">F</span>

            {/* small status line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-400"></div>
          </div>

          {/* Brand text */}
          <div className="flex flex-col leading-tight">
            <span className="font-black text-[#1a2e1a] text-sm tracking-[0.25em] uppercase">
              FATHOM
            </span>

            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
              Aquaculture DSS
            </span>
          </div>

        </div>
      )}

    </div>


      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {nav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/"}
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
