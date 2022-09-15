
const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    teamId:  mongoose.Schema.Types.ObjectId,
    projectId:  mongoose.Schema.Types.ObjectId,
    formId: mongoose.Schema.Types.ObjectId, //this response belongs to which form
    formName: String,
    formDescription: String,
    formCreatedDate: Date,
    submittedAt: {
        type: Date,
        default: Date.now
    }, 
    submittedBy:{
        _id: mongoose.Schema.Types.ObjectId,
        firstName: String,
        lastName: String,
        emailId: String,
        mobileNumber: String,
        profilePicUrl: String
    },
    fields: [{
        headline:String,
        questionTitle: String,
        questionDescription: String,
        options: [{
            title: String,
            isSelected: { type: Boolean, default: false },
        }],
        required: { type: Boolean, default: false },
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
        response: [{
          type: String,
        }],
        // if the question is of type fileUpload, then answer is the file url
        // list of answers will allow us to store answers for multiple correct choices, 
    }]
});
const assessment = mongoose.model('assessment', assessmentSchema);

module.exports = assessment;