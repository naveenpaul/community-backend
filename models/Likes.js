const mongoose = require('mongoose');
const LikesSchema = new mongoose.Schema(
    {
        contentId: mongoose.Schema.Types.ObjectId,
        type: ['EVENT', 'POST', 'COURSE'],
        // createdAt: Date,
        // updatedAt: Date,
        fullName: String,
        profilePicUrl: String,
        memberId: mongoose.Schema.Types.ObjectId,
        date: Date,
    },
    { timestamps: true }
);
const Like = mongoose.model('likes', LikesSchema);
module.exports = Like;
