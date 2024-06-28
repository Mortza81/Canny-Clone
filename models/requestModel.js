const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    status: {
      type: String,
    },
    category: String,
    description: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
requestSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "request",
  localField: "_id",
});
requestSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});
const Request = mongoose.model("request", requestSchema);
module.exports = Request;
