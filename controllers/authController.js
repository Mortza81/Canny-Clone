const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const signjwt = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
const createAndSendToken = (user, statusCode, res) => {
  const token = signjwt(user._id);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  try {
    const verifyToken = newUser.createVerifyTokenPassword();
    await newUser.save({ validateBeforeSave: false });
    const message = `please send patch request to ${
      req.protocol
    }://${req.get("host")}/api/v1/users/verify/${verifyToken}`;
    await new Email(newUser).send(
      message,
      "Your verify token(valid for 10 minutes)",
    );
    res.status(200).json({
      status: "success",
      message: "verify token sent to your email",
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser.id);
    return next(new AppError("there was a problem sending the email", 500));
  }
});
exports.verify = catchAsync(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("invalid or expired token", 400));
  }
  user.verified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });
  createAndSendToken(user, 200, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 404));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Wrong email or password", 401));
  }
  createAndSendToken(user, 200, res);
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("there is no user with this email", 401));
  }
  const resetToken = user.createResetTokenPassword();
  await user.save({ validateBeforeSave: false });
  const message = `please send patch request with your new password and passwordConfirm ${
    req.protocol
  }://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user).send(
      message,
      "Your reset Token(valid for 10 minutes)",
    );
    res.status(200).json({
      status: "success",
      message: "token sent to your email",
    });
  } catch (err) {
    user.passwordResetTokenExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("there was a problem sending the email", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("invalid or exired token", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  createAndSendToken(user, 200, res);
});
exports.restrict =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You don't have premission to this rout", 401));
    }
    next();
  };
exports.protect = catchAsync(async (req, res, next) => {
  // 1)checking if token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }
  // 2)verifying
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // we could just stop here but it's not safe
  // 3)check if user still exists
  // we might delete the user in between login and accessing
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("Your acount has been deleted", 401));
  }
  // 4)check that if user changed it's password or not
  if (user.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError(
        "You recently changed your password.please login again!",
        401,
      ),
    );
  }
  res.locals.user = user;
  req.user = user;
  next();
});
