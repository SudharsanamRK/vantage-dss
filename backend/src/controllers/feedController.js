const Pond = require("../models/Pond");
const { analyzeWater } = require("../engine/farmBrain");
const { calculateFeed } = require("../engine/feedEngine");

exports.getFeedAdvice = async (req, res) => {
  try {
    const pond = await Pond.findOne({ userId: req.userId });

    if (!pond) return res.status(404).json("No pond");

    // get water status
    const analysis = analyzeWater({
      doLevel: pond.do,
      temp: pond.temp,
      ph: pond.ph,
      ammonia: pond.ammonia
    });

    // calculate feed
    const feed = calculateFeed({
      fishCount: pond.fishCount,
      avgWeight: pond.avgWeight,
      temp: pond.temp,
      status: analysis.status
    });

    res.json({
      waterStatus: analysis.status,
      feed
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};