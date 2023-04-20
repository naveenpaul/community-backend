const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const user = require("../controllers/user");
const filesControl= require("../controllers/files");
const filesController = new filesControl();
const common = new commonUtility();
const _ = require("lodash");
const async = require("async");
function Community() {}

Community.prototype.addCommunity = (req, res, liuDetails, callback) => {
  liuDetails.role = "ADMIN";
  if (!common.validateString(req.body.name)) {
    return common.sendErrorResponse(res, "Enter valid team name");
  }
  const files = req.files || [];
  console.log(files);
  const newCommunity = new community({
    name: req.body.name,
    address: {
      city: req.body.city,
      pincode: req.body.pincode,
      state: req.body.state,
      country: req.body.country,
    },
    description: req.body.description,
    logo: req.body.logo,
    backgroundImg: req.body.backgroundImg,
    verified:false,
    staff: [
      {
        _id: common.castToObjectId(common.getUserId(req)),
        firstName: liuDetails.firstName,
        lastName: liuDetails.lastName,
        emailId: liuDetails.emailId,
        mobileNumber: liuDetails.mobileNumber,
        profilePicUrl: liuDetails.profilePicUrl,
        role: "ADMIN",
      },
    ],
  });
  newCommunity.save((err,community)=>{
    async.each(
      files,
      function (file,callback) {
        const uploadObj = {
          fieldname:file.fieldname,
          source: "COMMUNITY",
          sourceId: community._id,
          type: filesController.extractTypeFromMimeType(file.mimetype),
          fileName: file.originalname,
          uniqFileName: file.originalname,
          tag: req.body.tag ? JSON.parse(req.body.tag) : {},
        };
        filesController.uploadFileCloud(
          file.path,
          uploadObj,
          res,
          callback
        );
      },
      function (err, results) {
       
        return res.send({
          msg: "Successfully saved file",
          data: results,
        });
      }
    );
  });
};

Community.prototype.getAllCommunity = (req, res, userId) => {
  const projection = req.body.projection || {};
  let query = {};
  if (req.body.isStaff) {
    query = {
      "staff._id": common.castToObjectId(userId),
      
    };
    //currently there are the communities without any value as verified , need to change when all communities has verified tag
    // console.log(req.body.verified)
    if(req.body.verified=='true'){
      query = {
        "staff._id": common.castToObjectId(userId),
        verified: {$not:{$eq:false}}
      };
    }
  }

  community
    .find(query, projection)
    .lean()
    .exec((err, data) => {
      if (err || !data) {
        return common.sendErrorResponse(res, "Error in getting Community");
      }
      return res.send({
        data: data,
        msg: "Successfully got all Communities",
        length: data.length,
      });
    });
};

Community.prototype.getCommunityById = (req, res, callback) => {
  community
    .findOne({ _id: common.castToObjectId(req.params.communityId) })
    .exec((err, data) => {
      if (callback) {
        return callback(err, data);
      } else {
        return res.send({
          data: data,
          msg: "Successfully fetched community",
        });
      }
    });
};

Community.prototype.updateCommunity = (req, res, id) => {
  const cId = common.castToObjectId(req.body.cId);

  if (!common.validateString(req.body.name)) {
    return common.sendErrorResponse(res, "Enter valid community name");
  }

  community.findOne(
    {
      _id: cId,
      "staff._id": id,
      $or: [{ "staff.role": "ADMIN" }, { "staff.role": "WRITER" }],
    },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }
      community.updateOne(
        { _id: cId },
        {
          $set: {
            name: req.body.name,
            address: {
              city: req.body.city,
              pincode: req.body.pincode,
              state: req.body.state,
              country: req.body.country,
            },
            description: req.body.description,
            logo: req.body.logo,
            backgroundImg: req.body.backgroundImg,
          },
        },
        (updateErr, updatedCommunity) => {
          if (updateErr || !updatedCommunity) {
            return common.sendErrorResponse(
              res,
              "failed to update the Community"
            );
          }
          res.send({ msg: "Successfully updated the community" });
        }
      );
    }
  );
};

Community.prototype.removeCommunity = (req, res, id) => {
  const cId = common.castToObjectId(req.body.cId);

  community.findOne(
    { _id: cId, "staff._id": id, "staff.role": "ADMIN" },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      community.deleteOne({ _id: cId }, (deleteErr, deleteCommunity) => {
        if (deleteErr || !deleteCommunity) {
          return common.sendErrorResponse(
            res,
            "Failed to delete the Community"
          );
        }
        return res.send({ msg: "Succcessfully removed the Community" });
      });
    }
  );
};

Community.prototype.addStaff = (req, res, user) => {
  community.findOne(
    {
      _id: common.castToObjectId(req.body.cId),
      "staff._id": common.castToObjectId(common.getUserId(req)),
    },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      community.updateOne(
        { _id: common.castToObjectId(req.body.cId) },
        { $push: { staff: user } },
        (updateErr, updateComm) => {
          if (updateErr || !updateComm) {
            return common.sendErrorResponse(res, "Failed to add sfaff");
          }

          return res.send({ msg: "Successfully updated the staff" });
        }
      );
    }
  );
};

Community.prototype.removeStaff = (req, res, id) => {
  const staffId = id;
  const cId = req.body.cId;

  community.findOne(
    { _id: cId, "staff._id": id, "staff.role": "ADMIN" },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      community.updateOne(
        { _id: cId },
        { $pull: { staff: { _id: id } } },
        (updateErr, updateComm) => {
          if (updateErr || !updateComm) {
            return common.sendErrorResponse(res, "Failed to remove sfaff");
          }

          return res.send({ msg: "Successfully removed the staff" });
        }
      );
    }
  );
};

Community.prototype.getAllStaff = (req, res, id) => {
  const projection = {};
  const cId = common.castToObjectId(req.body.cId);

  community.findOne(
    { _id: cId, "staff._id": id, "staff.role": "ADMIN" },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      community
        .find({ _id: cId }, projection)
        .lean()
        .exec((staffErr, existingCommunity) => {
          if (staffErr || !existingCommunity) {
            return common.sendErrorResponse(res, "Error in getting Staff");
          }

          return res.send({
            staff: existingCommunity[0].staff,
            msg: "Successfully got all the staff",
          });
        });
    }
  );
};
Community.prototype.getCommunityLogo=(sourceIds, callback)=>{
  community.find({
    _id:{ $in: sourceIds }
  })
  .lean()
    .exec(function (err, community) {
      callback(err, _.keyBy(community, "_id"));
    });

}
module.exports = Community;
