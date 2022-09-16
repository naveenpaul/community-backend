const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
  orgname:{
    type:String,
    required:true,
    unique:true
  },
  post:[],
  
  likes:[],

  comments:[],

  share:[],

  createdAt:{
    type:Date,
    default:Date.now,
  },
  updatedAt:{
    type:Date,
    default:Date.now,
  },
}, { timestamps: true });


const Post = mongoose.model('Post', postsSchema);

module.exports = Post;
