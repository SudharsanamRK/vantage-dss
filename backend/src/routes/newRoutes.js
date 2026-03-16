const express = require("express");
const auth    = require("../middleware/authMiddleware");

// ── ABW Routes ──────────────────────────────────────────────────────────────
const abwRouter = express.Router();
const { logSample, getSamples } = require("../controllers/abwController");
abwRouter.post("/",          auth, logSample);
abwRouter.get("/:pondId",    auth, getSamples);

// ── Mortality Routes ────────────────────────────────────────────────────────
const mortalityRouter = express.Router();
const { logMortality, getMortality } = require("../controllers/mortalityController");
mortalityRouter.post("/",        auth, logMortality);
mortalityRouter.get("/:pondId",  auth, getMortality);

// ── Cycle History Routes ────────────────────────────────────────────────────
const cycleRouter = express.Router();
const { completeCycle, getCycles, getAllCycles } = require("../controllers/cycleController");
cycleRouter.post("/complete",     auth, completeCycle);
cycleRouter.get("/all",          auth, getAllCycles);
cycleRouter.get("/:pondId",      auth, getCycles);

// ── IoT Sensor Ingest ───────────────────────────────────────────────────────
const sensorRouter = express.Router();
const { ingest } = require("../controllers/sensorIngestController");
sensorRouter.post("/ingest", ingest); // no auth — device uses apiKey instead

// ── Water Log History ───────────────────────────────────────────────────────
const waterLogRouter = express.Router();
const { getHistory } = require("../controllers/waterLogController");
waterLogRouter.get("/:pondId", auth, getHistory);

module.exports = { abwRouter, mortalityRouter, cycleRouter, sensorRouter, waterLogRouter };