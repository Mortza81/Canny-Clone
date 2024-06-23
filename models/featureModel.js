const mongoose = require("mongoose");
const featureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    maxlength: [20, "Title must have less or equal then 20 characters"],
  },
  category: String,
  description: {
    type: String,
    required: [true, "Text is required"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "It must belongs to a user"],
  },
  images: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const Feature = mongoose.model("Feature", featureSchema);
module.exports = Feature;
