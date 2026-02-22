const { BaseError } = require("../errors/BaseError");

const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal Server Error" });
};

// ✅ Export the function directly, not an object
module.exports = errorHandler;
