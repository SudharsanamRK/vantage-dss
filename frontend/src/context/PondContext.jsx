import React, { createContext, useContext, useEffect, useState } from "react";
import { analyzePond } from "../engine/farmBrain"; // Ensure this path is correct

const PondContext = createContext();

export const PondProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({ do: 5.0, temp: 28.0, ph: 8.0 });
  const [logs, setLogs] = useState([]);
  const [farmConfig, setConfig] = useState({
    size: 1000,
    density: 50,
    species: "Vannamei",
    thresholds: { doCrit: 3.5, tempMax: 32 }
  });

  // 1. Fetch Initial Data
  useEffect(() => {
    fetch("http://localhost:5000/api/pond")
      .then(res => res.json())
      .then(data => setSensorData(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  // 2. The "Brain" - Automatically recalculates when data or config changes
  const brain = analyzePond(sensorData, farmConfig);

  const addLog = (message, user) => {
    const newLog = { 
      id: Date.now(), 
      time: new Date().toLocaleTimeString(), 
      type: message, 
      user 
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const updatePond = async (data) => {
    try {
      const res = await fetch("http://localhost:5000/api/pond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const updated = await res.json();
      setSensorData(updated);
    } catch (err) {
      console.error("Update error:", err);
      setSensorData(data); // Fallback for local testing
    }
  };

  return (
    <PondContext.Provider value={{ 
      sensorData, 
      setSensorData, 
      updatePond, 
      farmConfig, 
      setConfig, 
      brain, 
      logs, 
      addLog 
    }}>
      {children}
    </PondContext.Provider>
  );
};

export const usePond = () => useContext(PondContext);