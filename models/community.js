const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
    {
        name: String,
        address: {
            name:String,
            city: String,
            pincode: String,
            state: String,
            country: String,
        },
        createdAt: Date,
        updatedAt: Date,
        description: String,
        logo: String,
        backgroundImg: String,
        verified:{
            type:Boolean,
            default:true
        },
        staff: [
            {
                _id: mongoose.Schema.Types.ObjectId,
                firstName: String,
                lastName: String,
                emailId: String,
                mobileNumber: String,
                profilePicUrl: String,
                role: {
                    type: String,
                    enum: ['ADMIN', 'READ', 'WRITE'],
                },
            },
        ],
    },
    { timestamps: true }
);

const Community = mongoose.model('community', communitySchema);

module.exports = Community;
