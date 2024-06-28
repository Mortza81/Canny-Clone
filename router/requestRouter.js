const express = require("express");
const requestController = require("../controllers/requestController");
const authController = require("../controllers/authController");
const Validation = require("../validations/Validation");

const router = express.Router();
router.use("/:requestId/vote", require("./interactionsRouter"));
router.use("/:requestId/comments", require("./commentRouter"));

router
  .route("/")
  .post(
    authController.protect,
    requestController.uploadRequestImages,
    requestController.resizeRequestImages,
    requestController.setUserId,
    Validation.validateCreateRequest,
    requestController.create,
  )
  .get(requestController.getAll);
router
  .route("/:id")
  .get(requestController.getOne)
  .delete(authController.protect, requestController.delete)
  .patch(
    authController.protect,
    Validation.validateupdateRequest,
    requestController.update,
  );
router.patch(
  "/setStatus/:id",
  authController.protect,
  authController.restrict("admin"),
  Validation.validateSetStatus,
  requestController.setStatus,
);
module.exports = router;
