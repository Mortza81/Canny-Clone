const requestController = require("../controllers/requestController");
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
router
  .route("/")
  .post(
    authController.protect,
    authController.restrict("user"),
    requestController.create
  )
  .get(
    requestController.getAll
  );
router
  .route("/:id")
  .get(requestController.getOne)
  .delete(authController.protect,requestController.delete)
  .patch(authController.protect,requestController.update);
module.exports = router;
