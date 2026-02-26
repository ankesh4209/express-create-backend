const { registerUser, loginUser } = require("../services/users.service");

const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { register, login };
