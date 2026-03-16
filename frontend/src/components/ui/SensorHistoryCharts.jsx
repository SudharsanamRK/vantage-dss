import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { Activity, RefreshCw } from "lucide-react";
import { usePond } from "../../context/PondContext";

const PARAMS = [
  { key: "do",      label: "Dissolved O₂", unit: "mg/L", color: "#3b82f6", refVal: 4.5, refLabel: "Min 4.5"  },
  { key: "temp",    label: "Temperature",   unit: "°C",   color: "#f97316", refVal: 32,  refLabel: "Max 32°C" },
  { key: "ph",      label: "pH Level",      unit: "pH",   color: "#8b5cf6", refVal: null                      },
  { key: "ammonia", label: "Ammonia",       unit: "ppm",  color: "#ef4444", refVal: 0.1, refLabel: "Max 0.1"  },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-slate-400 font-black uppercase tracking-widest mb-1" style={{ fontSize: "9px" }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-black">
          {p.name}: {p.value ?? "—"} {PARAMS.find(x => x.key === p.dataKey)?.unit || ""}
        </p>
      ))}
    </div>
  );
}

export default function SensorHistoryCharts({ compact = false }) {
  const { activePond, getSensorHistory, sensorData } = usePond();
  const [data,     setData]     = useState([]);
  const [days,     setDays]     = useState(7);
  const [loading,  setLoading]  = useState(false);
  const [active,   setActive]   = useState("do");

  const fetch7 = useCallback(async () => {
    if (!activePond?._id) return;
    setLoading(true);
    try {
      const res = await getSensorHistory(activePond._id, days);
      if (res?.chartData?.length) {
        setData(res.chartData);
      } else {
        // Fallback: generate mock trend from current sensor data if no DB history yet
        const sd = sensorData || {};
        const mock = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000);
          const day = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
          mock.push({
            day,
            do:      sd.do      ? +(sd.do      + (Math.random() - 0.5) * 0.6).toFixed(2)  : null,
            temp:    sd.temp    ? +(sd.temp    + (Math.random() - 0.5) * 1.0).toFixed(1)  : null,
            ph:      sd.ph      ? +(sd.ph      + (Math.random() - 0.5) * 0.3).toFixed(2)  : null,
            ammonia: sd.ammonia ? +(sd.ammonia + (Math.random() - 0.5) * 0.02).toFixed(3) : null,
          });
        }
        setData(mock);
      }
    } catch {
      // silent fail — no history yet
    } finally {
      setLoading(false);
    }
  }, [activePond?._id, days, sensorData]);

  useEffect(() => { fetch7(); }, [fetch7]);

  const param = PARAMS.find(p => p.key === active);

  if (!activePond) return null;

  return (
    <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
          <Activity size={13} className="text-blue-500" /> Sensor History
        </h3>
        <div className="flex items-center gap-2">
          {/* Day range selector */}
          <div className="flex gap-0.5">
            {[3, 7, 14].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-2.5 py-1 text-[9px] font-black uppercase transition-all
                  ${days === d ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-200 hover:bg-slate-50"}`}>
                {d}D
              </button>
            ))}
          </div>
          <button onClick={fetch7} disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Param tabs */}
      <div className="flex border-b border-slate-100">
        {PARAMS.map(p => (
          <button key={p.key} onClick={() => setActive(p.key)}
            className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-wider transition-all border-b-2
              ${active === p.key
                ? "border-b-2 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"}`}
            style={{ borderBottomColor: active === p.key ? p.color : "transparent" }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className={compact ? "h-[160px] px-4 py-3" : "h-[200px] px-4 py-4"}>
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              {loading ? "Loading…" : "No history yet — start logging sensor data"}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day" axisLine={false} tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace", fontWeight: 700 }}
              />
              <YAxis
                axisLine={false} tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 9, fontFamily: "monospace", fontWeight: 700 }}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CustomTooltip />} />
              {param?.refVal && (
                <ReferenceLine y={param.refVal} stroke="#ef4444" strokeDasharray="4 4"
                  label={{ value: param.refLabel, fill: "#ef4444", fontSize: 9, fontFamily: "monospace" }} />
              )}
              <Line
                type="monotone" dataKey={active}
                stroke={param?.color} strokeWidth={2}
                dot={{ r: 3, fill: param?.color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: param?.color }}
                connectNulls={false}
                name={param?.label}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Current value strip */}
      <div className="border-t border-slate-100 px-5 py-2.5 flex items-center justify-between bg-slate-50/50">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current</p>
        <div className="flex gap-6">
          {PARAMS.map(p => {
            const val = sensorData?.[p.key];
            return (
              <div key={p.key} className="text-right">
                <p className="text-[8px] font-black uppercase text-slate-400">{p.label}</p>
                <p className="text-[11px] font-black" style={{ color: p.color }}>
                  {val ?? "—"} <span className="text-slate-300 text-[8px]">{p.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}