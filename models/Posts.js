const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema(
  {
    createdAt: Date,
    updatedAt: Date,
    orgId: mongoose.Schema.Types.ObjectId,
    orgName: String,
    name: String,
    type: {
      type: String,
      enum: ["TEXT", "IMG", "VIDEO"],
    },
    likes: [
      {
        fullName: String,
        profilePicUrl: String,
        memberId: mongoose.Schema.Types.ObjectId,
        date: Date,
      },
    ],
    comments: [
      {
        fullName: String,
        profilePicUrl: String,
        memberId: mongoose.Schema.Types.ObjectId,
        date: Date,
        isStaff: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const Posts = mongoose.model("posts", postsSchema);

module.exports = Posts;
