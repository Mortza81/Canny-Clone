const User = require("../models/userModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
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
const signjwt = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createAndSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new appError("Please provide email and password!", 404));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("Wrong email or password", 401));
  }
  createAndSendToken(user, 200, res);
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError("there is no user with this email", 401));
  }
  const resetToken = user.createResetTokenPassword();
  await user.save({ validateBeforeSave: false });
  const message = `please send patch request with your new password and passwordConfirm ${
    req.protocol
  }://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  try {
    // await email({
    //   email: user.email,
    //   subject: 'Your reset Token(valid for 10 minutes)',
    //   message,
    // })
    await new Email(user).send(
      message,
      "Your reset Token(valid for 10 minutes)"
    );
    res.status(200).json({
      status: "success",
      message: "token sent to your email",
    });
  } catch (err) {
    user.passwordResetTokenExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new appError("there was a problem sending the email", 500));
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
    return next(new appError("invalid or exired token", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  createAndSendToken(user, 200, res);
});
exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError("You don't have premission to this rout", 401));
    }
    next();
  };
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
      new appError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2)verifying
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // we could just stop here but it's not safe
  // 3)check if user still exists
  // we might delete the user in between login and accessing
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new appError("Your acount has been deleted", 401));
  }
  // 4)check that if user changed it's password or not
  if (user.changedPasswordAfter(decoded.iat)) {
    next(
      new appError(
        "You recently changed your password.please login again!",
        401
      )
    );
  }
  res.locals.user = user;
  req.user = user;
  next();
});
