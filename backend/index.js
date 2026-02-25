require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

// connect mongo
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Fathom Backend Running");
});

// routes
app.use("/api/pond", require("./src/routes/pondRoutes"));
app.use("/api/analyze", require("./src/routes/analysisRoutes"));   // AI engine
app.use("/api/auth", require("./src/routes/authRoutes"));          // login/signup (if created)
app.use("/api/alerts", require("./src/routes/alertRoutes"));
app.use("/api/feed", require("./src/routes/feedRoutes"));

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});