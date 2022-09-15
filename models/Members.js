const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  memberName:{
    type:String,
    required:true,
    unique:true
  },
  memberEmail:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  memberId:{
    type:Number,
    required:true,
    unique:true
  },
  address:[
    {city:String},
    {pincode:String},
    {state:String},
    {country:String}
  ],
}, { timestamps: true });


const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
