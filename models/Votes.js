const mongoose = require("mongoose");
const votesSchema = new mongoose.Schema(
    {
        createdAt: Date,
        updatedAt: Date,
        sourceId: mongoose.Schema.Types.ObjectId,
        userId:mongoose.Schema.Types.ObjectId,
        optionId:mongoose.Schema.Types.ObjectId,
    },
    { timestamps: true }
);

const Votes = mongoose.model("votes",votesSchema);

module.exports = Votes;
