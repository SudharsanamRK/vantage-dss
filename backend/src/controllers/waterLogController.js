const WaterLog = require("../models/WaterLog");
const Pond     = require("../models/Pond");

// GET /api/waterlog/:pondId?days=7 — sensor history for charts
exports.getHistory = async (req, res) => {
  try {
    const { pondId } = req.params;
    const days = parseInt(req.query.days) || 7;

    // Verify ownership
    const pond = await Pond.findOne({ _id: pondId, userId: req.userId });
    if (!pond) return res.status(404).json({ success: false, message: "Pond not found." });

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const logs  = await WaterLog
      .find({ pondId, createdAt: { $gte: since } })
      .sort({ createdAt: 1 })
      .select("do temp ph ammonia createdAt");

    // Group by day for chart display
    const byDay = {};
    logs.forEach(log => {
      const day = new Date(log.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short" });
      if (!byDay[day]) byDay[day] = { day, readings: [] };
      byDay[day].readings.push(log);
    });

    // Average each day's readings
    const chartData = Object.values(byDay).map(({ day, readings }) => {
      const avg = (field) => {
        const vals = readings.map(r => r[field]).filter(v => v != null);
        return vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
      };
      return { day, do: avg("do"), temp: avg("temp"), ph: avg("ph"), ammonia: avg("ammonia") };
    });

    res.json({ success: true, chartData, totalReadings: logs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};