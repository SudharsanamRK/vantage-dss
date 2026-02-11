import React, { createContext, useContext, useState } from 'react';

const PondContext = createContext();

export const SCENARIOS = {
  STABLE: {
    health: 94,
    status: "NOMINAL",
    color: "#3b82f6",
    metrics: { DO: "6.8", pH: "7.4", Temp: "28", Ammonia: "0.1" },
    alerts: [
      { id: 1, msg: "Oxygen saturation optimal", type: "info", time: "10:42 AM" },
      { id: 2, msg: "Bio-filter bacterial colony stable", type: "info", time: "09:15 AM" }
    ],
    feeding: { amount: "42.5", recommendation: "Optimal assimilation conditions. capitalising on metabolic peak.", locked: false }
  },
  CRITICAL: {
    health: 32,
    status: "CRITICAL",
    color: "#ef4444",
    metrics: { DO: "2.1", pH: "8.2", Temp: "33", Ammonia: "1.4" },
    alerts: [
      { id: 1, msg: "DISSOLVED OXYGEN CRITICAL", type: "danger", time: "03:51 PM" },
      { id: 2, msg: "AMMONIA TOXICITY SPIKE", type: "danger", time: "03:45 PM" },
      { id: 3, msg: "AERATOR GRID FAILURE DETECTED", type: "danger", time: "03:30 PM" }
    ],
    feeding: { amount: "0.00", recommendation: "METABOLISM LOCK ENGAGED. Feeding will cause metabolic toxicity. Standby for aeration.", locked: true }
  }
};

export const StateProvider = ({ children }) => {
  const [mode, setMode] = useState("CRITICAL");
  const data = SCENARIOS[mode];

  // API Mock Service Layer
  const toggleSystemState = () => setMode(prev => prev === "STABLE" ? "CRITICAL" : "STABLE");

  return (
    <PondContext.Provider value={{ data, mode, toggleSystemState, setMode }}>
      {children}
    </PondContext.Provider>
  );
};

export const usePond = () => useContext(PondContext);