const catchAsync=require('../utils/catchAsync')
const APIFeatures = require('../utils/APIFeatures')
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id)
    res.status(201).json({
      status: 'success',
      data: null,
    })
  })
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    res.status(200).json({
      status: 'success',
      data: doc,
    })
  })
exports.createOne = (Model) =>
  catchAsync(async (req, res,next) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
      status: 'success',
      data: doc,
    })
  })
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    if (req.params.requestId) filter = { request: req.params.requestId }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort()
    const doc = await features.query
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data:[doc]
    })
  })
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (populateOptions) {
      query = query.populate(populateOptions)
    }
    const doc = await query
    res.status(200).json({
      status: 'success',
      data: doc,
    })
  })
