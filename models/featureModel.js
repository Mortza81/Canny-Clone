const mongoose = require("mongoose");
const featureSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Text is required"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "It must belongs to a user"],
  },
  images: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const Feature = mongoose.model("Feature");
module.exports = Feature;
