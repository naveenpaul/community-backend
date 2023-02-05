const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema(
    {
        createdAt: Date,
        updatedAt: Date,
        sourceType: { type: String, enum: ["POST", "COMMENT"] }, 
        sourceId: mongoose.Schema.Types.ObjectId,
        userId:mongoose.Schema.Types.ObjectId,
        message: String
    },
    { timestamps: true }
);

const Reports = mongoose.model("report", reportSchema);

module.exports = Reports;
