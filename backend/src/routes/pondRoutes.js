const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const {
  getAllPonds, setupPond, createPond,
  deletePond, getPond, updatePond, patchPond,
} = require("../controllers/pondController");

router.get("/all",      auth, getAllPonds);
router.post("/setup",   auth, setupPond);
router.post("/create",  auth, createPond);
router.patch("/:id",    auth, patchPond);
router.delete("/:id",   auth, requireRole("admin"), deletePond);  // admin only
router.get("/",         auth, getPond);
router.post("/",        auth, updatePond);

module.exports = router;