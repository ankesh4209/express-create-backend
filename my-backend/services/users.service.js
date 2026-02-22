const User = require("../models/user.model");
const { BadRequestError } = require("../errors/BadRequestError");
const { NotFoundError } = require("../errors/NotFoundError");
const { generateToken } = require("../utils/jwt.util");

const registerUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new BadRequestError("Email already exists");

  const user = await User.create(data);
  const token = generateToken(user._id);
  return { user, token };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new BadRequestError("Invalid credentials");

  const token = generateToken(user._id);
  return { user, token };
};

module.exports = { registerUser, loginUser };
