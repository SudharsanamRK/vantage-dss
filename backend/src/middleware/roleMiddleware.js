// backend/src/middleware/roleMiddleware.js
// Usage: router.delete("/:id", auth, requireRole("admin"), deletePond);

module.exports = function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const User = require("../models/User");
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).json({ success: false, message: "User not found." });

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(" or ")}.`,
        });
      }
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
};