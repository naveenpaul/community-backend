const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema(
  {
    createdAt: Date,
    updatedAt: Date,
    cId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    cName: String,
    name: String,
    type: {
      type: String,
      enum: ["TEXT", "IMG", "VIDEO"],
    },
    likesCount: Number,
    commentsCount: Number,
  },
  { timestamps: true }
);

const Posts = mongoose.model("posts", postsSchema);

module.exports = Posts;
