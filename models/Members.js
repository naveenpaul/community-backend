const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    fullName: String,
    profilePicUrl: String,
    emailId: String,
    mobileNumber: String,
    createdAt: Date,
    updatedAt: Date,
    orgId: mongoose.Schema.Types.ObjectId,
    isApproved: Boolean,
    approvedBy: {
      emailId: String,
      fullName: String,
    },
    approvedDate: Date,
    joiningDate: Date,
    joiningRequestedDate: Date,
    lastActiveDate: Date,
  },
  { timestamps: true }
);

const Members = mongoose.model("members", memberSchema);

module.exports = Members;
