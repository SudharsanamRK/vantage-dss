import React, { useState } from "react";
import { BarChart3, ChevronDown, X } from "lucide-react";
import { analyzePond } from "../../engine/farmBrain";

function calcDOC(sd) {
  return !sd ? 0 : Math.max(0, Math.floor((Date.now() - new Date(sd)) / 86400000));
}

function getB(pond) {
  const doc = calcDOC(pond.stockingDate);
  return analyzePond(
    { do: pond.do, temp: pond.temp, ammonia: pond.ammonia, ph: pond.ph },
    { species: pond.species, waterType: pond.waterType, fishCount: pond.fishCount,
      avgSeedWeight: pond.avgSeedWeight, survivalEstimate: pond.survivalEstimate,
      doc, targetHarvestWeight: pond.targetHarvestWeight,
      targetHarvestDays: pond.targetHarvestDays,
      expectedPrice: pond.expectedPrice, feedCostPerKg: pond.feedCostPerKg,
      seedCost: pond.seedCost, laborCost: pond.laborCost,
      electricityCost: pond.electricityCost, medicineCost: pond.medicineCost,
      fcrTarget: pond.fcrTarget,
    }
  );
}

const ROWS = [
  { label: "Species",           get: (p)      => p.species || "—"                              },
  { label: "DOC",               get: (p)      => `${calcDOC(p.stockingDate)}d`                  },
  { label: "Health Score",      get: (_, b)   => `${b.healthScore ?? "—"}/100`                  },
  { label: "Status",            get: (_, b)   => b.status || "—"                                },
  { label: "Dissolved O₂",      get: (p)      => p.do      ? `${p.do} mg/L`    : "—"            },
  { label: "Temperature",       get: (p)      => p.temp    ? `${p.temp}°C`     : "—"            },
  { label: "pH",                get: (p)      => p.ph      ? `${p.ph}`         : "—"            },
  { label: "Ammonia",           get: (p)      => p.ammonia ? `${p.ammonia} ppm`: "—"            },
  { label: "Biomass Est.",      get: (_, b)   => b.currentBiomassKg ? `${b.currentBiomassKg} kg` : "—" },
  { label: "Avg Weight",        get: (_, b)   => b.currentAvgWeight ? `${b.currentAvgWeight}g`  : "—" },
  { label: "Survival %",        get: (_, b)   => b.survivalProb ? `${b.survivalProb}%`           : "—" },
  { label: "Projected Revenue", get: (_, b)   => b.grossRevenue  ? `₹${b.grossRevenue}L`        : "—" },
  { label: "Net Profit",        get: (_, b)   => b.netProfit     ? `₹${b.netProfit}L`           : "—" },
  { label: "Risk Level",        get: (_, b)   => b.riskLevel || "—"                             },
  { label: "Feed Advice",       get: (_, b)   => b.feedingAdvice || "—"                         },
];

function PondSelect({ ponds, value, onChange, exclude }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-white/10 text-white px-3 py-2.5
          text-xs font-mono focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer">
        <option value="">— Select Pond —</option>
        {ponds.filter(p => p._id !== exclude).map(p => (
          <option key={p._id} value={p._id}>{p.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

export default function PondComparison({ ponds }) {
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  const pA = ponds.find(p => p._id === idA);
  const pB = ponds.find(p => p._id === idB);
  const bA = pA ? getB(pA) : null;
  const bB = pB ? getB(pB) : null;

  return (
    <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2">
        <BarChart3 size={13} className="text-indigo-500" />
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Pond Comparison</h3>
        <span className="text-[9px] font-bold text-slate-400 ml-2">Select two ponds to compare</span>
      </div>

      {/* Pond selectors */}
      <div className="grid grid-cols-2 gap-0 bg-slate-900">
        <div className="p-4 border-r border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Pond A</p>
          <PondSelect ponds={ponds} value={idA} onChange={setIdA} exclude={idB} />
        </div>
        <div className="p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Pond B</p>
          <PondSelect ponds={ponds} value={idB} onChange={setIdB} exclude={idA} />
        </div>
      </div>

      {/* Comparison table */}
      {(pA || pB) ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-36">Metric</th>
                <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-emerald-700">
                  {pA?.label || "—"}
                </th>
                <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-blue-700">
                  {pB?.label || "—"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROWS.map(({ label, get }) => {
                const valA = pA ? get(pA, bA) : "—";
                const valB = pB ? get(pB, bB) : "—";
                return (
                  <tr key={label} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</td>
                    <td className="px-4 py-2.5 text-xs font-black text-slate-800">{valA}</td>
                    <td className="px-4 py-2.5 text-xs font-black text-slate-800">{valB}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 text-center">
          <BarChart3 size={24} className="text-slate-200 mx-auto mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select two ponds above to compare</p>
        </div>
      )}
    </div>
  );
}