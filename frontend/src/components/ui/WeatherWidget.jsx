import React, { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Wind, Droplets, AlertTriangle, RefreshCw, CloudDrizzle } from "lucide-react";

const BASE     = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("fathom_token");

// Map Open-Meteo icon codes to Lucide icons
const ICON_MAP = {
  "01": Sun,
  "02": Cloud,
  "03": Cloud,
  "04": Cloud,
  "09": CloudDrizzle,
  "10": CloudRain,
  "11": AlertTriangle,
  "13": Droplets,
  "50": Wind,
};

function getWeatherIcon(iconCode) {
  return ICON_MAP[iconCode?.substring(0, 2)] || Cloud;
}

export default function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const fetchWeather = () => {
    if (!location?.trim()) return;
    setLoading(true);
    setError("");

    fetch(`${BASE}/weather?location=${encodeURIComponent(location.trim())}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(d => {
        if (!d.success) { setError(d.message || "Weather unavailable"); return; }
        setWeather(d.weather);
      })
      .catch(() => setError("Cannot reach server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWeather(); }, [location]);

  // No location set in Setup page
  if (!location?.trim()) return (
    <div className="bg-white border border-slate-200 shadow-sm p-4 flex items-center gap-3">
      <Cloud size={16} className="text-slate-300 shrink-0" />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Weather</p>
        <p className="text-[9px] text-slate-400 mt-0.5">
          Add your farm location in <span className="font-black">Setup → Farm Info → Location</span>
        </p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="bg-white border border-slate-200 shadow-sm p-4 flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin shrink-0" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Fetching weather for {location}…
      </p>
    </div>
  );

  if (error) return (
    <div className="bg-white border border-slate-200 shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Cloud size={16} className="text-slate-300 shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{error}</p>
      </div>
      <button onClick={fetchWeather}
        className="text-slate-400 hover:text-slate-600 transition-colors">
        <RefreshCw size={13} />
      </button>
    </div>
  );

  if (!weather) return null;

  const WeatherIcon  = getWeatherIcon(weather.icon);
  const pondTempRisk = weather.temp > 35;
  const isRaining    = weather.rain > 0;

  return (
    <div className={`border shadow-sm p-4 transition-colors
      ${pondTempRisk ? "bg-amber-50 border-amber-200" : isRaining ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}>

      {/* Title row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Weather · {weather.city}
          </p>
          {/* Powered by Open-Meteo badge */}
          <span className="text-[7px] font-bold text-slate-300 uppercase tracking-wider border border-slate-100 px-1">
            Open-Meteo
          </span>
        </div>
        <div className="flex items-center gap-2">
          {pondTempRisk && (
            <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase">
              <AlertTriangle size={9} /> High temp risk
            </span>
          )}
          <button onClick={fetchWeather}
            className="text-slate-300 hover:text-slate-500 transition-colors">
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {/* Main weather display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WeatherIcon size={30} className={
            pondTempRisk ? "text-amber-500" :
            isRaining    ? "text-blue-500"  : "text-slate-500"
          } />
          <div>
            <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {weather.temp}°C
            </p>
            <p className="text-[9px] text-slate-400 font-bold capitalize mt-0.5">{weather.desc}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-right">
          {[
            { label: "H / L",    value: `${weather.high}° / ${weather.low}°`    },
            { label: "Humidity", value: `${weather.humidity}%`                   },
            { label: "Wind",     value: `${weather.windSpeed} km/h`              },
            { label: "Feels",    value: `${weather.feels}°C`                     },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[8px] font-black uppercase text-slate-400">{label}</p>
              <p className="text-[10px] font-black text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rain warning */}
      {isRaining && (
        <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center gap-2">
          <CloudRain size={11} className="text-blue-500 shrink-0" />
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider">
            Precipitation: {weather.rain} mm — check pond inlet/overflow
          </p>
        </div>
      )}

      {/* High temp pond warning */}
      {pondTempRisk && (
        <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center gap-2">
          <AlertTriangle size={11} className="text-amber-500 shrink-0" />
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-wider">
            Ambient temp {weather.temp}°C — pond water temp may rise, monitor DO closely
          </p>
        </div>
      )}
    </div>
  );
}