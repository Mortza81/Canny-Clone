const express = require("express");
const interactionController = require("../controllers/interactionController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });
router.post("/", authController.protect, interactionController.addInteraction);
router.delete(
  "/",
  authController.protect,
  interactionController.deleteInteraction,
);
router.get(
  "/likes",
  authController.protect,
  authController.restrict("admin"),
  interactionController.getAllLikes,
);
router
  .route("/likes/:id")
  .get(
    authController.protect,
    authController.restrict("admin"),
    interactionController.getOneLike,
  )
  .delete(
    authController.protect,
    authController.restrict("admin"),
    interactionController.deleteLike,
  );
router.get(
  "/votes",
  authController.protect,
  authController.restrict("admin"),
  interactionController.getAllvotes,
);
router
  .route("/votes/:id")
  .get(
    authController.protect,
    authController.restrict("admin"),
    interactionController.getOneVote,
  )
  .delete(
    authController.protect,
    authController.restrict("admin"),
    interactionController.deleteVote,
  );
module.exports = router;
