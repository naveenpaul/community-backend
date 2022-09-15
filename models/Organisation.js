const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  orgName:{
    type:String,
    required:true,
    unique:true
  },
  orgEmail:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  orgId:{
    type:Number,
    required:true,
    unique:true
  },
  address:{
    city:String,
    pincode:String,
    state:String,
    country:String
  },
  isAdmin:{
    type:Boolean,
    default:true,
  },
  orgType:{
    type:String,
  }
}, { timestamps: true });


const Organisation = mongoose.model('Organisation', organisationSchema);

module.exports = Organisation;
