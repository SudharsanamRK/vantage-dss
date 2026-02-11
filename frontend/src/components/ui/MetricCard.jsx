import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function MetricCard({ label, value, unit, trend, status }) {
  const isCritical = status === "critical";
  const isWarning = status === "warning";

  return (
    <div className={`glass-panel p-6 rounded-3xl relative overflow-hidden group transition-all hover:scale-[1.02] ${
      isCritical ? "border-red-200 bg-red-50/30" : ""
    }`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">{label}</p>
        <div className={isCritical ? "text-red-500" : "text-blue-500"}>
          {trend === "up" ? <TrendingUp size={16} /> : trend === "down" ? <TrendingDown size={16} /> : <Minus size={16} />}
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <h4 className={`text-4xl font-black tracking-tighter ${isCritical ? "text-red-600" : "text-slate-900"}`}>
          {value}
        </h4>
        <span className="text-slate-400 text-xs font-bold uppercase">{unit}</span>
      </div>

      <div className={`mt-4 h-1 w-full rounded-full bg-slate-100 overflow-hidden`}>
         <motion.div 
           initial={{ width: 0 }} 
           animate={{ width: "70%" }} 
           className={`h-full ${isCritical ? "bg-red-500" : "bg-blue-500"}`} 
         />
      </div>
    </div>
  );
}