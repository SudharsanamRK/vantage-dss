const mongoose = require("mongoose");

const pondSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  label: {
    type: String,
    default: "Pond A1"
  },

  species: {
    type: String,
    default: "Tilapia"
  },

  area: {
    type: Number,
    default: 1
  },

  // 🌊 sensor readings
  do: { type: Number, default: 5.5 },
  temp: { type: Number, default: 28 },
  ammonia: { type: Number, default: 0.03 },
  ph: { type: Number, default: 7.8 },

  lastSynced: {
    type: String,
    default: "Just now"
  },

  // 🐟 fish stock (NEW)
  fishCount: {
    type: Number,
    default: 1000
  },

  avgWeight: {
    type: Number,
    default: 50   // grams
  }

}, { timestamps: true });

module.exports = mongoose.model("Pond", pondSchema);