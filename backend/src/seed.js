const mongoose = require("mongoose");
require("dotenv").config();

const Pond = require("./models/Pond");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Mongo connected");

  await Pond.deleteMany();

  await Pond.create({
    label: "Pond Alpha",
    size: 1200,
    density: 300,
    species: "Vannamei",
    location: "Farm 1"
  });

  console.log("Seeded pond");
  process.exit();
});
