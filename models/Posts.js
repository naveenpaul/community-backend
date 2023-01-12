const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema(
  {
    createdAt: Date,
    updatedAt: Date,
    cId: mongoose.Schema.Types.ObjectId,
    cName: String,
    name: String,
    text: String,
    thumbnail: String,
    poll: [
      {
        option: String,
        userId: [String],
      },
    ],
    type: {
      type: String,
      enum: ["TEXT", "IMG", "VIDEO", "POLL"],
    },
    likes: [
      {
        fullName: String,
        profilePicUrl: String,
        memberId: mongoose.Schema.Types.ObjectId,
        date: Date,
      },
    ],
    likesCount: Number,
    commentsCount: Number,
    userProfile: {
      userId: mongoose.Schema.Types.ObjectId,
      firstName: String,
      lastName: String,
      fullName: String,
      emailId: String,
      profilePicUrl: String,
    },
  },
  { timestamps: true }
);

const Posts = mongoose.model("posts", postsSchema);

module.exports = Posts;
