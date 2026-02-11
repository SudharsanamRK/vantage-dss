import React, { useState, useMemo } from "react";
import { 
  Signal, Clock, ShieldAlert, Activity, ChevronRight, 
  Search, SlidersHorizontal, Plus, Filter, AlertCircle
} from "lucide-react";

export default function SignalIntelligence() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const allAlerts = useMemo(() => [
    {
      id: "SIG-842",
      timestamp: '14:32',
      severity: 'critical',
      category: 'DO Crash',
      title: 'Low Dissolved Oxygen - Pond A3',
      description: 'DO levels at 1.2 mg/L (critical threshold: 4.0 mg/L). Mortality risk high.',
      ponds: ['A3'],
      metrics: [
        { value: '1.2 mg/L', label: 'DO Level', trend: '-82%' },
        { value: '32.4°C', label: 'Water Temp', trend: '+1.8°' }
      ],
      actions: ['Increase Aeration', 'Water Exchange']
    },
    {
      id: "SIG-841",
      timestamp: '13:45',
      severity: 'warning',
      category: 'Temperature',
      title: 'High Temperature Alert - Pond B1',
      description: 'Water temperature reached 35.8°C. Growth stress detected.',
      ponds: ['B1', 'B2'],
      metrics: [
        { value: '35.8°C', label: 'Temperature', trend: '+4.2°' },
        { value: '2.1', label: 'FCR Live', trend: '↑' }
      ],
      actions: ['Check Chiller', 'Add Shade']
    },
    {
      id: "SIG-840",
      timestamp: '11:07',
      severity: 'warning',
      category: 'Feed Issue',
      title: 'Auto-Feeder Malfunction - Pond C2',
      description: 'Uneven feed distribution detected. Coverage at 47%.',
      ponds: ['C2'],
      metrics: [
        { value: '47%', label: 'Coverage', trend: '-33%' },
        { value: '1.9', label: 'Est. FCR', trend: '↑' }
      ],
      actions: ['Manual Feeding', 'Repair Feeder']
    }
  ], []);

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(alert => {
      const matchesFilter = activeFilter === 'ALL' || alert.severity.toUpperCase() === activeFilter;
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm, allAlerts]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#212529] font-sans">
      <div className="flex-1 p-6 lg:p-10 space-y-6">
        
        {/* TOP UTILITY BAR (FarmOS Standard) */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <nav className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
              System / Telemetry / Signal Intelligence
            </nav>
            <h1 className="text-3xl font-light text-slate-800 tracking-tight">
              Signals: <span className="font-semibold italic">Live Stream</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <div className="relative mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search signals..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 bg-[#2e7d32] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1b5e20] shadow-sm">
              <Plus size={16} /> New Alert Rule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: MAIN SIGNAL LIST (Table Style) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* FILTER BAR */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(f => (
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

            {/* SIGNALS TABLE */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
                  <Signal size={16} /> Signal Observation Log
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase">
                    <tr>
                      <th className="px-6 py-3 w-20">Time</th>
                      <th className="px-6 py-3">Signal Detail</th>
                      <th className="px-6 py-3">Reference</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col">
                            <span className="font-mono text-slate-700 font-bold">{alert.timestamp}</span>
                            <span className="text-[9px] text-slate-400 font-bold">{alert.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {alert.category}
                              </span>
                              <h4 className="font-bold text-slate-800 uppercase tracking-tight italic">{alert.title}</h4>
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed max-w-md">{alert.description}</p>
                            <div className="flex gap-4 pt-2">
                              {alert.metrics.map((m, i) => (
                                <div key={i} className="flex flex-col">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">{m.label}</span>
                                  <span className="font-bold text-slate-700">{m.value} <span className="text-[10px] text-emerald-600">{m.trend}</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">
                            POND_{alert.ponds[0]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                          <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-all">
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: SYSTEM HEALTH & QUICK STATS */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#2c3e50] text-white p-6 rounded-sm shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={20} className="text-emerald-400" />
                <h3 className="font-bold tracking-tight uppercase text-sm">Integrity Report</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Critical Signals</p>
                  <p className="text-3xl font-light text-red-400">0{allAlerts.filter(a => a.severity === 'critical').length}</p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">System Uptime</p>
                  <p className="text-xl font-semibold">99.82%</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
               <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Activity size={14} /> Quick Settings
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                  <input type="checkbox" checked className="rounded border-slate-300 text-[#2e7d32]" />
                  Push to Mobile Node
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                  <input type="checkbox" className="rounded border-slate-300 text-[#2e7d32]" />
                  Critical Email Alerts
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}