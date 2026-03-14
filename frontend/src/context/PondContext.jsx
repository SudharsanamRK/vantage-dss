import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { analyzePond } from "../engine/farmBrain";

const PondContext = createContext();
const BASE     = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("fathom_token");

export const PondProvider = ({ children }) => {
  const [ponds,      setPonds]      = useState([]);
  const [activePond, setActivePond] = useState(null);
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);

  const sensorData = activePond ? {
    label:    activePond.label,
    do:       activePond.do,
    temp:     activePond.temp,
    ammonia:  activePond.ammonia,
    ph:       activePond.ph,
    salinity: activePond.salinity,
  } : null;

  const doc = activePond?.stockingDate
    ? Math.max(0, Math.floor((Date.now() - new Date(activePond.stockingDate)) / 86400000))
    : 0;

  const pondConfig = {
    species:             activePond?.species              ?? "Vannamei",
    waterType:           activePond?.waterType            ?? "Freshwater",
    fishCount:           activePond?.fishCount            ?? 0,
    avgSeedWeight:       activePond?.avgSeedWeight        ?? 0.001,
    survivalEstimate:    activePond?.survivalEstimate     ?? 85,
    stockingDensity:     activePond?.stockingDensity      ?? 0,
    doc,
    targetHarvestWeight: activePond?.targetHarvestWeight  ?? 20,
    targetHarvestDays:   activePond?.targetHarvestDays    ?? 120,
    expectedPrice:       activePond?.expectedPrice        ?? 450,
    feedCostPerKg:       activePond?.feedCostPerKg        ?? 70,
    seedCost:            activePond?.seedCost             ?? 350,
    laborCost:           activePond?.laborCost            ?? 12000,
    electricityCost:     activePond?.electricityCost      ?? 6000,
    medicineCost:        activePond?.medicineCost         ?? 20000,
    fcrTarget:           activePond?.fcrTarget            ?? 1.5,
    thresholds: {
      doCrit:  activePond?.alertDo      ?? 3.5,
      phMin:   activePond?.alertPhMin   ?? 7.0,
      phMax:   activePond?.alertPhMax   ?? 9.0,
      ammonia: activePond?.alertAmmonia ?? 0.1,
      tempMax: 32,
    },
    size:    activePond?.area            ?? 1000,
    density: activePond?.stockingDensity ?? 50,
  };

  const farmConfig = {
    ...pondConfig,
    startDate: activePond?.stockingDate ?? activePond?.createdAt ?? null,
  };

  const brain = analyzePond(
    sensorData || { do: 5.0, temp: 28.0, ph: 8.0, ammonia: 0.03 },
    pondConfig
  );

  const fetchAllPonds = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${BASE}/pond/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch ponds");
      const data = await res.json();
      setPonds(data);
      if (data.length > 0) setActivePond(prev => prev ?? data[0]);
    } catch (err) {
      console.error("fetchAllPonds:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllPonds(); }, [fetchAllPonds]);

  const createPondFull = async (formData) => {
    const token = getToken();
    const res   = await fetch(`${BASE}/pond/setup`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(formData),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message || "Failed to create pond.");
    const newPond = result.pond;
    setPonds(prev => [...prev, newPond]);
    setActivePond(newPond);
    return newPond;
  };

  const createPond = async (pondData) => {
    const token = getToken();
    const res   = await fetch(`${BASE}/pond/create`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify(pondData),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message || "Failed to create pond.");
    const newPond = result.pond;
    setPonds(prev => [...prev, newPond]);
    setActivePond(newPond);
    return newPond;
  };

  const deletePond = async (pondId) => {
    const token = getToken();
    const res   = await fetch(`${BASE}/pond/${pondId}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message);
    const remaining = ponds.filter(p => p._id !== pondId);
    setPonds(remaining);
    if (activePond?._id === pondId) setActivePond(remaining[0] ?? null);
  };

  const switchPond = (pond) => setActivePond(pond);

  const updatePond = async (data) => {
    try {
      const token = getToken();
      const res   = await fetch(`${BASE}/pond`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ ...data, pondId: activePond?._id }),
      });
      if (!res.ok) throw new Error("Failed to update pond");
      const result  = await res.json();
      const updated = result.pond || result;
      setActivePond(updated);
      setPonds(prev => prev.map(p => p._id === updated._id ? updated : p));
    } catch (err) {
      console.error("updatePond:", err);
      setActivePond(prev => ({ ...prev, ...data }));
    }
  };

  const addLog = (message, user = "Operator") => {
    setLogs(prev => [{
      id:   Date.now(),
      time: new Date().toLocaleTimeString(),
      type: message,
      user,
    }, ...prev]);
  };

  return (
    <PondContext.Provider value={{
      ponds, activePond, switchPond,
      createPond, createPondFull, deletePond, fetchAllPonds,
      sensorData, farmConfig, pondConfig, brain,
      doc, updatePond, logs, addLog, loading,
    }}>
      {children}
    </PondContext.Provider>
  );
};

export const usePond = () => useContext(PondContext);