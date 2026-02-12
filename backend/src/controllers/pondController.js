const Pond = require("../models/Pond");

exports.getPond = async (req, res) => {
  let pond = await Pond.findOne();

  if (!pond) {
    pond = await Pond.create({});
  }

  res.json(pond);
};

exports.updatePond = async (req, res) => {
  let pond = await Pond.findOne();

  if (!pond) {
    pond = await Pond.create(req.body);
  } else {
    Object.assign(pond, req.body);
    await pond.save();
  }

  res.json(pond);
};
