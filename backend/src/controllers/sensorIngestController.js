const Pond     = require("../models/Pond");
const WaterLog = require("../models/WaterLog");
const Alert    = require("../models/Alert");

// POST /api/sensor/ingest — accepts ESP32/Arduino data via HTTP
// Body: { deviceId, apiKey, do, temp, ph, ammonia, salinity }
exports.ingest = async (req, res) => {
  try {
    const { deviceId, apiKey, do: doVal, temp, ph, ammonia, salinity } = req.body;

    // Find pond by deviceId stored in pond config
    const pond = await Pond.findOne({ deviceId });
    if (!pond) return res.status(404).json({ success: false, message: "Device not registered." });

    // Simple API key check (stored on pond record)
    if (pond.apiKey && pond.apiKey !== apiKey)
      return res.status(401).json({ success: false, message: "Invalid API key." });

    // Update live sensor values
    const update = {};
    if (doVal    != null) update.do       = Number(doVal);
    if (temp     != null) update.temp     = Number(temp);
    if (ph       != null) update.ph       = Number(ph);
    if (ammonia  != null) update.ammonia  = Number(ammonia);
    if (salinity != null) update.salinity = Number(salinity);
    update.lastSynced = new Date().toISOString();

    await Pond.findByIdAndUpdate(pond._id, update);
    await WaterLog.create({ pondId: pond._id, ...update });

    // Auto-alerts based on thresholds
    const alerts = [];
    if (update.do      != null && update.do      < (pond.alertDo      || 3.5))
      alerts.push({ userId: pond.userId, pondId: pond._id, message: `CRITICAL: DO dropped to ${update.do} mg/L`, severity: "critical" });
    if (update.ammonia != null && update.ammonia > (pond.alertAmmonia  || 0.1))
      alerts.push({ userId: pond.userId, pondId: pond._id, message: `WARNING: Ammonia at ${update.ammonia} ppm`, severity: "warning" });
    if (update.ph      != null && (update.ph < (pond.alertPhMin || 7.0) || update.ph > (pond.alertPhMax || 9.0)))
      alerts.push({ userId: pond.userId, pondId: pond._id, message: `WARNING: pH out of range at ${update.ph}`, severity: "warning" });

    if (alerts.length) await Alert.insertMany(alerts);

    res.json({ success: true, message: "Data ingested.", alertsFired: alerts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};