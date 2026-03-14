const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let token;

    // Support "Bearer <token>" format (standard) AND raw token (legacy)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (authHeader) {
      token = authHeader; // backwards-compat with your existing raw-token usage
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired. Please login again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};