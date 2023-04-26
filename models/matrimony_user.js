const mongoose = require("mongoose");

const MatrimonyUserSchema = new mongoose.Schema(
  {
    createdBy: mongoose.Schema.Types.ObjectId,
    name: String,
    // the location of the images will be _id/0, _id/1
    profilePicCount: { type: Number, default: 0 },
    profilePic: {},
    thumbnail: [],
    contactNumber: String,
    aboutme: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["Male", "Female"], default: "Male" },
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
      height: { type: Number, default: 0 },
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
      income: { type: Number, default: 0 },
    },
    familyDetails: {
      fathersName: String,
      mothersName: String,
      fathersOccupation: String,
      mothersOccupation: String,
      brothers: { type: Number, default: 0 },
      sisters: { type: Number, default: 0 },
      brothersMarried: { type: Number, default: 0 },
      sistersMarried: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const matrimonyUser = mongoose.model("matrimonyUser", MatrimonyUserSchema);

module.exports = matrimonyUser;
