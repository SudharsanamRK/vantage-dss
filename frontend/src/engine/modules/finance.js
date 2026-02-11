export const predictEconomics = (biology, water, config) => {
  const MARKET_PRICE = 450; // ₹/kg
  const projectedRevenue = (biology.totalKg * (biology.survivalProb / 100) * MARKET_PRICE);

  return {
    revenue: Math.floor(projectedRevenue).toLocaleString('en-IN'),
    fcr: water.score > 80 ? "1.2 (Optimal)" : "1.9 (Wasteful)"
  };
};