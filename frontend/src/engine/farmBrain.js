/**
 * VANTAGE INTELLIGENCE CORE V4
 * — Real financial calculations from Step 7 wizard inputs
 * — Water quality validation with species-aware warnings
 * — Biomass calculation from actual stocking data
 */

// ─── Species ↔ Water type compatibility ──────────────────────────────────────
const SPECIES_WATER_COMPAT = {
  Vannamei:  ["Brackish water", "Marine"],
  Monodon:   ["Brackish water", "Marine"],
  Tilapia:   ["Freshwater", "Brackish water"],
  Catfish:   ["Freshwater"],
  Rohu:      ["Freshwater"],
  Milkfish:  ["Brackish water", "Marine", "Freshwater"],
  Carp:      ["Freshwater"],
  Others:    ["Freshwater", "Brackish water", "Marine"],
};

// ─── Species optimal water quality ranges ────────────────────────────────────
const SPECIES_RANGES = {
  Vannamei: { doMin: 4.5, tempMin: 23, tempMax: 31, phMin: 7.5, phMax: 8.5, ammoniaMax: 0.3, salinityMin: 5,  salinityMax: 35 },
  Monodon:  { doMin: 4.0, tempMin: 25, tempMax: 32, phMin: 7.5, phMax: 8.5, ammoniaMax: 0.3, salinityMin: 10, salinityMax: 35 },
  Tilapia:  { doMin: 3.0, tempMin: 25, tempMax: 35, phMin: 6.5, phMax: 9.0, ammoniaMax: 0.5, salinityMin: 0,  salinityMax: 15 },
  Catfish:  { doMin: 3.0, tempMin: 24, tempMax: 32, phMin: 6.5, phMax: 8.5, ammoniaMax: 0.5, salinityMin: 0,  salinityMax: 5  },
  Rohu:     { doMin: 4.0, tempMin: 25, tempMax: 35, phMin: 7.0, phMax: 8.5, ammoniaMax: 0.4, salinityMin: 0,  salinityMax: 5  },
  Milkfish: { doMin: 3.5, tempMin: 23, tempMax: 33, phMin: 7.0, phMax: 8.5, ammoniaMax: 0.4, salinityMin: 0,  salinityMax: 35 },
  Carp:     { doMin: 4.0, tempMin: 20, tempMax: 32, phMin: 6.5, phMax: 9.0, ammoniaMax: 0.5, salinityMin: 0,  salinityMax: 5  },
};

