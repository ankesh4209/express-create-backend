require("dotenv").config();

const requiredEnvVars = ["JWT_SECRET", "MONGO_URI"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  mongoURI: process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || "development",
};
