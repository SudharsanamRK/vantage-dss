const express = require("express");
const router = express.Router();
const { analyzePond } = require("../services/farmBrain.service");

router.post("/analyze", (req, res) => {
  const result = analyzePond(req.body);
  res.json(result);
});

module.exports = router;
