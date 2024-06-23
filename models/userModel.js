const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema({
  name: {
    required: [true, "Name is requied"],
    type: String,
    maxlength: [20, "Name must have less or equal then 20 characters"],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Your email is not valid"],
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Your password should have more than 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Your password and your passwordconfirm are not match",
    },
  },
  changedPasswordAt: Date,
  role: {
    enum: ["admin", "user"],
    type: String,
    default: "user",
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});
const User = mongoose.model("User", userSchema);
module.exports = User;
