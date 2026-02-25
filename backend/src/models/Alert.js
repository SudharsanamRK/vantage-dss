const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pond"
  },

  message: String,

  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },

  resolved: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Alert", alertSchema);