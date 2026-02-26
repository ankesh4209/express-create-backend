const logger = require("../config/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Store original res.json
  const oldJson = res.json;

  res.json = function (data) {
    // Log response here
    const duration = Date.now() - start;
    logger.info(
      JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        response: data, // actual response body
        responseTime: `${duration}ms`,
        ip: req.ip,
      }),
    );

    oldJson.apply(res, arguments); // call original res.json
  };

  // Handle errors
  res.on("error", (err) => {
    const duration = Date.now() - start;
    logger.error(
      JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        error: err.message,
        responseTime: `${duration}ms`,
        ip: req.ip,
      }),
    );
  });

  next();
};

module.exports = requestLogger;
