const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const authController=require('../controllers/authController')
router.get("/", userController.getAllusers);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
router
  .route("/:id")
  .get(userController.getOneuser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);
router.post("/signup",authController.signup);
module.exports = router;
