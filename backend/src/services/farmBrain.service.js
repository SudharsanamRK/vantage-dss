// THIS connects to your frontend logic later

function analyzePond(data) {
  const { do: oxygen, ammonia } = data;

  let healthScore = 100;

  if (oxygen < 5) healthScore -= 30;
  if (ammonia > 0.1) healthScore -= 40;

  return {
    healthScore,
    status: healthScore > 70 ? "STABLE" : "CRITICAL",
  };
}

module.exports = { analyzePond };
