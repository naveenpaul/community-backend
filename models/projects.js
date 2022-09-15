
const mongoose = require('mongoose');

const projectsSchema = new mongoose.Schema({
  teamId: mongoose.Schema.Types.ObjectId,
  projectName: String,
  description: String,
  teamMembers: [{
    emailId: String,
    firstName: String,
    viewOnly: {
      type: Boolean,
      default: false
    },
    lastName: String,
    profilePicUrl: String,
  }],
  sections: [{
      name: String,
      tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'tasks'}]
  }],
  tags:[{
      name:String,
      color:String
  }],
  ownerEmailId: {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String 
  },
  city: String,
  state: String,
  country: String,
  startDate: Date,
  endDate: Date
}, { timestamps: true });

const projects = mongoose.model('projects', projectsSchema);

module.exports = projects;