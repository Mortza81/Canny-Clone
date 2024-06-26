class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    if (`${statusCode}`.startsWith("4")) {
      this.status = "fail";
    } else {
      this.status = "error";
    }
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
