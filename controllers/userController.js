const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const handlerFactory = require("./handlerFactory");
exports.getAllusers = handlerFactory.getAll(User);
exports.getOneuser = handlerFactory.getOne(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError('This route is not for changing password', 400))
  }
  const objFiltered = filterObj(req.body, 'email', 'name')
  objFiltered.photo = req.file.filename
  const user = await User.findByIdAndUpdate(req.user.id, objFiltered, {
    runValidators: true,
    new: true,
  })
  res.status(200).json({
    status: 'success',
    user,
  })
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    isActive: "false",
  });
  res.status(204).json({
    status:'success',
    data:'null'
  })
});
