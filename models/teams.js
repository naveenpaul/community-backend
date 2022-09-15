const mongoose = require('mongoose');

const teamsSchema = new mongoose.Schema({
  name: String,
  teamMembers: [{
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String,
    contractor: {
      type: Boolean, 
      default: false
    }
  }],
  templates: [{
    templateName: String,
    sections: [{
      name: String,
      tasks: []
    }]
  }],
  description: String,
  ownerEmailId: {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String 
  }
}, { timestamps: true });

const teams = mongoose.model('teams', teamsSchema);

module.exports = teams;


