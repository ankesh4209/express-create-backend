const { BaseError } = require("./BaseError");

class BadRequestError extends BaseError {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = { BadRequestError };
