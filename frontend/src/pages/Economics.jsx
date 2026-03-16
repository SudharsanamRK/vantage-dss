import React, { useState, useMemo } from "react";
import { usePond } from "../context/PondContext";
import {
  TrendingUp, Wallet, Activity, ChevronRight,
  Plus, PieChart, Scale, Calendar,
  ArrowRightLeft, IndianRupee, Fish, Target,
  BarChart3, Download, AlertTriangle, CheckCircle,
  Zap
} from "lucide-react";

// ─── Formatters ────────────────────────────────────────────────────────────────
// fmtL: formats a RAW rupee value into "₹X.XXL"
const fmtL   = (n) => `₹${(Number(n) / 100000).toFixed(2)}L`;
const fmtINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtNum = (n) => Number(n).toLocaleString("en-IN");
const safe   = (n, fallback = 0) =>
  (isNaN(n) || n === null || n === undefined) ? fallback : Number(n);

// ─── Components ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, bg, icon, alert }) {
  return (
    <div className={`${bg || "bg-white border border-slate-200"} p-4 shadow-sm relative overflow-hidden`}>
      {alert && (
        <div className="absolute top-2 right-2">
          <AlertTriangle size={11} className="text-red-500" />
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <span className="text-slate-200">{icon}</span>
      </div>
      <p className={`text-xl font-black tracking-tight ${color || "text-slate-900"}`}>{value}</p>
      {sub && <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ icon, title, badge }) {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
        {icon} {title}
      </h3>
      {badge}
    </div>
  );
}

function CostRow({ label, value, total, color }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-black uppercase text-slate-600">{label}</span>
          <span className="text-[10px] font-black text-slate-800">{fmtINR(value)}</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5">
          <div className={`h-1.5 ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-[9px] font-black text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

function PriceSensitivity({ projHarvestKg, totalCost, currentPrice }) {
  // totalCost is raw rupees, projHarvestKg is kg, currentPrice is ₹/kg
  const rows = [-60, -30, 0, +30, +60].map(delta => {
    const price   = currentPrice + delta;
    const revenue = projHarvestKg * price;                             // raw ₹
    const profit  = revenue - totalCost;                               // raw ₹
    const roi     = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(0) : 0;
    return { price, revenue, profit, roi, delta };
  });
  return (
    <table className="w-full text-left text-sm border-collapse">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
          {["Price (₹/kg)", "Revenue", "Net Profit", "ROI", "Signal"].map(h => (
            <th key={h} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map(({ price, revenue, profit, roi, delta }) => (
          <tr key={price} className={`hover:bg-slate-50 transition-colors ${delta === 0 ? "bg-green-50" : ""}`}>
            <td className={`px-4 py-3 font-black text-sm ${delta === 0 ? "text-green-700" : "text-slate-700"}`}>
              ₹{price}/kg
              {delta === 0 && (
                <span className="ml-2 text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 uppercase font-black border border-green-200">
                  Current
                </span>
              )}
            </td>
            <td className="px-4 py-3 font-bold text-slate-700">{fmtL(revenue)}</td>
            <td className={`px-4 py-3 font-black ${profit >= 0 ? "text-green-700" : "text-red-600"}`}>{fmtL(profit)}</td>
            <td className={`px-4 py-3 font-black ${Number(roi) >= 0 ? "text-green-700" : "text-red-600"}`}>{roi}%</td>
            <td className="px-4 py-3">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                profit > 0
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {profit > 0 ? "Profitable" : "Loss"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BreakEvenCard({ totalCost, projHarvestKg, currentPrice }) {
  // totalCost = raw ₹, projHarvestKg = kg, currentPrice = ₹/kg
  const bep     = projHarvestKg > 0 ? totalCost / projHarvestKg : 0;        // ₹/kg
  const bev     = currentPrice  > 0 ? totalCost / currentPrice  : 0;        // kg needed
  const margin  = currentPrice  > 0 && bep > 0
    ? (((currentPrice - bep) / currentPrice) * 100).toFixed(1)
    : 0;
  const isAbove = currentPrice >= bep;

  return (
    <div className={`border p-5 ${isAbove ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center gap-2 mb-3">
        {isAbove
          ? <CheckCircle size={14} className="text-green-600" />
          : <AlertTriangle size={14} className="text-red-500" />}
        <p className={`text-[10px] font-black uppercase tracking-widest ${isAbove ? "text-green-700" : "text-red-700"}`}>
          Break-Even Analysis — {isAbove ? "You're Above Break-Even ✓" : "Below Break-Even — Review Costs"}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Break-Even Price",  value: `₹${bep.toFixed(0)}/kg`,        sub: "Min price to profit"   },
          { label: "Break-Even Volume", value: `${fmtNum(Math.round(bev))} kg`, sub: "Min harvest to profit" },
          { label: "Safety Margin",     value: `${margin}%`,                    sub: "Buffer above BE"       },
        ].map(({ label, value, sub }) => (
          <div key={label}>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
            <p className={`text-lg font-black tracking-tight ${isAbove ? "text-green-800" : "text-red-700"}`}>{value}</p>
            <p className="text-[9px] font-bold text-slate-400">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Economics Page ───────────────────────────────────────────────────────
export default function Economics() {
  const { farmConfig, brain, activePond, doc } = usePond();
  const fc = farmConfig || {};
  const b  = brain      || {};

  const [waitDays, setWaitDays] = useState(7);

  // ── All monetary values from brain are raw rupees ──────────────────────────
  const grossRevenue = safe(b.grossRevenue);       // raw ₹
  const totalCost    = safe(b.totalCost);          // raw ₹
  const netProfit    = safe(b.netProfit);          // raw ₹
  const roi          = b.roi || "—";
  const breakdown    = b.costBreakdown || {};      // all values raw ₹

  // ── Derived quantities ─────────────────────────────────────────────────────
  const projHarvestKg    = safe(b.projectedHarvestKg);
  const currentBiomassKg = safe(b.currentBiomassKg);
  const currentPrice     = safe(fc.expectedPrice, 450);        // ₹/kg
  const targetDays       = safe(fc.targetHarvestDays, 120);
  const docSafe          = safe(doc, 0);
  const cyclePct         = targetDays > 0 ? Math.min(100, Math.round((docSafe / targetDays) * 100)) : 0;
  const daysLeft         = Math.max(0, targetDays - docSafe);
  const dailyBurn        = targetDays > 0 ? Math.round(totalCost / targetDays) : 0;  // raw ₹/day

  const costPerKg    = projHarvestKg > 0 ? (totalCost    / projHarvestKg).toFixed(0) : 0;
  const revenuePerKg = projHarvestKg > 0 ? (grossRevenue / projHarvestKg).toFixed(0) : 0;
  const profitPerKg  = projHarvestKg > 0 ? (netProfit    / projHarvestKg).toFixed(0) : 0;

  // ── Harvest timing simulator ───────────────────────────────────────────────
  // Projects raw ₹ revenue/profit if you wait `waitDays` more days
  const waitRevenue = projHarvestKg > 0
    ? fmtL(projHarvestKg * currentPrice * (1 + waitDays * 0.012))
    : "—";
  const waitProfit = projHarvestKg > 0
    ? fmtL(projHarvestKg * currentPrice * (1 + waitDays * 0.012) - totalCost)
    : "—";
  const waitRisk  = waitDays > 14 ? "HIGH" : waitDays > 7 ? "MEDIUM" : "LOW";
  const riskColor = waitDays > 14 ? "text-red-600" : waitDays > 7 ? "text-amber-600" : "text-[#168039]";

  // ── 7-day cash requirements (raw ₹) ───────────────────────────────────────
  const weeklyFeed  = fc.feedCostPerKg
    ? Math.round(currentBiomassKg * 0.04 * fc.feedCostPerKg * 7)
    : 0;
  const weeklyLabor = Math.round(safe(fc.laborCost, 12000) / 4);
  const weeklyElec  = Math.round(safe(fc.electricityCost, 6000) / 4);
  const weeklyMed   = targetDays > 0
    ? Math.round(safe(fc.medicineCost, 20000) / (targetDays / 7))
    : 0;
  const weeklyTotal = weeklyFeed + weeklyLabor + weeklyElec + weeklyMed;

  // ── Cost breakdown total for % bars ───────────────────────────────────────
  const breakdownTotal = Object.values(breakdown).reduce((a, v) => a + safe(v), 0) || 1;

  return (
    <div className="min-h-full bg-[#f3f6f9] text-[#2d3e50] font-sans p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Management / Portfolio / {activePond?.label || "—"} / Economics
            </p>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Economics: <span className="font-black uppercase">Capital Flow</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-colors">
              <Plus size={13} /> Log Expense
            </button>
            <button className="flex items-center gap-2 bg-[#168039] hover:bg-[#12662d] text-white px-5 py-2 text-[11px] font-black uppercase tracking-widest shadow-sm transition-colors">
              <Download size={13} /> Download P&L
            </button>
          </div>
        </header>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            {
              label: "Gross Revenue",
              value: fmtL(grossRevenue),
              color: "text-green-700",
              bg: "bg-green-50 border border-green-200",
              icon: <TrendingUp size={15} />,
              sub: `${fmtNum(projHarvestKg)} kg × ₹${currentPrice}`,
            },
            {
              label: "Total Cost",
              value: fmtL(totalCost),
              color: "text-slate-900",
              bg: "bg-white border border-slate-200",
              icon: <Wallet size={15} />,
              sub: `₹${costPerKg}/kg cost`,
            },
            {
              label: "Net Profit",
              value: fmtL(netProfit),
              color: netProfit >= 0 ? "text-green-700" : "text-red-600",
              bg: netProfit >= 0
                ? "bg-white border border-slate-200"
                : "bg-red-50 border border-red-200",
              icon: <IndianRupee size={15} />,
              sub: `ROI: ${roi}`,
              alert: netProfit < 0,
            },
            {
              label: "Profit / kg",
              value: `₹${profitPerKg}`,
              color: "text-blue-700",
              bg: "bg-blue-50 border border-blue-200",
              icon: <Fish size={15} />,
              sub: `Rev ₹${revenuePerKg} − Cost ₹${costPerKg}`,
            },
            {
              label: "Daily Burn Rate",
              value: fmtINR(dailyBurn),
              color: "text-amber-700",
              bg: "bg-amber-50 border border-amber-200",
              icon: <Zap size={15} />,
              sub: `${docSafe} days spent`,
            },
            {
              label: "Weekly Cash Need",
              value: fmtINR(weeklyTotal),
              color: "text-slate-900",
              bg: "bg-white border border-slate-200",
              icon: <Calendar size={15} />,
              sub: "Feed+Labour+Elec+Med",
            },
            {
              label: "Cycle Progress",
              value: `${cyclePct}%`,
              color: "text-[#168039]",
              bg: "bg-white border border-slate-200",
              icon: <Target size={15} />,
              sub: `${daysLeft} days to harvest`,
            },
          ].map(({ label, value, color, bg, icon, sub, alert }) => (
            <KpiCard key={label} label={label} value={value} color={color}
              bg={bg} icon={icon} sub={sub} alert={alert} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">

            {/* Break-even */}
            <BreakEvenCard
              totalCost={totalCost}
              projHarvestKg={projHarvestKg}
              currentPrice={currentPrice}
            />

            {/* Harvest timing simulator */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader
                icon={<Scale size={13} className="text-blue-600" />}
                title="Harvest Timing Simulator"
                badge={
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase ${riskColor}`}>Risk: {waitRisk}</span>
                    <input
                      type="range" min="1" max="30" value={waitDays}
                      onChange={e => setWaitDays(Number(e.target.value))}
                      className="w-24 accent-[#2d3e50]"
                    />
                    <span className="text-[10px] font-black bg-[#2d3e50] text-white px-2.5 py-1">+{waitDays}d</span>
                  </div>
                }
              />
              <div className="p-6 grid grid-cols-3 gap-5 items-stretch">
                <div className="border border-slate-200 p-4 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Sell Today</p>
                  <p className="text-3xl font-light tracking-tighter text-slate-500 mb-1">
                    {grossRevenue > 0 ? fmtL(grossRevenue) : "—"}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase">{fmtNum(projHarvestKg)} kg</p>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className={`text-[9px] font-black uppercase ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      Profit: {fmtL(netProfit)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <ArrowRightLeft size={24} className="text-slate-200" />
                  <p className="text-[9px] font-black text-slate-400 uppercase text-center">+{waitDays} days growth</p>
                  <p className="text-[8px] text-slate-400 text-center">~{(waitDays * 1.2).toFixed(1)}% wt gain</p>
                </div>
                <div className={`p-4 text-center border ${waitDays > 14 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${waitDays > 14 ? "text-red-600" : "text-blue-600"}`}>
                    Projected Value
                  </p>
                  <p className="text-3xl font-black tracking-tighter text-slate-900 mb-1">{waitRevenue}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase">+1.2%/day growth model</p>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className={`text-[9px] font-black uppercase ${waitDays > 14 ? "text-red-600" : "text-green-600"}`}>
                      Profit: {waitProfit}
                    </p>
                    {waitDays > 14 && <p className="text-[8px] text-red-500 mt-1">⚠ Disease risk increases</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Price sensitivity */}
            <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <SectionHeader
                icon={<BarChart3 size={13} className="text-indigo-500" />}
                title="Price Sensitivity Analysis"
                badge={
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    What if market price changes ±₹60/kg?
                  </span>
                }
              />
              <PriceSensitivity
                projHarvestKg={projHarvestKg}
                totalCost={totalCost}
                currentPrice={currentPrice}
              />
            </div>

            {/* Cost breakdown + 7-day cash */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader icon={<PieChart size={13} className="text-indigo-500" />} title="Cost Breakdown" />
                <div className="p-5">
                  {[
                    { label: "Feed",        value: safe(breakdown.feed),        color: "bg-blue-500"   },
                    { label: "Seed / PL",   value: safe(breakdown.seed),        color: "bg-purple-500" },
                    { label: "Labour",      value: safe(breakdown.labor),       color: "bg-amber-500"  },
                    { label: "Electricity", value: safe(breakdown.electricity), color: "bg-orange-500" },
                    { label: "Medicine",    value: safe(breakdown.medicine),    color: "bg-red-400"    },
                  ].map(({ label, value, color }) => (
                    <CostRow key={label} label={label} value={value}
                      total={breakdownTotal} color={color} />
                  ))}
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500">Total</span>
                    <span className="text-base font-black text-slate-900">{fmtL(totalCost)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader
                  icon={<Calendar size={13} className="text-[#168039]" />}
                  title="7-Day Cash Requirement"
                />
                <div className="p-5 space-y-3">
                  {[
                    {
                      label: "Feed Purchase",
                      value: weeklyFeed,
                      color: "border-[#168039]",
                      sub: `${(currentBiomassKg * 0.04 * 7).toFixed(0)}kg × ₹${fc.feedCostPerKg || 0}/kg`,
                    },
                    {
                      label: "Labour Payouts",
                      value: weeklyLabor,
                      color: "border-amber-500",
                      sub: `₹${fc.laborCost || 0}/mo ÷ 4`,
                    },
                    {
                      label: "Electricity",
                      value: weeklyElec,
                      color: "border-blue-500",
                      sub: `₹${fc.electricityCost || 0}/mo ÷ 4`,
                    },
                    {
                      label: "Medicine (pro.)",
                      value: weeklyMed,
                      color: "border-red-400",
                      sub: `₹${fc.medicineCost || 0} / ${targetDays}d × 7`,
                    },
                  ].map(({ label, value, color, sub }) => (
                    <div key={label} className={`border-l-4 ${color} pl-3 py-2 bg-slate-50`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-600">{label}</p>
                          <p className="text-[8px] text-slate-400 mt-0.5">{sub}</p>
                        </div>
                        <span className="text-xs font-black text-slate-800 tabular-nums">{fmtINR(value)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500">Weekly Total</span>
                      <p className="text-[8px] text-slate-400">
                        ~{dailyBurn > 0 ? (weeklyTotal / dailyBurn).toFixed(1) : "—"} days of burn
                      </p>
                    </div>
                    <span className="text-lg font-black text-slate-900">{fmtINR(weeklyTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="lg:col-span-4 space-y-5">

            {/* Dark forecast card */}
            <div className="bg-[#2d3e50] text-white shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                <Target size={16} className="text-[#168039]" />
                <h3 className="font-black text-[11px] tracking-widest uppercase">Financial Forecast</h3>
                <div className="ml-auto">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                    netProfit >= 0
                      ? "border-green-500 text-green-400"
                      : "border-red-500 text-red-400"
                  }`}>
                    {netProfit >= 0 ? "Profitable" : "Loss"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Profit</p>
                <p className={`text-5xl font-light tracking-tighter mb-2 ${netProfit >= 0 ? "text-white" : "text-red-400"}`}>
                  {fmtL(netProfit)}
                </p>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">ROI: {roi}</p>
                <p className="text-[9px] text-slate-500 font-bold mb-5">
                  Rev {fmtL(grossRevenue)} − Cost {fmtL(totalCost)}
                </p>
                <div className="h-0.5 w-full bg-white/10 mb-1">
                  <div
                    className={`h-0.5 ${netProfit >= 0 ? "bg-[#168039]" : "bg-red-500"}`}
                    style={{
                      width: grossRevenue > 0
                        ? `${Math.min(100, Math.max(0, (netProfit / grossRevenue + 1) * 50))}%`
                        : "0%"
                    }}
                  />
                </div>
              </div>
              <div className="border-t border-white/10 px-6 py-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Price",        value: `₹${currentPrice}/kg`            },
                  { label: "Target Wt",    value: `${fc.targetHarvestWeight || "—"}g` },
                  { label: "Culture Days", value: `${targetDays}d`                  },
                  { label: "Fish Count",   value: fmtNum(fc.fishCount)              },
                  { label: "Profit/kg",    value: `₹${profitPerKg}`                 },
                  { label: "Cost/kg",      value: `₹${costPerKg}`                   },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-xs font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cycle progress */}
            <div className="bg-white border-t-2 border-[#168039] border-x border-b border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Cycle Progress</p>
                <span className="text-[10px] font-black text-[#168039]">{cyclePct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 mb-1">
                <div className="h-2 bg-[#168039] transition-all" style={{ width: `${cyclePct}%` }} />
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-4">
                <span>Day 0</span>
                <span>Day {docSafe}</span>
                <span>Day {targetDays}</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Cost accrued so far", value: fmtL((totalCost * cyclePct) / 100) },
                  { label: "Daily burn rate",     value: fmtINR(dailyBurn)                  },
                  { label: "Days remaining",      value: `${daysLeft} days`                 },
                  { label: "Est. harvest",        value: `${fmtNum(projHarvestKg)} kg`      },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0">
                    <span className="text-[9px] font-black uppercase text-slate-400">{label}</span>
                    <span className="text-[10px] font-black text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-kg economics */}
            <div className="bg-white border border-slate-200 shadow-sm p-5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 mb-3 flex items-center gap-2">
                <Fish size={13} className="text-slate-400" /> Per-kg Economics
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Revenue / kg",     value: `₹${revenuePerKg}`,                                       color: "text-green-700", bg: "bg-green-50" },
                  { label: "Cost / kg",        value: `₹${costPerKg}`,                                          color: "text-red-600",   bg: "bg-red-50"   },
                  { label: "Profit / kg",      value: `₹${profitPerKg}`,                                        color: Number(profitPerKg) >= 0 ? "text-green-700" : "text-red-600", bg: Number(profitPerKg) >= 0 ? "bg-green-50" : "bg-red-50" },
                  { label: "Break-even price", value: `₹${projHarvestKg > 0 ? (totalCost / projHarvestKg).toFixed(0) : "—"}/kg`, color: "text-blue-700", bg: "bg-blue-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`flex justify-between items-center px-3 py-2 ${bg}`}>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
                    <span className={`text-sm font-black ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed economics */}
            <div className="bg-white border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Feed Economics</h3>
                <TrendingUp size={14} className="text-[#168039]" />
              </div>
              <p className="text-4xl font-black tracking-tighter text-slate-900 italic mb-1">
                {b.feedEfficiency || "—"}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-4">
                Feed efficiency · FCR: {fc.fcrTarget || "—"}
              </p>
              {/* Cost breakdown list — raw ₹ values formatted with fmtINR */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                {[
                  { label: "Seed",        val: fmtINR(safe(breakdown.seed))        },
                  { label: "Feed",        val: fmtINR(safe(breakdown.feed))        },
                  { label: "Labour",      val: fmtINR(safe(breakdown.labor))       },
                  { label: "Electricity", val: fmtINR(safe(breakdown.electricity)) },
                  { label: "Medicine",    val: fmtINR(safe(breakdown.medicine))    },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400">{label}</span>
                    <span className="text-[10px] font-black text-slate-700">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}