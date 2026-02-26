const mongoose = require("mongoose");
const config = require("./env");
const logger = require("./logger");

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed", {
      message: error.message,
    });

    process.exit(1); // Exit if DB connection fails
  }
};

module.exports = connectDB;
