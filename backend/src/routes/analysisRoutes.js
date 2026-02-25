const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { analyzePond } = require("../controllers/analysisController");

router.get("/", auth, analyzePond);

module.exports = router;