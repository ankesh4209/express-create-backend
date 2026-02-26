const User = require("../models/user.model");
const { BadRequestError } = require("../errors/BadRequestError");
const { NotFoundError } = require("../errors/NotFoundError");
const { generateToken } = require("../utils/jwt.util");

const registerUser = async (data) => {
  // Normalize email
  const email = data.email.toLowerCase().trim();

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) throw new BadRequestError("Email already exists");

  // Create user
  const user = await User.create({ ...data, email });

  // Generate JWT token
  const token = generateToken(user._id);

  // Return user without password + token
  return { user: user.toJSON(), token };
};

const loginUser = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );
  if (!user) throw new NotFoundError("User not found");

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new BadRequestError("Invalid credentials");

  // Generate JWT
  const token = generateToken(user._id);

  // Return user without password + token
  return { user: user.toJSON(), token };
};

module.exports = { registerUser, loginUser };
