const mongoose = require('mongoose');

const templatesSchema = new mongoose.Schema({
  teamId: mongoose.Schema.Types.ObjectId,
  templateName: String,
  sections: [{
    name: String,
    tasks: []
  }],
  ownerEmailId: {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNumber: String,
    profilePicUrl: String 
  }
}, { timestamps: true });

const Templates = mongoose.model('templates', templatesSchema);

module.exports = Templates;
