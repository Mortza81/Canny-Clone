const mongoose = require("mongoose");
const Request = require("./requestModel");
const Comment = require("./commentModel");

const interactionSchema = new mongoose.Schema({
  target_type: {
    required: [true, "Type of interaction is required"],
    type: String,
    enum: {
      values: ["Request", "Comment"],
      message: "type must be vote or like",
    },
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
  target: {
    type: mongoose.Schema.ObjectId,
    refPath: "target_type",
  },
});
interactionSchema.statics.calcNum = async function (targetId, type) {
  // this refers to current Model
  const stats = await this.aggregate([
    {
      $match: { target: targetId },
    },
    {
      $group: {
        _id: "$target",
        sum: { $sum: 1 },
      },
    },
  ]);
  if (type === "Request") {
    if (stats.length > 0) {
      await Request.findByIdAndUpdate(targetId, {
        votes: stats[0].sum,
      });
    } else {
      await Request.findByIdAndUpdate(targetId, {
        votes: 0,
      });
    }
  } else if (stats.length > 0) {
    await Comment.findByIdAndUpdate(targetId, {
      likes: stats[0].sum,
    });
  } else {
    await Comment.findByIdAndUpdate(targetId, {
      likes: 0,
    });
  }
};
interactionSchema.index({ user: 1, target: 1 }, { unique: true });
interactionSchema.post("save", async function () {
  this.constructor.calcNum(this.target, this.target_type);
});
interactionSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  // console.log(this.r);
  next();
});

interactionSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  this.r.constructor.calcNum(this.r.target, this.r.target_type);
});
const Interaction = mongoose.model("Interaction", interactionSchema);
module.exports = Interaction;
