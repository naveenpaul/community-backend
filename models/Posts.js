const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema(
  {
    createdAt: Date,
    updatedAt: Date,
    commId: mongoose.Schema.Types.ObjectId,
    commName: String,
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
