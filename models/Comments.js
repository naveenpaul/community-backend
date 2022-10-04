const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema(
    {
        sourceId: mongoose.Schema.Types.ObjectId,
        source: ["EVENT", "POST", "COURSE"],
        fullName: String,
        profilePicUrl: String,
        userId: mongoose.Schema.Types.ObjectId,
        date: Date,
        isStaff: Boolean,
    },
    { timestamps: true }
);
const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;
