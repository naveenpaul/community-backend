const mongoose = require("mongoose");
const LikesSchema = new mongoose.Schema(
    {
        sourceId: mongoose.Schema.Types.ObjectId,
        source: ["EVENT", "POST", "COURSE"],
        // createdAt: Date,
        // updatedAt: Date,
        fullName: String,
        profilePicUrl: String,
        userId: mongoose.Schema.Types.ObjectId,
        date: Date,
    },
    { timestamps: true }
);
const Like = mongoose.model("likes", LikesSchema);
module.exports = Like;
