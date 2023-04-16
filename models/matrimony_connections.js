const mongoose = require("mongoose");
const MatrimonyConnections = new mongoose.Schema({
  ownerId:mongoose.Schema.Types.ObjectId,
  ownerName:String,
  receiverId:mongoose.Schema.Types.ObjectId,
  recieverName:String,
  status:{
    type:String,
    enum:["ACCEPTED","REJECTED","PENDING"],
    default:"PENDING"
  },
  createdAt: Date,
  updatedAt: Date,
});

const matrimonyConnections = mongoose.model("matrimonyConnections", MatrimonyConnections);

module.exports = matrimonyConnections;
