import React, { useRef } from "react";
import { Printer, X, Trophy, Fish, IndianRupee, Calendar } from "lucide-react";

export default function HarvestCertificate({ cycle, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const content  = printRef.current.innerHTML;
    const printWin = window.open("", "_blank", "width=900,height=650");
    printWin.document.write(`
      <html>
        <head>
          <title>Harvest Certificate — ${cycle.pondLabel} Cycle ${cycle.cycleNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; background: white; padding: 40px; }
            .cert { border: 3px solid #15803d; padding: 40px; max-width: 760px; margin: auto; }
            .header { text-align: center; border-bottom: 2px solid #15803d; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 32px; font-weight: 900; color: #15803d; letter-spacing: 0.15em; }
            .subtitle { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 4px; }
            .cert-title { font-size: 18px; font-weight: 900; color: #111; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 16px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
            .section { }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
            .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
            .label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em; }
            .value { font-size: 11px; font-weight: 900; color: #111; }
            .footer { margin-top: 32px; border-top: 2px solid #15803d; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sig-line { width: 180px; border-bottom: 1px solid #111; height: 40px; }
            .sig-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-top: 4px; }
            .highlight { color: #15803d; font-size: 16px; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); font-size: 80px; color: rgba(21,128,61,0.04); font-weight: 900; pointer-events: none; letter-spacing: 0.1em; }
          </style>
        </head>
        <body>
          <div class="watermark">FATHOM</div>
          ${content}
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => { printWin.print(); printWin.close(); }, 400);
  };

  const harvestDate = cycle.harvestDate
    ? new Date(cycle.harvestDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "—";
  const stockDate   = cycle.stockingDate
    ? new Date(cycle.stockingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-2xl font-sans overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Trophy size={16} className="text-amber-500" />
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">
              Harvest Certificate — Preview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white
                px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-colors">
              <Printer size={13} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors ml-1">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="p-8 bg-slate-50">
          <div ref={printRef} className="cert bg-white border-2 border-green-700 p-10 font-mono">

            {/* Header */}
            <div className="header text-center border-b-2 border-green-700 pb-6 mb-8">
              <p className="text-2xl font-black text-green-700 tracking-widest uppercase">FATHOM</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Aquaculture Intelligence Platform</p>
              <p className="text-lg font-black text-slate-900 uppercase tracking-wider mt-5">
                Harvest Completion Certificate
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Cycle {cycle.cycleNo} · {cycle.pondLabel}</p>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Production info */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2 mb-4">
                  Production Details
                </p>
                {[
                  { label: "Species",      value: cycle.species || "—"                   },
                  { label: "Stocking Date",value: stockDate                               },
                  { label: "Harvest Date", value: harvestDate                             },
                  { label: "Days of Culture", value: `${cycle.finalDoc} days`             },
                  { label: "Fish Stocked", value: (cycle.fishCount || 0).toLocaleString("en-IN") },
                  { label: "Stk Density",  value: cycle.stockingDensity ? `${cycle.stockingDensity}/m²` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-400">{label}</span>
                    <span className="text-[10px] font-black text-slate-800">{value}</span>
                  </div>
                ))}
              </div>

              {/* Performance */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2 mb-4">
                  Performance Metrics
                </p>
                {[
                  { label: "Final Harvest", value: `${cycle.finalBiomassKg?.toFixed(0) || "—"} kg`, highlight: true },
                  { label: "Avg Body Weight", value: `${cycle.finalAvgWeight || "—"} g`             },
                  { label: "Survival Rate",   value: `${cycle.survivalPct || "—"}%`                 },
                  { label: "FCR",             value: cycle.fcr || "—"                               },
                  { label: "Avg DO",          value: cycle.avgDo ? `${cycle.avgDo} mg/L` : "—"      },
                  { label: "Avg Temp",        value: cycle.avgTemp ? `${cycle.avgTemp}°C` : "—"     },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-400">{label}</span>
                    <span className={`text-[10px] font-black ${highlight ? "text-green-700" : "text-slate-800"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="mt-6 bg-slate-50 border border-slate-200 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Financial Summary</p>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Gross Revenue", value: `₹${((cycle.grossRevenue||0)/100000).toFixed(2)}L` },
                  { label: "Total Cost",    value: `₹${((cycle.totalCost||0)/100000).toFixed(2)}L`    },
                  { label: "Net Profit",    value: `₹${((cycle.netProfit||0)/100000).toFixed(2)}L`,   highlight: (cycle.netProfit||0) >= 0 },
                  { label: "ROI",           value: cycle.roi || "—"                                    },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="text-center">
                    <p className="text-[8px] font-black uppercase text-slate-400">{label}</p>
                    <p className={`text-sm font-black mt-0.5 ${highlight ? "text-green-700" : "text-slate-800"}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {cycle.notes && (
              <div className="mt-4 text-[10px] text-slate-500 italic border-t border-slate-100 pt-3">
                Notes: {cycle.notes}
              </div>
            )}

            {/* Footer signatures */}
            <div className="mt-8 pt-6 border-t-2 border-green-700 flex justify-between items-end">
              <div>
                <div className="w-44 border-b border-slate-400 h-8" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Farm Operator Signature</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified by</p>
                <p className="text-xs font-black text-green-700 mt-1">FATHOM VANTAGE DSS</p>
                <p className="text-[8px] text-slate-400 mt-0.5">{harvestDate}</p>
              </div>
              <div className="text-right">
                <div className="w-44 border-b border-slate-400 h-8 ml-auto" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Buyer / Witness Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}