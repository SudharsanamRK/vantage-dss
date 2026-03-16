const AbwSample = require("../models/AbwSample");
const Pond      = require("../models/Pond");

// POST /api/abw — log a new sample
exports.logSample = async (req, res) => {
  try {
    const { pondId, weights, notes } = req.body;
    if (!pondId || !Array.isArray(weights) || weights.length === 0)
      return res.status(400).json({ success: false, message: "pondId and weights[] required." });

    const pond = await Pond.findOne({ _id: pondId, userId: req.userId });
    if (!pond) return res.status(404).json({ success: false, message: "Pond not found." });

    const doc = pond.stockingDate
      ? Math.max(0, Math.floor((Date.now() - new Date(pond.stockingDate)) / 86400000))
      : 0;

    const numericWeights = weights.map(Number).filter(w => w > 0);
    const avgWeight = parseFloat((numericWeights.reduce((a, b) => a + b, 0) / numericWeights.length).toFixed(2));

    const sample = await AbwSample.create({
      pondId, userId: req.userId,
      doc, weights: numericWeights,
      avgWeight, sampleSize: numericWeights.length,
      notes: notes || "",
    });

    // Update pond's current avgWeight so brain engine uses real data
    pond.avgWeight = avgWeight;
    await pond.save();

    res.status(201).json({ success: true, sample, avgWeight });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/abw/:pondId — get sample history
exports.getSamples = async (req, res) => {
  try {
    const samples = await AbwSample
      .find({ pondId: req.params.pondId, userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(samples);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};