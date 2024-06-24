const multer = require("multer");
const AppError = require("../utils/AppError");

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
function handleMulterError(err) {
  let message;
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size is too large. Maximum size allowed is 5MB.";
  } else if (err.code === "LIMIT_FILE_COUNT") {
    message = "Maximum number of files exceeded. Only 10 files are allowed.";
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    message = `You can only upload two images.`;
  } else {
    message = "An error occurred during file upload.";
  }
  return new AppError(message, 400);
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

  if (process.env.NODE_ENV === "development") {
    errordevelopment(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
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
