const requestController = require("../controllers/requestController");
const interactionController=require('../controllers/interactionController')
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
router.use('/:requestId/vote',require('./interactionsRouter'))
router
  .route("/")
  .post(
    authController.protect,
    requestController.uploadRequestImages,
    requestController.resizeRequestImages,
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
