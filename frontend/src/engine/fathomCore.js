// src/engine/fathomCore.js
import { analyzeWater } from './modules/water';
import { calculateGrowth } from './modules/growth';
import { predictEconomics } from './modules/finance';

export const fathomCore = (sensorData, farmConfig) => {
  // 1. Technical: Analyze water quality against user-defined thresholds
  const water = analyzeWater(sensorData, farmConfig.thresholds);
  
  // 2. Biological: Calculate current biomass and survival probability
  const biology = calculateGrowth(sensorData, farmConfig);
  
  // 3. Financial: Forecast revenue based on biological health
  const finance = predictEconomics(biology, water, farmConfig);

  return {
    healthScore: water.score,
    survivalProb: biology.survivalProb,
    alerts: water.alerts,
    treatments: water.treatments,
    projectedRevenue: finance.revenue,
    feedEfficiency: finance.fcr,
    status: water.score > 80 ? "OPTIMAL" : water.score > 50 ? "STABLE" : "CRITICAL",
    lastPulse: new Date().toISOString()
  };
};