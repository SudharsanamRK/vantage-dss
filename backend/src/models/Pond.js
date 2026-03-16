const mongoose = require("mongoose");

const pondSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // ── STEP 1: Farm Info ──────────────────────────────────────────────────────
  farmName:    { type: String, default: "" },
  ownerName:   { type: String, default: "" },
  location:    { type: String, default: "" },   // district / state / GPS string
  farmSize:    { type: Number, default: null },  // total acres
  farmSizeUnit:{ type: String, default: "acres" }, // acres | hectares
  numPonds:    { type: Number, default: 1 },
  cultureType: { type: String, default: "Semi-intensive" }, // Extensive | Semi-intensive | Intensive
  waterType:   { type: String, default: "Freshwater" },     // Freshwater | Brackish water | Marine

  // ── STEP 2: Pond Details ───────────────────────────────────────────────────
  label:       { type: String, default: "Pond A1" },
  pondArea:    { type: Number, default: null },   // pond-specific area
  pondAreaUnit:{ type: String, default: "acres" },
  depthMin:    { type: Number, default: null },   // meters
  depthMax:    { type: Number, default: null },
  pondType:    { type: String, default: "Earthen" }, // Earthen | Lined | Concrete
  waterCapacity:{ type: Number, default: null },  // liters or m³
  soilType:    { type: String, default: "Clay" }, // Clay | Sandy | Loamy

  // ── STEP 3: Stocking Info ─────────────────────────────────────────────────
  species:        { type: String, default: "Vannamei" },
  seedSource:     { type: String, default: "" },      // hatchery name
  stockingDensity:{ type: Number, default: null },    // per m²
  stockingDate:   { type: Date,   default: null },
  avgSeedWeight:  { type: Number, default: null },    // grams
  seedSize:       { type: String, default: "" },      // PL12, PL15, etc.
  survivalEstimate:{ type: Number, default: 90 },     // %
  fishCount:      { type: Number, default: 1000 },

  // ── STEP 4: Water Source & Infrastructure ─────────────────────────────────
  waterSource:    { type: String, default: "Borewell" }, // Borewell | Canal | River | Reservoir
  waterExchange:  { type: String, default: "" },
  aerationType:   { type: String, default: "Paddle wheel" }, // Paddle wheel | Air diffuser | Both
  numAerators:    { type: Number, default: 0 },
  backupPower:    { type: Boolean, default: false },
  drainageSystem: { type: String, default: "" },

  // ── STEP 5: Water Quality Baseline ────────────────────────────────────────
  temp:        { type: Number, default: null },
  ph:          { type: Number, default: null },
  do:          { type: Number, default: null },  // dissolved oxygen
  salinity:    { type: Number, default: null },  // ppt
  ammonia:     { type: Number, default: null },
  nitrite:     { type: Number, default: null },
  alkalinity:  { type: Number, default: null },
  transparency:{ type: Number, default: null },  // cm Secchi disk

  // ── STEP 6: Feed & Management ─────────────────────────────────────────────
  feedBrand:      { type: String, default: "" },
  feedProtein:    { type: Number, default: null }, // %
  feedingMethod:  { type: String, default: "Manual" },
  feedingFrequency:{ type: Number, default: 4 },  // times/day
  feedingTray:    { type: Boolean, default: false },
  fcrTarget:      { type: Number, default: 1.5 },
  biomassEstimate:{ type: Number, default: null }, // kg

  // ── STEP 7: Financial Inputs ──────────────────────────────────────────────
  seedCost:        { type: Number, default: null }, // ₹ per 1000 seeds
  feedCostPerKg:   { type: Number, default: null },
  laborCost:       { type: Number, default: null }, // ₹/month
  electricityCost: { type: Number, default: null }, // ₹/month
  medicineCost:    { type: Number, default: null },
  targetHarvestWeight:{ type: Number, default: null }, // grams
  targetHarvestDays:  { type: Number, default: 120 },
  expectedPrice:   { type: Number, default: null }, // ₹/kg

  // ── STEP 8: Monitoring Preference ─────────────────────────────────────────
  monitoringMode:  { type: String, default: "Manual data entry" },
  loggingFrequency:{ type: String, default: "Daily logs" },

  // ── STEP 9: Alerts & Notifications ────────────────────────────────────────
  alertDo:      { type: Number, default: 3.5 },
  alertPhMin:   { type: Number, default: 7.0 },
  alertPhMax:   { type: Number, default: 9.0 },
  alertAmmonia: { type: Number, default: 0.1 },
  notifyMethod: { type: String, default: "App" }, // App | SMS | Both

  // ── Legacy / live sensor fields ───────────────────────────────────────────
  avgWeight:  { type: Number, default: 50 },
  area:       { type: Number, default: 1 },
  lastSynced: { type: String, default: "Just now" },

  // Setup completion flag
  setupComplete: { type: Boolean, default: false },

  // ── IoT Device fields ──────────────────────────────────────────────────────
  deviceId: { type: String, default: null },   // ESP32 device identifier
  apiKey:   { type: String, default: null },   // shared secret for sensor auth

}, { timestamps: true });

module.exports = mongoose.model("Pond", pondSchema);