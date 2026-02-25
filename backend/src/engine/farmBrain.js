exports.analyzeWater = ({ doLevel, temp, ph, ammonia }) => {
  let status = "Healthy";
  let alerts = [];
  let advice = [];

  if (doLevel < 4) {
    status = "Danger";
    alerts.push({
      message: "Low dissolved oxygen",
      severity: "high"
    });
    advice.push("Turn on aerator immediately");
  }

  if (temp > 32) {
    alerts.push({
      message: "High temperature",
      severity: "medium"
    });
    advice.push("Add fresh water");
  }

  if (ph > 9 || ph < 6.5) {
    status = "Risk";
    alerts.push({
      message: "pH out of range",
      severity: "medium"
    });
    advice.push("Adjust pH");
  }

  if (ammonia > 0.1) {
    status = "Danger";
    alerts.push({
      message: "High ammonia level",
      severity: "high"
    });
    advice.push("Stop feeding + water change");
  }

  return {
    status,
    alerts,
    advice
  };
};