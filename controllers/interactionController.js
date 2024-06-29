const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Interaction = require("../models/interactionModel");

exports.addInteraction = catchAsync(async (req, res, next) => {
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
    return next(new AppError("Invalid target ID", 400));
  }

  const interaction = await Interaction.findOne({
    user: req.user.id,
    target: target,
  });
  if (!interaction) {
    return next(new AppError("You don't have an interaction", 404));
  }

  await Interaction.findByIdAndDelete(interaction.id);

  res.status(200).json({
    status: "success",
    data: "null",
  });
});
exports.getAllLikes = catchAsync(async (req, res, next) => {
  let filter={target_type: "Comment"}
  if(req.params.commentId){
    filter.target=req.params.commentId
  }
  const likes = await Interaction.find(filter);
  res.status(200).json({
    status: "success",
    data: likes,
  });
});
exports.getAllvotes = catchAsync(async (req, res, next) => {
  let filter={target_type: "Request"}
  if(req.params.requestId){
    filter.target=req.params.requestId
  }
  const votes = await Interaction.find(filter);
  res.status(200).json({
    status: "success",
    data: votes,
  });
});
exports.getOneLike = catchAsync(async (req, res, next) => {
  const likes = await Interaction.find({
    _id: req.params.id,
    target_type: "Comment",
  });
  res.status(200).json({
    status: "success",
    data: likes,
  });
});
exports.getOneVote = catchAsync(async (req, res, next) => {
  const likes = await Interaction.find({
    _id: req.params.id,
    target_type: "Request",
  });
  res.status(200).json({
    status: "success",
    data: likes,
  });
});
exports.deleteVote = catchAsync(async (req, res, next) => {
  const vote = await Interaction.findById(req.params.id);
  if (!vote) {
    return next(new AppError("There is no vote with this Id"));
  }
  await Interaction.findByIdAndDelete(vote.id);
  res.status(200).json({
    status: "success",
    data: "null",
  });
});
exports.deleteLike = catchAsync(async (req, res, next) => {
  const like = await Interaction.findById(req.params.id);
  if (!like) {
    return next(new AppError("There is no like with this Id"));
  }
  await Interaction.findByIdAndDelete(like.id);
  res.status(200).json({
    status: "success",
    data: "null",
  });
});
