const Pond     = require("../models/Pond");
const WaterLog = require("../models/WaterLog");
const Alert    = require("../models/Alert");
const { analyzeWater } = require("../engine/farmBrain");

// ── GET /api/pond/all ─────────────────────────────────────────────────────────
exports.getAllPonds = async (req, res) => {
  try {
    const ponds = await Pond.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json(ponds);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/pond/setup — full wizard data save ───────────────────────────
exports.setupPond = async (req, res) => {
  try {
    const data = { ...req.body, userId: req.userId, setupComplete: true };

    // Sync area alias
    if (data.pondArea && !data.area) data.area = data.pondArea;

    const pond = await Pond.create(data);
    res.status(201).json({ success: true, pond });
  } catch (err) {
    console.error("setupPond error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/pond/create — quick create (topbar) ─────────────────────────
exports.createPond = async (req, res) => {
  try {
    const { label, species, area, fishCount } = req.body;
    if (!label?.trim())
      return res.status(400).json({ success: false, message: "Pond name is required." });

    const pond = await Pond.create({
      userId: req.userId,
      label:  label.trim(),
      species: species  || "Vannamei",
      area:    area     || 1000,
      fishCount: fishCount || 1000,
      setupComplete: false,
    });
    res.status(201).json({ success: true, pond });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/pond/:id ───────────────────────────────────────────────────
exports.deletePond = async (req, res) => {
  try {
    const pond = await Pond.findOne({ _id: req.params.id, userId: req.userId });
    if (!pond) return res.status(404).json({ success: false, message: "Pond not found." });
    await pond.deleteOne();
    res.json({ success: true, message: "Pond deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/pond — single pond (legacy) ─────────────────────────────────
exports.getPond = async (req, res) => {
  try {
    const pond = await Pond.findOne({ userId: req.userId }).sort({ createdAt: 1 });
    res.json(pond || null);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/pond — update sensor data ──────────────────────────────────
exports.updatePond = async (req, res) => {
  try {
    const pondId = req.body.pondId;
    let pond = pondId
      ? await Pond.findOne({ _id: pondId, userId: req.userId })
      : await Pond.findOne({ userId: req.userId }).sort({ createdAt: 1 });

    if (!pond) return res.status(404).json({ success: false, message: "Pond not found." });

    Object.assign(pond, req.body);
    await pond.save();

    await WaterLog.create({ pondId: pond._id, do: pond.do, temp: pond.temp, ammonia: pond.ammonia, ph: pond.ph });

    const result = analyzeWater({ doLevel: pond.do, temp: pond.temp, ph: pond.ph, ammonia: pond.ammonia });

    for (const a of (result.alerts || [])) {
      await Alert.create({ userId: req.userId, pondId: pond._id, message: a.message || a, severity: a.severity || "info" });
    }

    res.json({ pond, analysis: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/pond/:id — partial update from Setup page ─────────────────────
exports.patchPond = async (req, res) => {
  try {
    const pond = await Pond.findOne({ _id: req.params.id, userId: req.userId });
    if (!pond)
      return res.status(404).json({ success: false, message: "Pond not found." });

    // Merge only the fields sent — don't overwrite everything
    Object.assign(pond, req.body);
    await pond.save();

    res.json({ success: true, pond });
  } catch (err) {
    console.error("patchPond error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};