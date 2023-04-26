const mongoose = require("mongoose");
const MatrimonyConnections = new mongoose.Schema(
  {
    ownerId: mongoose.Schema.Types.ObjectId,
    ownerName: String,
    ownerContact:String,
    receiverId: mongoose.Schema.Types.ObjectId,
    receiverName: String,
    receiverContact:String,
    status: {
      type: String,
      enum: ["ACCEPTED", "REJECTED", "PENDING"],
      default: "PENDING",
    },
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

const matrimonyConnections = mongoose.model("matrimonyConnections", MatrimonyConnections);

module.exports = matrimonyConnections;
