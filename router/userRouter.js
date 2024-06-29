const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const authController = require("../controllers/authController");
const Validation=require('../validations/Validation')

router.get(
  "/",
  authController.protect,
  authController.restrict("admin"),
  userController.getAllusers,
);
router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  authController.protect,
  userController.updateMe,
);
router.delete("/deleteMe", authController.protect, userController.deleteMe);
router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrict("admin"),
    userController.getOneuser,
  )
  .delete(
    authController.protect,
    authController.restrict("admin"),
    userController.deleteUser,
  )
  .patch(
    authController.protect,
    authController.restrict("admin"),
    userController.updateUser,
  );
router.post("/signup", Validation.validatesignup,authController.signup);
router.post("/login", Validation.validateLogin,authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch("/verify/:", authController.verify);
module.exports = router;
