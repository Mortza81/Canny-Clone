const requestController = require("../controllers/requestController");
const interactionController=require('../controllers/interactionController')
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
router.post('/:requestId/vote',authController.protect,interactionController.addInteraction)
router.delete('/:requestId/vote',authController.protect,interactionController.deleteInteraction)
module.exports = router;
