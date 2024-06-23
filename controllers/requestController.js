const Request = require("../models/requestModel");
const handlerFactory = require("./handlerFactory");
exports.create = handlerFactory.createOne(Request);
exports.getAll = handlerFactory.getAll(Request);
exports.update = handlerFactory.updateOne(Request);
exports.delete = handlerFactory.deleteOne(Request);
exports.getOne = handlerFactory.getOne(Request);
