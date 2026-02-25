exports.calculateFeed = ({ fishCount, avgWeight, temp, status }) => {
  // feeding rate based on weight
  let feedRate = 0.03; // 3%

  if (avgWeight > 200) feedRate = 0.02;
  if (avgWeight > 500) feedRate = 0.015;

  // temperature adjustment
  if (temp < 24) feedRate *= 0.7;
  if (temp > 32) feedRate *= 0.8;

  // water danger → reduce feeding
  if (status === "Danger") feedRate *= 0.3;

  const totalBiomass = fishCount * avgWeight / 1000; // kg
  const feedKg = totalBiomass * feedRate;

  return {
    feedPerDayKg: feedKg.toFixed(2),
    feedsPerDay: 3,
    note: status === "Danger"
      ? "Reduce feeding due to poor water"
      : "Normal feeding"
  };
};