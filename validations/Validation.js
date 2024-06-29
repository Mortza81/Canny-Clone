const { signup, login } = require("./authValidation");
const { createComment, updateComment } = require("./commentValdiation");
const {
  createRequest,
  updateRequest,
  setStatus,
} = require("./requestValidation");
const AppError = require("../utils/appError");

class Validation {
  validatecreateComment(req, res, next) {
    const { error } = createComment.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next();
  }

  validateupdateComment(req, res, next) {
    const { error } = updateComment.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next();
  }

  validatesignup(req, res, next) {
    const { error } = signup.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next();
  }

  validateLogin(req, res, next) {
    const { error } = login.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next();
  }

  validateupdateRequest(req, res, next) {
    const { error } = updateRequest.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next();
  }

  validateCreateRequest(req, res, next) {
    const { error } = createRequest.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next();
  }

  validateSetStatus(req, res, next) {
    const { error } = setStatus.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next();
  }
}
module.exports = new Validation();
