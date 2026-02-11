import React, { useState, useMemo } from "react";
import { 
  FileText, Download, Search, Plus, Filter, 
  Eye, Star, Zap, ChevronRight, Share2, 
  History, ClipboardList, Database
} from "lucide-react";

export default function Reports() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const reports = [
    { id: "ARC-004", week: "44", size: "4.8 MB", date: "Jan 28, 2026", status: "New", views: 12, starred: true, anomalies: 3 },
    { id: "ARC-003", week: "43", size: "4.2 MB", date: "Jan 21, 2026", status: "Verified", views: 45, starred: false, anomalies: 1 },
    { id: "ARC-002", week: "42", size: "3.9 MB", date: "Jan 14, 2026", status: "Verified", views: 38, starred: true, anomalies: 0 },
    { id: "ARC-001", week: "41", size: "4.5 MB", date: "Jan 07, 2026", status: "Archived", views: 67, starred: false, anomalies: 2 },
  ];

  const filteredReports = useMemo(() => {
    return reports.filter(rpt => {
      const matchesFilter = activeFilter === "ALL" || (activeFilter === "STARRED" && rpt.starred) || (activeFilter === "ANOMALIES" && rpt.anomalies > 0);
      const matchesSearch = rpt.id.toLowerCase().includes(searchTerm.toLowerCase()) || rpt.week.includes(searchTerm);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#212529] font-sans">
      <div className="flex-1 p-6 lg:p-10 space-y-6">
        
        {/* TOP UTILITY BAR */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <nav className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
              Data / Logs / Archive Ledger
            </nav>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Reports: <span className="font-semibold italic">Historical Vault</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <div className="relative mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search ledger..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 bg-[#2e7d32] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1b5e20] shadow-sm">
              <Plus size={16} /> Generate Audit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: MAIN LEDGER TABLE */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* QUICK FILTERS */}
            <div className="flex gap-1">
              {['ALL', 'STARRED', 'ANOMALIES'].map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    activeFilter === f 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
                  <ClipboardList size={16} /> Historical Intelligence Records
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase">
                    <tr>
                      <th className="px-6 py-3">Audit ID</th>
                      <th className="px-6 py-3">Record Details</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((rpt) => (
                      <tr key={rpt.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col">
                            <span className="font-mono text-slate-700 font-bold uppercase">{rpt.id}</span>
                            <span className="text-[9px] text-slate-400 font-bold">WEEK_{rpt.week}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 uppercase tracking-tight italic flex items-center gap-2">
                              Intelligence_Audit_W{rpt.week}.pdf
                              {rpt.starred && <Star size={10} className="fill-amber-400 text-amber-400" />}
                            </h4>
                            <p className="text-slate-500 text-[11px]">Telemetry archive generated on {rpt.date}.</p>
                            <div className="flex gap-3 pt-2">
                               <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                                 <Database size={10} /> {rpt.size}
                               </span>
                               {rpt.anomalies > 0 && (
                                 <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase">
                                   <Zap size={10} /> {rpt.anomalies} Anomalies
                                 </span>
                               )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            rpt.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rpt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Download size={14}/></button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"><ChevronRight size={14}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: STORAGE & META */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* VAULT STATS */}
            <div className="bg-[#2c3e50] text-white p-6 rounded-sm shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <History size={20} className="text-emerald-400" />
                <h3 className="font-bold tracking-tight uppercase text-sm">Vault Integrity</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-xs text-slate-400 uppercase font-bold">Processed</span>
                  <span className="text-sm font-bold italic">127.4 GB</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[65%]" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">
                  Node FRM_ALPHA_LGR is 65% capacity
                </p>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
               <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Share2 size={14} /> Batch Operations
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded transition-all uppercase tracking-tighter">
                  Export Selected as CSV
                </button>
                <button className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded transition-all uppercase tracking-tighter">
                  Verify Blockchain Hash
                </button>
                <button className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded transition-all uppercase tracking-tighter">
                  Purge Archived Logs
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}