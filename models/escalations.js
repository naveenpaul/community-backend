
const mongoose = require('mongoose');

const escalationsSchema = new mongoose.Schema({
  teamId: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId,
  taskId: mongoose.Schema.Types.ObjectId,
  taskName: String,
  toUser: {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    fullName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String 
  },
  ownerEmailId: {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String 
  },
  subject: String,
  description: String,
  resolutionDate: Date,
  acknowledgement: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Open', 'InProgress', 'Close'],
    default: 'Open'
  }
}, { timestamps: true });

const Escalations = mongoose.model('escalations', escalationsSchema);

module.exports = Escalations;