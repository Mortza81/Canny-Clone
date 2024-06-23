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
      required: [true, "Your comment should have a body text"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
commentSchema.index({ request: 1, user: 1 }, { unique: true });
commentSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name'
    })
})
const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
