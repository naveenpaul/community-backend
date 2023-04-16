const mongoose = require("mongoose");

const MatrimonyUserSchema = new mongoose.Schema(
    {
        createdBy: mongoose.Schema.Types.ObjectId,
        name: String,
        // the location of the images will be _id/0, _id/1
        profilePicCount: Number,
        contactNumber: String,
        aboutme: String,
        dateOfBirth: Date,
        contactDetails: {
            emailId: String,
            address: {
                name: String,
                city: String,
                pincode: String,
                state: String,
                country: String,
            },
        },
        personalDetails: {
            placeOfBirth: String,
            rashi: String,
            nakshatra: String,
            height: Number,
            maritalStatus: String,
            motherTongue: String,
            caste: String,
            subCaste: String,
            gotra: String,
            manglik: String,
            education: String,
            collegeName: String,
            employedIn: String,
            organization: String,
            income: Number,
        },
        familyDetails: {
            fathersName: String,
            mothersName: String,
            fathersOccupation: String,
            mothersOccupation: String,
            brothers: Number,
            sisters: Number,
            brothersMarried: Number,
            sistersMarried: Number,
        },
    },
    { timestamps: true }
);

const matrimonyUser = mongoose.model("matrimonyUser", MatrimonyUserSchema);

module.exports = matrimonyUser;
