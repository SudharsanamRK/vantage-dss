const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getFeedAdvice } = require("../controllers/feedController");

router.get("/", auth, getFeedAdvice);

module.exports = router;