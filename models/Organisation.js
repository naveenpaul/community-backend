const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  address:{
    city:String,
    pincode:String,
    state:String,
    country:String
  },
  createdAt:Date,
  updatedAt:Date,
  isAdmin:{
    type:Boolean,
    default:true,
  },
  
}, { timestamps: true });


const Organisation = mongoose.model('Organisation', organisationSchema);

module.exports = Organisation;
