const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { UnauthorizedError } = require("../errors/UnauthorizedError");
const { NotFoundError } = require("../errors/NotFoundError");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new NotFoundError("User not found.");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid token."));
    }
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token expired."));
    }
    return next(error);
  }
};

module.exports = { authMiddleware };
