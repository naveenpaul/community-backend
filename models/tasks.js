
const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({
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
    color:String,
  }],
  startDate: Date,
  dueDate: Date,
  originalDueDate: Date,
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
    forInventory: {
      type: Boolean,
      default: false
    },
    inventoryId: String,
    list: [{
      name: String,
      completed: {
        type: Boolean,
        default: false
      },
      inventoryAction: {
        type: String,
        enum: ['purchased', 'consumed', 'returned']
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
  unitUpdate: {
    totalWork:
    {
      type: Number,
      default: 100,
    }  ,
    unit: {
      type: String,
      default: "",
    }
  },
  totalProgress: {
    unit: {
      type: String,
      default: ""
    },
    totalProgress: {
      type: Number,
      default: 0,
    },
    totalProgressPercentage: {
      type: Number,
      default: 0,
    }
  },
  progressUpdate: [{
    progress: Number,
    workDone:Number,
    date: Date,
    remark: String,
    unit: String,
    totalWork: Number,
    files: [
      {
        name: String,
        url: String,
        date: Date,
      }
    ],
  },]
}, { timestamps: true });

const Tasks = mongoose.model('tasks', tasksSchema);

module.exports = Tasks;