const express = require("express");
const commentController = require("../controllers/commentController");
const interactionController = require("../controllers/interactionController");
const authController = require("../controllers/authController");
const Validation = require("../validations/Validation");

const router = express.Router({ mergeParams: true });
router.use("/:commentId/like", require("./interactionsRouter"));

router
  .route("/")
  .post(
    authController.protect,
    commentController.uploadCommentImages,
    commentController.resizeCommentImages,
    commentController.setUserIdAndRequestId,
    Validation.validatecreateComment,
    commentController.create,
  )
  .get(commentController.getAll);
router
  .route("/:id")
  .get(commentController.getOne)
  .delete(authController.protect, commentController.delete)
  .patch(
    authController.protect,
    commentController.uploadCommentImages,
    commentController.resizeCommentImages,
    Validation.validateupdateComment,
    commentController.update,
  );
module.exports = router;
