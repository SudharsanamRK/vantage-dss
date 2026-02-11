import React, { useState } from 'react';
import { IndianRupee, TrendingUp, Scale, Calculator, Plus, Minus } from 'lucide-react';

export default function ProfitCalculator() {
  const [marketPrice, setMarketPrice] = useState(180);

  // Default values based on your setup
  const inputs = {
    stockCount: 10000,
    avgWeight: 0.85, 
    totalFeed: 12500, 
    feedPrice: 45, 
  };

  const totalBiomass = inputs.stockCount * inputs.avgWeight;
  const fcr = (inputs.totalFeed / totalBiomass).toFixed(2);
  const revenue = totalBiomass * marketPrice;
  const feedCost = inputs.totalFeed * inputs.feedPrice;
  const estimatedProfit = revenue - feedCost - (revenue * 0.15);

  const formatLakh = (num) => (num / 100000).toFixed(2);

  return (
    <div className="bg-slate-900 rounded-[3rem] p-8 text-white overflow-hidden relative border border-white/5 shadow-2xl">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calculator size={16} className="text-blue-400" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Economic Projection</h3>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
             <span className="text-[10px] font-black uppercase text-slate-500">Market ₹/KG</span>
             <button onClick={() => setMarketPrice(p => p - 5)} className="hover:text-blue-400"><Minus size={12}/></button>
             <span className="text-sm font-black italic text-blue-400">{marketPrice}</span>
             <button onClick={() => setMarketPrice(p => p + 5)} className="hover:text-blue-400"><Plus size={12}/></button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="space-y-1">
            <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Feed Conversion (FCR)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black italic tracking-tighter text-white">{fcr}</span>
              <Scale size={18} className="text-emerald-400" />
            </div>
            <p className={`text-[9px] font-black px-2 py-0.5 rounded inline-block mt-2 ${fcr < 1.5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
              {fcr < 1.5 ? "HIGH EFFICIENCY" : "OPTIMIZATION NEEDED"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Est. Net Profit</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black italic tracking-tighter text-blue-400">₹{formatLakh(estimatedProfit)}L</span>
            </div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2">After 15% Op-Ex Margin</p>
          </div>
        </div>

        <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">Total Harvest Biomass</span>
            <span className="text-slate-200 border-b border-white/10">{totalBiomass.toLocaleString()} KG</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">Projected Gross Revenue</span>
            <span className="text-emerald-400 italic">₹{formatLakh(revenue)}L</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">Total Feed Procurement</span>
            <span className="text-red-400/80 italic">₹{formatLakh(feedCost)}L</span>
          </div>
        </div>
      </div>
      
      <TrendingUp size={140} className="absolute -right-8 -bottom-8 text-blue-500 opacity-5 rotate-12 pointer-events-none" />
    </div>
  );
}