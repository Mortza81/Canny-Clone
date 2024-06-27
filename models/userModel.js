const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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
    validate: {
      validator: function (val) {
        return validator.isStrongPassword(val, {
          minLength: 8,
          minLowercase: 1,
          minNumbers: 1,
        });
      },
      message:
        "The password must be at least 8 characters long and contain at least one number.",
    },
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
  photo: {
    type: "String",
    default: "default.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  verified: {
    type: String,
    default: false,
  },
  verifyToken: String,
  verifyTokenExpires: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});
userSchema.index({ verifyTokenExpires: 1 }, { expireAfterSeconds: 0 });
userSchema.pre("find", async function (next) {
  this.find({ verified: { $ne: false } });
  next()
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  } else {
    next();
  }
});
userSchema.methods.correctPassword = async function (
  orgPassword,
  hashedPassword,
) {
  return await bcrypt.compare(orgPassword, hashedPassword);
};
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.changedPasswordAt = Date.now();
  next();
});
userSchema.methods.createResetTokenPassword = function () {
  const resetToken = crypto.randomBytes(12).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 1000 * 60;
  return resetToken;
};
userSchema.methods.createVerifyTokenPassword = function () {
  const token = crypto.randomBytes(6).toString("hex");
  this.verifyToken = crypto.createHash("sha256").update(token).digest("hex");
  this.verifyTokenExpires = Date.now() + 10 * 1000 * 60;
  return token;
};
userSchema.methods.changedPasswordAfter = function (jwtiat) {
  if (this.changedPasswordAt) {
    const passwordChanged = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10,
    );
    return passwordChanged > jwtiat;
  }
  return false;
};
userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
