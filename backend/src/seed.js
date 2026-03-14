require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Pond = require("./models/Pond");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Mongo connected");

  // ── 1. Seed Admin User FIRST ───────────────────────────
  const hashed = await bcrypt.hash("Admin@1234", 12);
  const admin = await User.findOneAndUpdate(
    { email: "admin@fathom.com" },
    { name: "Admin", email: "admin@fathom.com", password: hashed, role: "admin" },
    { upsert: true, new: true }
  );
  console.log("✅ Admin seeded: admin@fathom.com / Admin@1234");

  // ── 2. Seed Pond with admin's userId ──────────────────
  await Pond.deleteMany();
  await Pond.create({
    label: "Pond Alpha",
    size: 1200,
    density: 300,
    species: "Vannamei",
    location: "Farm 1",
    userId: admin._id        
  });
  console.log("✅ Pond seeded");

  process.exit();
});