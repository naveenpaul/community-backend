
const mongoose = require('mongoose');

const activityLogsSchema = new mongoose.Schema({
  sourceId: mongoose.Schema.Types.ObjectId,
  source: {
    type: String,
    enum: ['project', 'team', 'template', 'task', 'escalation', 'payment', 'inventory', 'userProfile', 'register', 'login']
  },
  action: {
    type: String,
    enum: ['create', 'read', 'update', 'delete']
  },
  date: {
    type: Date,
    default: new Date()
  },
  ownerEmailId: {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String 
  },
  propertyChanged: String
});

const ActivityLogs = mongoose.model('activityLogs', activityLogsSchema);

module.exports = ActivityLogs;