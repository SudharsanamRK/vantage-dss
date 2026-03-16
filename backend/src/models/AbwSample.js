const mongoose = require("mongoose");

const abwSampleSchema = new mongoose.Schema({
  pondId:     { type: mongoose.Schema.Types.ObjectId, ref: "Pond", required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doc:        { type: Number, default: 0 },           // day of culture at time of sampling
  weights:    [{ type: Number }],                      // individual shrimp weights in grams
  avgWeight:  { type: Number, required: true },        // calculated average
  sampleSize: { type: Number, required: true },        // how many shrimp weighed
  notes:      { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("AbwSample", abwSampleSchema);