const mongoose = require("mongoose");

const waterLogSchema = new mongoose.Schema({
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pond"
  },

  do: Number,
  temp: Number,
  ammonia: Number,
  ph: Number

}, { timestamps: true });

module.exports = mongoose.model("WaterLog", waterLogSchema);