require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

// Connect MongoDB
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Fathom Backend Running"));

app.use("/api/auth",    require("./src/routes/authRoutes"));
app.use("/api/pond",    require("./src/routes/pondRoutes"));
app.use("/api/analyze", require("./src/routes/analysisRoutes"));
app.use("/api/alerts",  require("./src/routes/alertRoutes"));
app.use("/api/feed",    require("./src/routes/feedRoutes"));

// ── New feature routes ────────────────────────────────────────────────────────
const { abwRouter, mortalityRouter, cycleRouter, sensorRouter, waterLogRouter }
  = require("./src/routes/newRoutes");
app.use("/api/abw",       abwRouter);
app.use("/api/mortality", mortalityRouter);
app.use("/api/cycles",    cycleRouter);
app.use("/api/sensor",    sensorRouter);
app.use("/api/waterlog",  waterLogRouter);
app.use("/api/push",      require("./src/routes/pushRoutes"));
app.use("/api/ai",        require("./src/routes/aiRoutes"));
app.use("/api/weather",   require("./src/routes/weatherRoutes")); // ← added

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));