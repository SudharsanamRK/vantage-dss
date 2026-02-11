export const calculateGrowth = (data, config) => {
  // Logic: Growth stunted by poor water
  let survivalProb = 95;
  if (data.do < 4) survivalProb -= 20;
  
  const biomass = (config.size * config.density * 0.025); // kg estimate

  return {
    survivalProb: Math.max(0, survivalProb),
    totalKg: biomass
  };
};