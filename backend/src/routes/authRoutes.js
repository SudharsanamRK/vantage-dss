const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required." });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: "An account with this email already exists." });

    // Hash password with salt rounds = 12
    const hashed = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    // Explicitly select password (it's excluded by default via schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// ─── GET /api/auth/me — Verify token & return current user ───────────────────
router.get("/me", require("../middleware/authMiddleware"), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;