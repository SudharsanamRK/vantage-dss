const router = require("express").Router();
const { getPond, updatePond } = require("../controllers/pondController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, getPond);

router.post("/", auth, updatePond);

module.exports = router;