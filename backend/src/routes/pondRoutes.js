const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");
const {
  getAllPonds, setupPond, createPond,
  deletePond, getPond, updatePond,
} = require("../controllers/pondController");

router.get("/all",      auth, getAllPonds);
router.post("/setup",   auth, setupPond);    
router.post("/create",  auth, createPond);  
router.delete("/:id",   auth, deletePond);
router.get("/",         auth, getPond);
router.post("/",        auth, updatePond);

module.exports = router;