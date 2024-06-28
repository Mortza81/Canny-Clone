const { signup, login } = require("./authValidation");
const { createComment, updateComment } = require("./commentValdiation");
const AppError = require("../utils/AppError");
class Validation {
  validatecreateComment(req,res,next) {
    const { error } = createComment.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next()

  }
  validateupdateComment(req,res,next){
    const { error } = updateComment.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next()
  }
  validatesignup(req, res, next) {
    const { error } = signup.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next()
  }
  validateLogin(req,res,next){
    const { error } = login.validate(req.body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    next()
  }
}
module.exports = new Validation();
