import React from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, 
  Wind, Droplet 
} from 'lucide-react';
import { usePond } from '../../context/PondContext';

export default function WQDoctor() {
  const { sensorData } = usePond();

  const getDiagnosis = () => {
    // Map context data to logic - Ensure these keys match your PondContext!
    const { do: dissolvedOxygen, ph, ammonia } = sensorData;
    let suggestions = [];
    let status = "OPTIMAL";

    // DO Logic
    if (dissolvedOxygen < 5) {
      suggestions.push({ 
        icon: <Wind size={16} className="text-red-500" />, 
        text: "Low Oxygen: Run all Paddle Wheel Aerators immediately.", 
        severity: "CRITICAL" 
      });
      status = "CRITICAL";
    }

    // Ammonia Logic
    if (ammonia > 0.1) {
      suggestions.push({ 
        icon: <Droplet size={16} className="text-orange-500" />, 
        text: "Ammonia Spike: Apply 50kg Zeolite & reduce feeding by 50%.", 
        severity: "WARNING" 
      });
      if(status !== "CRITICAL") status = "WARNING";
    }

    // pH Logic
    if (ph < 7.5) {
      suggestions.push({ 
        icon: <Droplet size={16} className="text-blue-500" />, 
        text: "Low pH: Apply agricultural lime to stabilize acidity.", 
        severity: "STABILIZE" 
      });
    }

    return { suggestions, status };
  };

  const { suggestions, status } = getDiagnosis();

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden relative h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Biological Advisor</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 italic tracking-tighter">
            Analyzing: {sensorData.label}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
          status === "OPTIMAL" 
            ? "bg-emerald-100 text-emerald-600" 
            : "bg-red-100 text-red-600 animate-pulse border border-red-200"
        }`}>
          {status}
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all hover:translate-x-1">
              <div className="mt-1 shrink-0">{s.icon}</div>
              <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{s.text}</p>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <CheckCircle className="text-emerald-500" size={16} />
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-tight">System nominal. No corrective action required.</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center opacity-50">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Diagnostic Active</span>
        <Activity size={12} className="text-blue-500" />
      </div>
    </div>
  );
}