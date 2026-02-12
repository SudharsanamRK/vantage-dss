const mongoose = require("mongoose");

const pondSchema = new mongoose.Schema({
  label: { type: String, default: "Pond A1" },
  do: { type: Number, default: 5.5 },
  temp: { type: Number, default: 28 },
  ammonia: { type: Number, default: 0.03 },
  ph: { type: Number, default: 7.8 },
  lastSynced: { type: String, default: "Just now" }
}, { timestamps: true });

module.exports = mongoose.model("Pond", pondSchema);
