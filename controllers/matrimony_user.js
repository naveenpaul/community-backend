const matrimonyUser = require("../models/matrimony_user");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

function MatrimonyUser() {}
MatrimonyUser.prototype.addUser = (req, res, callback) => {
  console.log(req.body);
  const newUser = new matrimonyUser({
    createdBy: common.getUserId(req),
    name: req.body.name,
    profilePicCount: 0,
    contactNumber: req.body.contactNumber,
    aboutme: req.body.aboutme,
    dateOfBirth: req.body.dateOfBirth,
    contactDetails: req.body.contactDetails,
    personalDetails: req.body.personalDetails,
    // {
    //     placeOfBirth:req.body.personalDetails.placeOfBirth,
    //     rashi:req.body.personalDetails.rashi,
    //     nakshatra: req.body.personalDetails.nakshatra,
    //     height:req.body.personalDetails.height,
    //     maritalStatus:req.body.personalDetails.maritalStatus,
    //     motherTongue:req.body.personalDetails.motherTongue,
    //     caste: req.body.personalDetails.caste,
    //     subCaste: req.body.personalDetails.subCaste,
    //     gotra: req.body.personalDetails.gotra,
    //     manglik: req.body.personalDetails.manglik,
    //     education: req.body.personalDetails.education,
    //     collegeName: req.body.personalDetails.collegeName,
    //     employedIn: req.body.personalDetails.employedIn,
    //     organization: req.body.personalDetails.organization,
    //     income:req.body.personalDetails.income,
    // },
    familyDetails: req.body.familyDetails,
    // {
    //     fathersName: String,
    //     mothersName: String,
    //     fathersOccupation: String,
    //     mothersOccupation: String,
    //     brothers: Number,
    //     sisters: Number,
    //     brothersMarried: Number,
    //     sistersMarried: Number,
    // },
  });
  newUser.save(callback);
};
MatrimonyUser.prototype.getUserById = (req, res, callback) => {
  matrimonyUser.findOne({ _id: req.params.userId }, callback);
};

MatrimonyUser.prototype.updateUserDetails = (req, res, callback) => {
  console.log(req.body);
  var updateOptions = {
    name: req.body.name,
    contactNumber: req.body.contactNumber,
    aboutme: req.body.aboutme,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
  };
  if (req.body.personalDetails) updateOptions["personalDetails"] = req.body.personalDetails;
  if (req.body.contactDetails) updateOptions["contactDetails"] = req.body.contactDetails;
  if (req.body.familyDetails) updateOptions["familyDetails"] = req.body.familyDetails;

  matrimonyUser
    .updateOne(
      { _id: req.body.id, ownerId: common.getUserId(req) },
      {
        $set: {
          ...updateOptions,
        },
      }
    )
    .exec(callback);
};

MatrimonyUser.prototype.getUserFeed = (req, res, callback) => {
  let pageNumber = parseInt(req.params.pageNumber);
  const limit = 10;
  const offset = (pageNumber - 1) * limit;
  console.log(pageNumber);
  matrimonyUser
    .find({ createdAt: { $lt: new Date() } })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean()
    .exec((err, data) => {
      //dont send all the data
      const filteredData = data.map((e) => {
        return {
          ...e,
          contactNumber: null,
          personalDetails: null,
          familyDetails: null,
        };
      });
      return callback(err, filteredData);
    });
};

MatrimonyUser.prototype.getUserByOwnerId = (req, res, callback) => {
  //we have considered 1 matrimony user per user
  matrimonyUser.findOne({ ownerId: common.getUserId(req) }, (err, user) => {
    return callback(err, user);
  });
};

MatrimonyUser.prototype.getUserById = (req, res, callback) => {
  //get user to by using its id remove the private data
  matrimonyUser
    .findOne({ _id: common.castToObjectId(req.query.id) })
    .lean()
    .exec((err, user) => {
      filtered = {
        ...user,
        contactNumber: null,
        personalDetails: null,
        familyDetails: null,
      };
      return callback(err, filtered);
    });
};

MatrimonyUser.prototype.removeImage = (userId, deletedIds, res, callback) => {
  if (deletedIds == null) return callback(null, {});
  const fileIds = deletedIds.map((e) => common.castToObjectId(e));
  //only 1 matrimony profile per boundlses user
  matrimonyUser
    .updateOne(
      { _id: userId },
      {
        $pull: { thumbnail: { sourceId: { $in: fileIds } } },
      }
    )
    .exec(callback);
};
MatrimonyUser.prototype.getUserContactNumber = (req, callback) => {
  const id = common.castToObjectId(req.body.receiverId);
  matrimonyUser.find({ _id: id }, { contactNumber: 1 }, callback);
};
module.exports = MatrimonyUser;
