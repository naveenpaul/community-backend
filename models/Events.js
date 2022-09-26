const mongoose = require("mongoose");
const memberSchema = new mongoose.Schema(
  {
    createdAt: Date,
    updatedAt: Date,
    commId: mongoose.Schema.Types.ObjectId,
    commName: String,
    name: String,
    description: String,
    location: String,
    startDate: Date,
    endDate: Date,
    address: {
      name: String,
      city: String,
      pincode: String,
      state: String,
      country: String,
    },
    type: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
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
const Members = mongoose.model("members", memberSchema);
module.exports = Members;
