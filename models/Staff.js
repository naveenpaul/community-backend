const mongoose = require('mongoose');

const eventsSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true,
  },
  date:{
    type:Date,
  },
  picture:[],

  invite:[],
  
  createdAt:Date,
  updatedAt:Date,
}, { timestamps: true });


const Staff = mongoose.model('Staff', eventsSchema);

module.exports = Staff;
