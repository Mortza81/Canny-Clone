const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    request: {
      type: mongoose.Schema.ObjectId,
      ref: "Request",
    },
    body: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    images: [String],
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
commentSchema.index({ request: 1, user: 1 }, { unique: true });
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});
const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
