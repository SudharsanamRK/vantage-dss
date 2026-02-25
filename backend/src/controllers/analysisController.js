const Pond = require("../models/Pond");
const { analyzeWater } = require("../engine/farmBrain");

exports.analyzePond = async (req, res) => {
  try {
    const pond = await Pond.findOne({ userId: req.userId });

    if (!pond) return res.status(404).json("No pond");

    const result = analyzeWater({
      doLevel: pond.do,
      temp: pond.temp,
      ph: pond.ph,
      ammonia: pond.ammonia
    });

    res.json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
};