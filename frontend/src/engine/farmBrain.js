/**
 * VANTAGE INTELLIGENCE CORE V3
 * Focus: Risk Assessment, Yield Loss & Adaptive Feeding
 */

export function analyzePond(input) {
  // Default values based on Pond Infrastructure
  const p = input || { do: 5.4, ammonia: 0.05, ph: 7.8, temp: 28.5 };

  let healthScore = 100;
  let riskLevel = "Low";
  let yieldLossFactor = 0; // Percentage of harvest at risk
  const alerts = [];
  const treatments = [];

  /* ---------------- 1. RISK & SURVIVAL LOGIC ---------------- */

  // Dissolved Oxygen (Hypoxia Risk)
  if (p.do < 4.5) {
    const isCritical = p.do < 3.0;
    healthScore -= isCritical ? 45 : 20;
    yieldLossFactor += isCritical ? 25 : 10;
    riskLevel = isCritical ? "Critical" : "Elevated";
    
    alerts.push(isCritical ? "CRITICAL: Severe Hypoxia. Immediate mortality risk." : "WARNING: Low DO. Respiration stress detected.");

    treatments.push({
      id: "aeration",
      label: "Boost Aeration (Max RPM)",
      desc: "Emergency DO recovery via paddlewheels/injectors.",
      effect: () => ({ ...p, do: Math.min(7.5, p.do + 2.0) }),
    });
  }

  // Ammonia Toxicity (Biosecurity & Gill Health)
  if (p.ammonia > 0.1) {
    const toxicity = p.ammonia > 0.3 ? "Acute" : "Chronic";
    healthScore -= toxicity === "Acute" ? 30 : 15;
    yieldLossFactor += toxicity === "Acute" ? 15 : 5;
    if (toxicity === "Acute") riskLevel = "Critical";

    alerts.push(`${toxicity.toUpperCase()}: Ammonia spikes inhibit growth and damage tissue.`);

    treatments.push({
      id: "water_exchange",
      label: "Targeted Water Flush",
      desc: "Reduction of nitrogenous waste via partial exchange.",
      effect: () => ({ ...p, ammonia: Math.max(0, p.ammonia - 0.2) }),
    });
  }

  /* ---------------- 2. ADAPTIVE FEEDING LOGIC ---------------- */
  
  let feedEfficiency = 1.0; // Base FCR multiplier
  let feedingRecommendation = "Standard Ration";

  // Temperature-based metabolic scaling
  if (p.temp > 31.5) {
    feedEfficiency = 0.85; // Stress lowers absorption
    feedingRecommendation = "Reduce Ration (Heat Stress)";
  } else if (p.temp < 25) {
    feedEfficiency = 0.60; // Sluggish metabolism
    feedingRecommendation = "Minimal Ration (Low Temp)";
  } else if (p.do < 4.0) {
    feedEfficiency = 0.30;
    feedingRecommendation = "Stop Feed (Low Oxygen)";
  } else {
    feedingRecommendation = "Optimal Feed (Adaptive)";
  }

  /* ---------------- 3. YIELD & REVENUE PROJECTION ---------------- */

  // Survival calculation based on integrated stressors
  const survivalRate = Math.max(0, (100 - yieldLossFactor) * (healthScore / 100)).toFixed(1);
  
  // Economic impact (Scaling Laks based on survival)
  const potentialYield = 5.5; // Theoretical max yield in lakhs
  const projectedRevenue = (potentialYield * (survivalRate / 100)).toFixed(2);

  return {
    healthScore: Math.max(0, healthScore),
    survivalProb: survivalRate,
    riskLevel,
    yieldLossPrediction: `${yieldLossFactor}%`,
    feedingAdvice: feedingRecommendation,
    feedEfficiency: `${(feedEfficiency * 100).toFixed(0)}%`,
    projectedRevenue,
    alerts,
    treatments,
    status: healthScore > 75 ? "Optimal" : healthScore > 45 ? "Warning" : "Critical",
    timestamp: new Date().toLocaleTimeString(),
  };
}