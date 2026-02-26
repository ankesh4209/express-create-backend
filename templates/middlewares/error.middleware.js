const { BaseError } = require("../errors/BaseError");

const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log error (better than console.error in production)
  console.error(err);

  // ✅ Custom Application Errors
  if (err instanceof BaseError) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(isProduction ? {} : { stack: err.stack }),
    });
  }

  // ✅ JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // ✅ Mongo Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // ✅ Mongo Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // ✅ Final Response
  return res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
