const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({

    name: String,
    description: String,
    createdDate: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    teamId:  mongoose.Schema.Types.ObjectId,
    owner: {
        _id: mongoose.Schema.Types.ObjectId,
        firstName: String,
        lastName: String,
        emailId: String,
        mobileNumber: Number,
        profilePicUrl: String,
    },
    sharedWith: [{
        _id: mongoose.Schema.Types.ObjectId,
        firstName: String,
        lastName: String,
        emailId: String,
        mobileNumber: String,
        profilePicUrl: String
    }],
    fields: [{
        headline:String,
        title: String,
        description:String,
        type: {
         type:String,
         enum:['shortAnswer', 'checklist', 'fileUpload', 'dropdown', 'paragraph','dateTime','radio','table','heading'],
        },
        table: {
            totalColumns: {
                type: Number,
                default: 0
            },
            columnHeaders: [{
                    title: String,
            }],  
            rows: [{
                columns: [{ 
                    content: String,
                    editable: { type: Boolean, default: true },
                }],
            }]
        },
        options: [{
            title: String,
            isSelected: { type: Boolean, default: false },
        }], // it will be use to store options if question type is dropdown or checklist
        required: { type: Boolean, default: false },
    }]
});

const form = mongoose.model('form', formSchema);

module.exports = form;