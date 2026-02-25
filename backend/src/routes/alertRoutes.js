const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const Alert = require("../models/Alert");

// get alerts
router.get("/", auth, async (req, res) => {
  const alerts = await Alert.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(alerts);
});

// resolve alert
router.post("/resolve/:id", auth, async (req, res) => {
  await Alert.findByIdAndUpdate(req.params.id, { resolved: true });
  res.json("resolved");
});

module.exports = router;