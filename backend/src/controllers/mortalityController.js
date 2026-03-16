const MortalityLog = require("../models/MortalityLog");
const Pond         = require("../models/Pond");

// POST /api/mortality — log deaths
exports.logMortality = async (req, res) => {
  try {
    const { pondId, count, cause, notes } = req.body;
    if (!pondId || count === undefined)
      return res.status(400).json({ success: false, message: "pondId and count required." });

    const pond = await Pond.findOne({ _id: pondId, userId: req.userId });
    if (!pond) return res.status(404).json({ success: false, message: "Pond not found." });

    const doc = pond.stockingDate
      ? Math.max(0, Math.floor((Date.now() - new Date(pond.stockingDate)) / 86400000))
      : 0;

    // Sum all previous mortalities for this pond
    const prevLogs = await MortalityLog.find({ pondId });
    const prevTotal = prevLogs.reduce((s, l) => s + l.count, 0);
    const cumulativeCount = prevTotal + Number(count);

    const log = await MortalityLog.create({
      pondId, userId: req.userId,
      doc, count: Number(count),
      cause: cause || "Unknown",
      notes: notes || "",
      cumulativeCount,
    });

    // Recalculate survival estimate and update pond
    const originalCount = pond.fishCount || 1;
    const newSurvival = Math.max(0, ((originalCount - cumulativeCount) / originalCount) * 100);
    pond.survivalEstimate = parseFloat(newSurvival.toFixed(1));
    await pond.save();

    res.status(201).json({ success: true, log, newSurvivalEstimate: pond.survivalEstimate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/mortality/:pondId
exports.getMortality = async (req, res) => {
  try {
    const logs = await MortalityLog
      .find({ pondId: req.params.pondId, userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(60);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};