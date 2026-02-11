import React, { useState } from "react";
import { usePond } from "../context/PondContext";
import { analyzePond } from "../engine/farmBrain";
import { 
  TrendingUp, Wallet, ShoppingBag, Activity, 
  Zap, ChevronRight, Plus, PieChart, 
  AlertCircle, Scale, Calendar, ArrowRightLeft
} from "lucide-react";

export default function Economics() {
  const { sensorData } = usePond();
  const brain = analyzePond(sensorData);
  
  // Simulation State
  const [waitDays, setWaitDays] = useState(7);

  const expenses = [
    { item: "Feed Inventory", cost: 85000, cat: "Feed", perc: 62 },
    { item: "Energy Consumption", cost: 24000, cat: "Utilities", perc: 18 },
    { item: "On-site Labor", cost: 14000, cat: "Labor", perc: 10 },
    { item: "Biocides/Probiotics", cost: 13000, cat: "Meds", perc: 10 },
  ];

  const totalExpenses = expenses.reduce((a, b) => a + b.cost, 0);
  
  // "If I Wait" Simulator Logic
  const sellToday = parseFloat(brain.projectedRevenue);
  const sellLater = (sellToday * (1 + (waitDays * 0.015))).toFixed(2); // Assumes 1.5% growth/day
  const riskColor = waitDays > 10 ? "text-red-500" : "text-amber-500";

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#212529] font-sans">
      <div className="flex-1 p-6 lg:p-10 space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <nav className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">
              Management / Portfolio / Yield Economics
            </nav>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Economics: <span className="font-semibold italic text-slate-900">Capital Flow</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm">
              <Plus size={14} /> Log Expense
            </button>
            <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-lg transition-all">
              Download P&L
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. "IF I WAIT" HARVEST SIMULATOR */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <Scale size={16} className="text-blue-600" /> Harvest Timing Simulator
                </h3>
                <div className="flex items-center gap-4">
                   <input 
                    type="range" min="1" max="21" value={waitDays} 
                    onChange={(e) => setWaitDays(e.target.value)}
                    className="w-32 accent-slate-900"
                   />
                   <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded">+{waitDays} Days</span>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Sell Today</p>
                  <p className="text-3xl font-light tracking-tighter text-slate-400">₹{sellToday}L</p>
                </div>
                <div className="flex justify-center text-slate-200">
                  <ArrowRightLeft size={40} strokeWidth={1} />
                </div>
                <div className="text-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-2 italic">Projected Value</p>
                  <p className="text-4xl font-black tracking-tighter text-slate-900">₹{sellLater}L</p>
                  <p className={`text-[9px] font-black uppercase mt-2 ${riskColor}`}>Risk: {waitDays > 10 ? 'High' : 'Medium'}</p>
                </div>
              </div>
            </div>

            {/* 2. COST BREAKDOWN & CASH FLOW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <PieChart size={16} className="text-indigo-500" /> Expense Distribution
                </h3>
                <div className="space-y-4">
                  {expenses.map((e, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                        <span className="text-slate-500">{e.cat}</span>
                        <span className="text-slate-900">{e.perc}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-slate-900 h-full" style={{ width: `${e.perc}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-500" /> 7-Day Cash Requirement
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-slate-50 rounded border-l-4 border-emerald-500">
                    <span className="text-[10px] font-black uppercase text-slate-500">Scheduled Feed Buy</span>
                    <span className="text-xs font-bold font-mono">₹42,000</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded border-l-4 border-blue-500">
                    <span className="text-[10px] font-black uppercase text-slate-500">Utility Bill (Est)</span>
                    <span className="text-xs font-bold font-mono">₹8,500</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-50 rounded border-l-4 border-slate-400">
                    <span className="text-[10px] font-black uppercase text-slate-500">Labor Payouts</span>
                    <span className="text-xs font-bold font-mono">₹12,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: PROCUREMENT ENGINE */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-slate-900 text-white p-6 rounded-sm shadow-xl border-t-4 border-amber-500">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="text-amber-500" size={20} />
                <h3 className="font-black text-xs uppercase tracking-widest">Procurement Engine</h3>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white/5 border border-white/10 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-red-500/20 text-red-400 text-[8px] px-2 py-0.5 rounded font-black uppercase">Low Stock</span>
                    <span className="text-[9px] text-slate-400 font-mono italic">3 Days Left</span>
                  </div>
                  <p className="text-xs font-black uppercase mb-1">Bacillus Probiotic</p>
                  <p className="text-[10px] text-slate-400 mb-4">Market average: ₹1,200/kg</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-amber-500 text-slate-900 text-[10px] font-black py-2 rounded uppercase tracking-tighter hover:bg-amber-400 transition-colors">
                      Order Now
                    </button>
                    <button className="p-2 border border-white/20 rounded hover:bg-white/5">
                      <Zap size={14} className="text-amber-500" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded opacity-60">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Supplier Insights</p>
                   <div className="flex justify-between text-[10px]">
                      <span>AquaFeed Co.</span>
                      <span className="text-emerald-400 font-bold">BEST PRICE</span>
                   </div>
                </div>
              </div>
            </div>

            {/* ROI INDICATOR */}
            <div className="bg-white border border-slate-200 p-6 rounded-sm shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Feed ROI (FCR)</h3>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <p className="text-4xl font-black tracking-tighter text-slate-900 italic">
                {brain.feedEfficiency}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-tight">
                Current biomass conversion efficiency. High efficiency reduces cycle cost.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}