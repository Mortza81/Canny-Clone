const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/APIFeatures");
const AppError = require("../utils/AppError");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let query;
    if (req.user.role === "admin") {
      query = Model.findByIdAndDelete(req.params.id);
    } else {
      query = Model.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });
    }
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(
          "Data not found or you do not have the necessary permissions",
          404,
        ),
      );
    }
    res.status(201).json({
      status: "success",
      data: null,
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let query;
    if (req.user.role === "admin") {
      query = Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      query = Model.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user.id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );
    }
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(
          "Data not found or you do not have the necessary permissions",
          404,
        ),
      );
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter;
    if (req.params.requestId) filter = { request: req.params.requestId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort();
    const doc = await features.query;
    res.status(200).json({
      status: "success",
      result: doc.length,
      data: doc,
    });
  });
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
