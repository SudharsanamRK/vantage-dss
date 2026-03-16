const mongoose = require("mongoose");

const cycleHistorySchema = new mongoose.Schema({
  pondId:    { type: mongoose.Schema.Types.ObjectId, ref: "Pond", required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pondLabel: { type: String, default: "" },
  cycleNo:   { type: Number, default: 1 },

  // Stocking info snapshot
  species:         { type: String },
  stockingDate:    { type: Date },
  fishCount:       { type: Number },
  stockingDensity: { type: Number },
  avgSeedWeight:   { type: Number },

  // Harvest results
  harvestDate:     { type: Date, default: Date.now },
  finalDoc:        { type: Number },
  finalAvgWeight:  { type: Number },   // grams
  finalBiomassKg:  { type: Number },
  survivalPct:     { type: Number },
  fcr:             { type: Number },

  // Financials snapshot
  grossRevenue:    { type: Number },
  totalCost:       { type: Number },
  netProfit:       { type: Number },
  roi:             { type: String },
  expectedPrice:   { type: Number },

  // Water quality avg over cycle
  avgDo:      { type: Number },
  avgTemp:    { type: Number },
  avgPh:      { type: Number },
  avgAmmonia: { type: Number },

  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("CycleHistory", cycleHistorySchema);