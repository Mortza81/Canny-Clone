const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [20, "Title must have less or equal then 20 characters"],
    },
    status: {
      enum: {
        values: ["in progress", "planned", "under review"],
        message: "status must be either: in progress, planned or review.",
      },
      type: String,
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
    votes: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
requestSchema.virtual("reviews", {
  ref: "Comment",
  foreignField: "request",
  localField: "_id",
});
requestSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});
const Request = mongoose.model("request", requestSchema);
module.exports = Request;
