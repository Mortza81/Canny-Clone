const multer = require("multer");
const sharp = require("sharp");
const AppError = require("../utils/AppError");
const Request = require("../models/requestModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");

exports.create = handlerFactory.createOne(Request);
exports.getAll = handlerFactory.getAll(Request);
exports.update = handlerFactory.updateOne(Request);
exports.delete = handlerFactory.deleteOne(Request);
exports.getOne = handlerFactory.getOne(Request, { path: "comments" });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0].startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadRequestImages = upload.fields([{ name: "images", maxCount: 2 }]);
exports.resizeRequestImages = catchAsync(async (req, res, next) => {
  if (!req.files.images) return next();
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `request-${req.body.title}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/requests/${filename}`);
      req.body.images.push(filename);
    }),
  );
  next();
});
exports.setStatus = catchAsync(async (req, res, next) => {
  const request = await Request.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({
    status: "success",
    data: request,
  });
});
