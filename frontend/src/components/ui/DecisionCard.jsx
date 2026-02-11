import React from 'react';
import { usePond } from '../../context/PondContext';
import { analyzePond } from '../../engine/farmBrain';
import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DecisionCard() {
  const { sensorData } = usePond();
  const brain = analyzePond(sensorData);

  return (
    <div className="bg-slate-900 text-white rounded-[2rem] p-6 border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <BrainCircuit className="text-blue-400" size={20} />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">FarmBrain Engine</h3>
          <p className="text-xs font-bold text-blue-400">STATUS: {brain.status}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Feeding Recommendation */}
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
          <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Recommended Action</p>
          <p className="text-sm font-black italic uppercase tracking-tight">{brain.feedingAdvice}</p>
        </div>

        {/* Profit Insight */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Projected Cycle Profit</p>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp size={14} />
              <span className="text-xl font-black">₹{brain.estProfit}L</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Health Score</p>
            <p className={`text-xl font-black ${brain.healthScore > 70 ? 'text-emerald-400' : 'text-red-400'}`}>
              {brain.healthScore}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}