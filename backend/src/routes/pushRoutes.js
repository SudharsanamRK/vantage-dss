// backend/src/routes/pushRoutes.js
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const push    = require("../services/pushNotification");

// GET /api/push/vapid-key — frontend fetches this to register
router.get("/vapid-key", (req, res) => {
  const key = push.getVapidPublicKey();
  if (!key) return res.json({ success: false, message: "Push notifications not configured." });
  res.json({ success: true, publicKey: key });
});

// POST /api/push/subscribe — save a browser subscription
router.post("/subscribe", auth, (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ success: false, message: "Subscription required." });
  push.saveSubscription(req.userId, subscription);
  res.json({ success: true, message: "Subscribed to push notifications." });
});

// POST /api/push/test — send a test notification
router.post("/test", auth, async (req, res) => {
  try {
    await push.sendAlert(req.userId, "Fathom Alert Test", "Push notifications are working! 🎉");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;