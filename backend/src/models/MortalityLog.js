const mongoose = require("mongoose");

const mortalityLogSchema = new mongoose.Schema({
  pondId:       { type: mongoose.Schema.Types.ObjectId, ref: "Pond", required: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doc:          { type: Number, default: 0 },
  count:        { type: Number, required: true },   // number of dead shrimp found
  cause:        { type: String, default: "Unknown" }, // Disease | Hypoxia | Unknown | Other
  notes:        { type: String, default: "" },
  cumulativeCount: { type: Number, default: 0 },    // running total (set by controller)
}, { timestamps: true });

module.exports = mongoose.model("MortalityLog", mortalityLogSchema);