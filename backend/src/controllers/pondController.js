const Pond = require("../models/Pond");
const WaterLog = require("../models/WaterLog");
const { analyzeWater } = require("../engine/farmBrain");
const Alert = require("../models/Alert");

// ===============================
// GET pond for logged-in user
// ===============================
exports.getPond = async (req, res) => {
  try {
    let pond = await Pond.findOne({ userId: req.userId });

    if (!pond) {
      pond = await Pond.create({
        userId: req.userId,
        label: "Pond A1"
      });
    }

    res.json(pond);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ===============================
// UPDATE pond + history + alerts
// ===============================
exports.updatePond = async (req, res) => {
  try {
    let pond = await Pond.findOne({ userId: req.userId });

    // create if not exists
    if (!pond) {
      pond = await Pond.create({
        ...req.body,
        userId: req.userId
      });
    } else {
      Object.assign(pond, req.body);
      await pond.save();
    }

    // ===============================
    // SAVE WATER HISTORY
    // ===============================
    await WaterLog.create({
      pondId: pond._id,
      do: pond.do,
      temp: pond.temp,
      ammonia: pond.ammonia,
      ph: pond.ph
    });

    // ===============================
    // RUN AI ANALYSIS
    // ===============================
    const result = analyzeWater({
      doLevel: pond.do,
      temp: pond.temp,
      ph: pond.ph,
      ammonia: pond.ammonia
    });

    // ===============================
    // SAVE ALERTS
    // ===============================
    for (const a of result.alerts) {
      await Alert.create({
        userId: req.userId,
        pondId: pond._id,
        message: a.message,
        severity: a.severity
      });
    }

    res.json({
      pond,
      analysis: result
    });

  } catch (err) {
    res.status(500).json(err.message);
  }
};