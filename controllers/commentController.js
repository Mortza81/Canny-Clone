const Comment = require("../models/commentModel");
const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const handlerFactory = require("./handlerFactory");
exports.create = handlerFactory.createOne(Comment);
exports.getAll = handlerFactory.getAll(Comment);
exports.update = handlerFactory.updateOne(Comment);
exports.delete = handlerFactory.deleteOne(Comment);
exports.getOne = handlerFactory.getOne(Comment);
exports.setUserIdAndRequestId=catchAsync(async (req,res,next)=>{
  if(!req.body.user) req.body.user=req.user.id
  if(!req.body.request) req.body.request=req.params.requestId
  next()
})
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0].startsWith("image")) {
    cb(null, true);
  } else {
    cb(new appError("Not an image! Please upload only images.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadCommentImages = upload.fields([{ name: "images", maxCount: 2 }]);
exports.resizeCommentImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.images) return next();
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `request-${req.body.title}-${Date.now()}-${
        index + 1
      }.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/comments/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});
