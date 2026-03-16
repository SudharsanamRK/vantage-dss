const CycleHistory = require("../models/CycleHistory");
const WaterLog     = require("../models/WaterLog");
const Pond         = require("../models/Pond");

// POST /api/cycles/complete — archive current cycle and reset pond
exports.completeCycle = async (req, res) => {
  try {
    const { pondId, notes, finalBiomassKg, finalAvgWeight, survivalPct, fcr,
            grossRevenue, totalCost, netProfit, roi } = req.body;

    const pond = await Pond.findOne({ _id: pondId, userId: req.userId });
    if (!pond) return res.status(404).json({ success: false, message: "Pond not found." });

    const doc = pond.stockingDate
      ? Math.max(0, Math.floor((Date.now() - new Date(pond.stockingDate)) / 86400000))
      : 0;

    // Get average water quality over the cycle
    const waterLogs = await WaterLog.find({ pondId }).limit(200);
    const avg = (field) => {
      const vals = waterLogs.map(l => l[field]).filter(v => v != null);
      return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : null;
    };

    // Get existing cycle count
    const prevCycles = await CycleHistory.countDocuments({ pondId });

    const cycle = await CycleHistory.create({
      pondId, userId: req.userId,
      pondLabel:    pond.label,
      cycleNo:      prevCycles + 1,
      species:      pond.species,
      stockingDate: pond.stockingDate,
      fishCount:    pond.fishCount,
      stockingDensity: pond.stockingDensity,
      avgSeedWeight: pond.avgSeedWeight,
      harvestDate:  new Date(),
      finalDoc:     doc,
      finalAvgWeight, finalBiomassKg, survivalPct, fcr,
      grossRevenue, totalCost, netProfit, roi,
      expectedPrice: pond.expectedPrice,
      avgDo:    avg("do"),
      avgTemp:  avg("temp"),
      avgPh:    avg("ph"),
      avgAmmonia: avg("ammonia"),
      notes: notes || "",
    });

    // Reset pond for new cycle (preserve config, clear live data)
    await Pond.findByIdAndUpdate(pondId, {
      stockingDate: null,
      do: null, temp: null, ph: null, ammonia: null,
      survivalEstimate: 90,
    });

    // Clear old water logs
    await WaterLog.deleteMany({ pondId });

    res.status(201).json({ success: true, cycle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/cycles/:pondId — get all cycles
exports.getCycles = async (req, res) => {
  try {
    const cycles = await CycleHistory
      .find({ pondId: req.params.pondId, userId: req.userId })
      .sort({ cycleNo: -1 });
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/cycles — all cycles for current user
exports.getAllCycles = async (req, res) => {
  try {
    const cycles = await CycleHistory
      .find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};