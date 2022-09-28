const mongoose = require('mongoose');
const CommentSchema = new mongoose.Schema(
    {
        contentId: mongoose.Schema.Types.ObjectId,
        type: ['EVENT', 'POST', 'COURSE'],
        fullName: String,
        profilePicUrl: String,
        memberId: mongoose.Schema.Types.ObjectId,
        date: Date,
        isStaff: Boolean,
    },
    { timestamps: true }
);
const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
