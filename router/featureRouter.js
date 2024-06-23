const featureController = require("../controllers/featureController");
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
router
  .route("/")
  .post(
    authController.protect,
    authController.restrict("user"),
    featureController.create
  )
  .get(
    featureController.getAll
  );
router
  .route("/:id")
  .get(featureController.getOne)
  .delete(authController.protect,featureController.delete)
  .patch(authController.protect,featureController.update);
module.exports = router;
