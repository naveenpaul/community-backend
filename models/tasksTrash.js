
const mongoose = require('mongoose');

const tasksTrashSchema = new mongoose.Schema({
  teamId: mongoose.Schema.Types.ObjectId,
  projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'projects'},
  sectionId: mongoose.Schema.Types.ObjectId,
  taskName: String,
  sectionName: String,
  members: [{
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String
  }],
  tags:[{
      name:String,
      color:String
  }],
  tartDate: Date,
  dueDate: Date,
  originalDueDate:Date,
  dueDatesRemark:[{
    previousDueDate:Date,
    dueDate:Date,
    remark:String
  }],
  description: String,
  dependsOnTaskName: String,
  dependsOn: String,
  attachments: [{
  fileName: String,
  uniqFileName: String,
  created: Date 
  }],
  completed: {
    type: Boolean,
    default: false
  },
  labels: [{
    labelName: String,
    color: String
  }],
  checklists: [{
    title: String,
    list: [{
      name: String,
      completed: {
        type: Boolean,
        default: false
      } 
    }]
  }],
  ownerEmailId: {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String 
  }, 
});

const TasksTrash = mongoose.model('tasksTrash', tasksTrashSchema);

module.exports = TasksTrash;