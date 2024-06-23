const Comment = require("../models/commentModel");
const handlerFactory = require("./handlerFactory");
exports.create = handlerFactory.createOne(Comment);
exports.getAll = handlerFactory.getAll(Comment);
exports.update = handlerFactory.updateOne(Comment);
exports.delete = handlerFactory.deleteOne(Comment);
exports.getOne = handlerFactory.getOne(Comment);
