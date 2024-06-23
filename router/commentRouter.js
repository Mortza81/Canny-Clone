const express=require('express')
const commentController=require('../controllers/commentController')
const authController=require('../controllers/authController')
const router=express.Router()
router
  .route("/")
  .post(
    authController.protect,
    authController.restrict("user"),
    commentController.create
  )
  .get(
    commentController.getAll
  );
router
  .route("/:id")
  .get(commentController.getOne)
  .delete(authController.protect,commentController.delete)
  .patch(authController.protect,commentController.update);
module.exports=router