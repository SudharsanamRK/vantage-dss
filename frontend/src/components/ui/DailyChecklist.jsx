import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function DailyChecklist() {
  const tasks = [
    { time: "06:00 AM", task: "Oxygen Level Check (Pre-Feed)", status: "done" },
    { time: "08:30 AM", task: "First Feeding Cycle - 25kg Bloom", status: "pending" },
    { time: "12:00 PM", task: "Water Temperature & pH Scan", status: "pending" },
    { time: "05:00 PM", task: "Second Feeding Cycle - 25kg Bloom", status: "pending" },
    { time: "08:00 PM", task: "Night Aeration System Activation", status: "pending" }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6">
      <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 text-center">Operational Timeline</h3>
      <div className="space-y-4">
        {tasks.map((t, i) => (
          <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${t.status === 'done' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
            {t.status === 'done' ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Circle className="text-slate-300" size={18} />}
            <div>
              <p className="text-[10px] font-black text-slate-900">{t.task}</p>
              <p className="text-[8px] font-bold text-slate-400">{t.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}