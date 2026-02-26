const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @param {string} expiresIn - Expiration time (default 7d)
 * @returns {string} JWT token
 */
const generateToken = (id, expiresIn = "7d") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
