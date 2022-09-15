const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
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
}, { timestamps: true });


const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
