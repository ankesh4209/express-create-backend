const express = require("express");
const User = require("../models/user.model");
const { register, login } = require("../controllers/users.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // password excluded

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
