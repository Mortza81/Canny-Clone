const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const handlerFactory = require("./handlerFactory");
const Interaction = require("../models/interactionModel");
exports.addInteraction = catchAsync(async (req, res, next) => {
  // تعیین target_type بر اساس وجود requestid یا commentid
  req.body.user = req.user.id;
  if (req.params.requestId) {
    req.body.target_type = "Request";
    req.body.target = req.params.requestId;
  } else if (req.params.commentId) {
    req.body.target_type = "Comment";
    req.body.target = req.params.commentId;
  }
  const interaction = await Interaction.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      interaction,
    },
  });
});
exports.deleteInteraction = catchAsync(async (req, res, next) => {
  let target;
  if (req.params.requestId) {
    target = req.params.requestId;
  } else if (req.params.commentId) {
    target = req.params.commentId;
  } else {
    return next(new appError("Invalid target ID", 400));
  }

  const interaction = await Interaction.findOne({
    user: req.user.id,
    target: target,
  });
  if (!interaction) {
    return next(new appError("You don't have an interaction", 404));
  }

  await Interaction.findByIdAndDelete(interaction.id);

  res.status(201).json({
    status: "success",
    data:'null'
  })
});
