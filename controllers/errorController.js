const multer = require("multer");
const AppError = require("../utils/appError");

function errorproduction(err, req, res) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.log(err);
  return res.status(err.statusCode).json({
    status: "error",
    message: "Somthing went wrong!",
  });
}
function errordevelopment(err, req, res) {
  res.status(err.statusCode).json({
    message: err.message,
    stack: err.stack,
    error: err,
  });
}

function handleCastError(err) {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 404);
}
function handleDuplicateError(err) {
  const value = err.message.match(/"(.*?)"/)[1];
  return new AppError(
    `Duplicated field, value: ${value}, use another value`,
    400,
  );
}
function handleValidationError(err) {
  let errorsString = "";
  Object.values(err.errors).forEach((el) => {
    errorsString += `.${el.message}`;
  });
  return new AppError(`Invalid input data: ${errorsString}`, 400);
}
const hendleJWTError = () => new AppError("Invalid token!.please login.", 401);
const handleJWTExpiredError = () =>
  new AppError("Your token has expired.please login again.", 401);
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development" ) {
    errordevelopment(err, req, res);
  } else if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    if (err.name === "CastError") {
      err = handleCastError(err);
    }
    if (err.code === 11000) {
      err = handleDuplicateError(err);
    }
    if (err.name === "ValidationError") {
      err = handleValidationError(err);
    }
    if (err.name === "JsonWebTokenError") {
      err = hendleJWTError();
    }
    if (err.name === "TokenExpiredError") {
      err = handleJWTExpiredError();
    }
    if (err instanceof multer.MulterError) {
      err = handleMulterError(err);
    }
    errorproduction(err, req, res);
  }
};
