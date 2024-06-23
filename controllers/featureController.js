const Feature = require("../models/featureModel");
const handlerFactory = require("../controllers/handlerFactory");
exports.create = handlerFactory.createOne(Feature);
exports.getAll = handlerFactory.getAll(Feature);
exports.update = handlerFactory.updateOne(Feature);
exports.delete = handlerFactory.deleteOne(Feature);
exports.getOne = handlerFactory.getOne(Feature);