// ─── Main analysis function ───────────────────────────────────────────────────
export function analyzePond(sensorInput, pondConfig = {}) {
  const p = sensorInput || { do: 5.4, ammonia: 0.05, ph: 7.8, temp: 28.5 };
  const c = pondConfig;

  let healthScore     = 100;
  let riskLevel       = "Low";
  let yieldLossFactor = 0;
  const alerts        = [];
  const warnings      = [];
  const treatments    = [];

  const species = c.species || "Vannamei";
  const ranges  = SPECIES_RANGES[species] || SPECIES_RANGES.Vannamei;

  // ── 1. WATER QUALITY VALIDATION ────────────────────────────────────────────

  // Species ↔ Water type compatibility
  const compatible = SPECIES_WATER_COMPAT[species] || [];
  if (c.waterType && !compatible.includes(c.waterType)) {
    warnings.push({
      type:    "SPECIES_WATER_MISMATCH",
      level:   "warning",
      message: `${species} typically requires ${compatible.join(" or ")} — not ${c.waterType}.`,
      advice:  species === "Vannamei"
        ? "Vannamei can survive in low-salinity water but growth and survival may reduce significantly. Consider adding mineral salts to raise salinity to at least 3–5 ppt."
        : `Consider switching to a species suited for ${c.waterType}, or adjust your water source.`,
    });
  }

  // Dissolved Oxygen
  if (p.do !== null && p.do !== undefined) {
    if (p.do < 3.0) {
      healthScore     -= 45;
      yieldLossFactor += 25;
      riskLevel        = "Critical";
      alerts.push("CRITICAL: Severe Hypoxia — immediate shrimp mortality risk.");
      treatments.push({
        id: "aeration", label: "Boost Aeration (Max RPM)",
        desc: "Emergency DO recovery via paddlewheels/injectors.",
        effect: () => ({ ...p, do: Math.min(7.5, p.do + 2.0) }),
      });
    } else if (p.do < ranges.doMin) {
      healthScore     -= 20;
      yieldLossFactor += 10;
      riskLevel        = "Elevated";
      alerts.push(`WARNING: Low DO (${p.do} mg/L). Threshold for ${species} is ${ranges.doMin} mg/L.`);
      treatments.push({
        id: "aeration", label: "Increase Aeration RPM",
        desc: "Raise paddlewheel speed to restore dissolved oxygen.",
        effect: () => ({ ...p, do: Math.min(7.5, p.do + 1.5) }),
      });
    }
  }

  // Ammonia
  if (p.ammonia !== null && p.ammonia !== undefined) {
    if (p.ammonia > ranges.ammoniaMax) {
      const acute     = p.ammonia > 0.5;
      healthScore     -= acute ? 30 : 15;
      yieldLossFactor += acute ? 15 : 5;
      if (acute) riskLevel = "Critical";
      alerts.push(`${acute ? "ACUTE" : "CHRONIC"}: Ammonia toxicity (${p.ammonia} ppm) — damages gill tissue.`);
      treatments.push({
        id: "water_exchange", label: "Partial Water Exchange",
        desc: "Replace 20–30% pond water to dilute nitrogenous waste.",
        effect: () => ({ ...p, ammonia: Math.max(0, p.ammonia - 0.2) }),
      });
    }
  }

  // Temperature
  if (p.temp !== null && p.temp !== undefined) {
    if (p.temp > ranges.tempMax) {
      healthScore     -= 15;
      yieldLossFactor += 8;
      warnings.push({
        type: "TEMP_HIGH", level: "warning",
        message: `Temperature ${p.temp}°C exceeds safe limit (${ranges.tempMax}°C) for ${species}.`,
        advice: "Increase water exchange to cool pond. Reduce feed ration by 20%.",
      });
    } else if (p.temp < ranges.tempMin) {
      healthScore     -= 10;
      yieldLossFactor += 5;
      warnings.push({
        type: "TEMP_LOW", level: "info",
        message: `Temperature ${p.temp}°C is below optimal (${ranges.tempMin}°C) for ${species}.`,
        advice: "Reduce feeding frequency. Growth will be slower than projected.",
      });
    }
  }

  // pH
  if (p.ph !== null && p.ph !== undefined) {
    if (p.ph < ranges.phMin || p.ph > ranges.phMax) {
      healthScore     -= 10;
      yieldLossFactor += 5;
      const dir = p.ph < ranges.phMin ? "too acidic" : "too alkaline";
      warnings.push({
        type: "PH_OUT_OF_RANGE", level: "warning",
        message: `pH ${p.ph} is ${dir} — optimal for ${species} is ${ranges.phMin}–${ranges.phMax}.`,
        advice: p.ph < ranges.phMin
          ? "Apply agricultural lime to raise pH."
          : "Increase water exchange to lower pH.",
      });
    }
  }

  // Low salinity warning for Vannamei
  if (species === "Vannamei" && p.salinity !== null && p.salinity !== undefined && p.salinity < 3) {
    warnings.push({
      type:    "LOW_SALINITY",
      level:   "warning",
      message: `Salinity ${p.salinity} ppt is very low for Vannamei (min recommended: 3–5 ppt).`,
      advice:  "Add marine salt or mineral mix to raise salinity. Low salinity increases disease susceptibility.",
    });
  }

  // ── 2. ADAPTIVE FEEDING LOGIC ───────────────────────────────────────────────
  let feedEfficiency        = 1.0;
  let feedingRecommendation = "Optimal Feed (Adaptive)";

  if (p.temp > 31.5)    { feedEfficiency = 0.85; feedingRecommendation = "Reduce Ration (Heat Stress)"; }
  else if (p.temp < 25) { feedEfficiency = 0.60; feedingRecommendation = "Minimal Ration (Low Temp)"; }
  else if (p.do < 4.0)  { feedEfficiency = 0.30; feedingRecommendation = "Stop Feed (Low Oxygen)"; }

  // ── 3. BIOMASS CALCULATION ──────────────────────────────────────────────────
  const fishCount           = c.fishCount           || 0;
  const avgSeedWeight       = c.avgSeedWeight       || 0.001;
  const survivalEst         = (c.survivalEstimate   ?? 85) / 100;
  const doc                 = c.doc                 || 0;
  const targetHarvestWeight = c.targetHarvestWeight || 20;
  const targetDays          = c.targetHarvestDays   || 120;

  // Linear daily growth from seed weight → target harvest weight
  const dailyGrowth      = targetDays > 0
    ? (targetHarvestWeight - avgSeedWeight) / targetDays
    : 0;
  const currentAvgWeight = Math.min(avgSeedWeight + (dailyGrowth * doc), targetHarvestWeight);

  const waterSurvivalFactor = Math.max(0, (100 - yieldLossFactor) / 100);
  const survivingCount      = fishCount * survivalEst * waterSurvivalFactor;
  const biomassKg           = (survivingCount * currentAvgWeight) / 1000;
  const projectedHarvestKg  = (fishCount * survivalEst * waterSurvivalFactor * targetHarvestWeight) / 1000;

  // ── 4. FINANCIAL ENGINE ─────────────────────────────────────────────────────
  const expectedPrice    = c.expectedPrice    || 450;
  const feedCostPerKg    = c.feedCostPerKg    || 70;
  const seedCost         = c.seedCost         || 350;
  const laborCost        = c.laborCost        || 12000;
  const electricityCost  = c.electricityCost  || 6000;
  const medicineCost     = c.medicineCost      || 20000;
  const fcrTarget        = c.fcrTarget        || 1.5;
  const cultureMonths    = targetDays / 30;

  const grossRevenue     = projectedHarvestKg * expectedPrice;
  const totalSeedCost    = (fishCount / 1000) * seedCost;
  const totalFeedCost    = projectedHarvestKg * fcrTarget * feedCostPerKg;
  const totalLabor       = laborCost * cultureMonths;
  const totalElectricity = electricityCost * cultureMonths;
  const totalCost        = totalSeedCost + totalFeedCost + totalLabor + totalElectricity + medicineCost;
  const netProfit        = grossRevenue - totalCost;
  const roi              = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : 0;

  const toL = (n) => (n / 100000).toFixed(2);

  const survivalRate = Math.max(0, (100 - yieldLossFactor) * (healthScore / 100)).toFixed(1);

  // ── 5. PREDICTIVE MORTALITY ALERT ───────────────────────────────────────────
  // Uses sensor history array if passed in config (c.sensorHistory = [{do, ammonia}])
  const predictiveAlerts = [];
  if (Array.isArray(c.sensorHistory) && c.sensorHistory.length >= 3) {
    const recent = c.sensorHistory.slice(-5); // last 5 readings

    // DO trending down — check last 3 consecutive below 5.0
    const lowDoReadings = recent.filter(r => r.do != null && r.do < 5.0);
    if (lowDoReadings.length >= 3) {
      predictiveAlerts.push("PREDICTIVE: DO has been below 5.0 mg/L for 3+ readings — mortality risk rising.");
    }

    // Ammonia trending up — compare first and last of recent window
    const ammoniaVals = recent.map(r => r.ammonia).filter(v => v != null);
    if (ammoniaVals.length >= 3) {
      const trend = ammoniaVals[ammoniaVals.length - 1] - ammoniaVals[0];
      if (trend > 0.05) {
        predictiveAlerts.push(`PREDICTIVE: Ammonia trending up (+${trend.toFixed(2)} ppm over last ${ammoniaVals.length} readings) — intervene before threshold breach.`);
      }
    }

    // pH drifting out of range
    const phVals = recent.map(r => r.ph).filter(v => v != null);
    if (phVals.length >= 2) {
      const phDrift = Math.abs(phVals[phVals.length - 1] - phVals[0]);
      if (phDrift > 0.5) {
        predictiveAlerts.push(`PREDICTIVE: pH shifted ${phDrift.toFixed(1)} units in recent readings — check buffering capacity.`);
      }
    }
  }

  return {
    // Health
    healthScore:         Math.max(0, healthScore),
    survivalProb:        survivalRate,
    riskLevel,
    yieldLossPrediction: `${yieldLossFactor}%`,
    alerts,
    warnings,
    treatments,
    predictiveAlerts,
    status: healthScore > 75 ? "Optimal" : healthScore > 45 ? "Warning" : "Critical",

    // Feeding
    feedingAdvice:  feedingRecommendation,
    feedEfficiency: `${(feedEfficiency * 100).toFixed(0)}%`,

    // Biomass
    currentBiomassKg:   parseFloat(biomassKg.toFixed(1)),
    projectedHarvestKg: parseFloat(projectedHarvestKg.toFixed(0)),
    currentAvgWeight:   parseFloat(currentAvgWeight.toFixed(2)),
    survivingCount:     Math.round(survivingCount),

    // Financials
    grossRevenue:    toL(grossRevenue),
    totalCost:       toL(totalCost),
    netProfit:       toL(netProfit),
    roi:             `${roi}%`,
    projectedRevenue: toL(grossRevenue),
    costBreakdown: {
      seed:        Math.round(totalSeedCost),
      feed:        Math.round(totalFeedCost),
      labor:       Math.round(totalLabor),
      electricity: Math.round(totalElectricity),
      medicine:    Math.round(medicineCost),
    },

    timestamp: new Date().toLocaleTimeString(),
  };
}