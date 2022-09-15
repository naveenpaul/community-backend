
const mongoose = require('mongoose');

const paymentsSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  teamId: mongoose.Schema.Types.ObjectId,
  paymentTo: {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    fullName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String 
  },
  paymentBy: {
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
  invoiceNumber: String,
  comment: String,
  taskId: mongoose.Schema.Types.ObjectId,
  taskName: String,
  date: Date,
}, { timestamps: true });

const Payments = mongoose.model('payments', paymentsSchema);

module.exports = Payments;