const router = require("express").Router();
const { getPond, updatePond } = require("../controllers/pondController");

router.get("/", getPond);
router.post("/", updatePond);

module.exports = router;
