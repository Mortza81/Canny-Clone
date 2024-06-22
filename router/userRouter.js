const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
router.get('/',userController.getAllusers);
router.patch('/updateMe',userController.updateMe)
router.delete('/deleteMe',userController.deleteMe)
router
  .route("/:id")
  .get(userController.getOneuser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);
module.exports = router;
