const featureController = require("../controllers/featureController");
const express = require("express");
const router = express.Router();
router.route("/").post(featureController.create).get(featureController.getAll);
router
  .route("/:id")
  .get(featureController.getOne)
  .delete(featureController.delete)
  .patch(featureController.update);
module.exports = router;
