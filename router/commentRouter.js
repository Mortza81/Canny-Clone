const express=require('express')
const commentController=require('../controllers/commentController')
const interactionController=require('../controllers/interactionController')
const authController=require('../controllers/authController')
const router=express.Router()
router.use('/:commentId/like',require('./interactionsRouter'))
router
  .route("/")
  .post(
    authController.protect,
    commentController.uploadCommentImages,
    commentController.resizeCommentImages
    ,commentController.create
  )
  .get(
    commentController.getAll
  );
router
  .route("/:id")
  .get(commentController.getOne)
  .delete(authController.protect,commentController.delete)
  .patch(authController.protect,commentController.update);
router.post('/:commentId/like',authController.protect,interactionController.addInteraction)
router.delete('/:commentId/like',authController.protect,interactionController.deleteInteraction)
module.exports=router