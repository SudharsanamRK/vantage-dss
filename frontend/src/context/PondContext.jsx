import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { fathomCore } from '../engine/fathomCore'; 

const PondContext = createContext();

export const PondProvider = ({ children }) => {
  // 1. RAW SENSOR DATA (The "Pulse")
  const [sensorData, setSensorData] = useState({
    do: 6.2, ammonia: 0.05, ph: 7.4, temp: 28.5, label: "POND_ALPHA_01"
  });

  // 2. FARM CONFIGURATION (The "Digital Twin Blueprint")
  const [farmConfig, setConfig] = useState({
    size: 1000,
    density: 60,
    species: 'Vannamei',
    thresholds: { doCrit: 4.5, tempMax: 31.0, ammMax: 0.1 }
  });

  const [logs, setLogs] = useState([
    { id: 1, type: "Digital Twin Initialized", user: "System", time: "1h ago" }
  ]);

  // 3. UNIFIED ENGINE EXECUTION
  // useMemo ensures the brain only "thinks" when data or config actually changes
  const brain = useMemo(() => 
    fathomCore(sensorData, farmConfig), 
  [sensorData, farmConfig]);

  // 4. ACTIONS
  const addLog = (type, user = "Operator") => {
    setLogs(prev => [{ id: Date.now(), type, user, time: "Just now" }, ...prev]);
  };

  const applyTreatment = (treatmentId) => {
    const treatment = brain.treatments.find(t => t.id === treatmentId);
    if (treatment) {
      setSensorData(prev => treatment.effect(prev));
      addLog(`Auto-Action: ${treatment.label}`, "Fathom Core");
    }
  };

  // 5. LIVE SIMULATION
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        ...prev,
        do: +(prev.do + (Math.random() * 0.2 - 0.1)).toFixed(2),
        temp: +(prev.temp + (Math.random() * 0.1 - 0.05)).toFixed(2)
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PondContext.Provider value={{ 
      sensorData, setSensorData, 
      farmConfig, setConfig,
      brain, 
      logs, addLog, applyTreatment 
    }}>
      {children}
    </PondContext.Provider>
  );
};

export const usePond = () => useContext(PondContext);