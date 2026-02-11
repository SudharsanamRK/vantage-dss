export const analyzeWater = (data, thresholds) => {
  const alerts = [];
  const treatments = [];
  let score = 100;

  // Logic: Check DO
  if (data.do < (thresholds?.doCrit || 4.5)) {
    score -= 30;
    alerts.push("CRITICAL_OXYGEN_LOW");
    treatments.push({
      id: "aeration_boost",
      label: "Max Aeration RPM",
      effect: (s) => ({ ...s, do: s.do + 1.5 })
    });
  }

  // Logic: Check Ammonia
  if (data.ammonia > 0.1) {
    score -= 40;
    alerts.push("AMMONIA_TOXICITY_RISK");
  }

  return { score, alerts, treatments };
};