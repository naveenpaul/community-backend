const express = require("express");
const Router = express.Router();
const CommonUtility = require("../common/commonUtility");
const community = require("../controllers/community");
const userControl = require("../controllers/user");
const activityLog = require("../controllers/activityLogs");


const common = new CommonUtility();
const communityController = new community();
const userController = new userControl();
const activityLogController = new activityLog();

Router.post("/community/add", common.authorizeUser, handleAddCommunity);
Router.post("/community/get/all", common.authorizeUser, handleGetcommunities);
Router.get(
  "/community/:communityId",
  common.authorizeUser,
  handleGetCommunityById
);
Router.post("/community/remove", common.authorizeUser, handleRemovecommunity);
Router.post("/community/update", common.authorizeUser, handleUpdatecommunity);
Router.post("/community/add/staff", common.authorizeUser, handleAddStaff);
Router.post("/community/remove/staff", common.authorizeUser, handleRemoveStaff);
Router.post(
  "/community/get/all/staff",
  common.authorizeUser,
  handleGetAllStaff
);

function handleAddCommunity(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      communityController.addCommunity(
        req,
        res,
        existingUser,
        (communityErr, savedCommunity) => {
          if (communityErr || !savedCommunity) {
            return common.sendErrorResponse(
              res,
              "Error in saving community details"
            );
          }

          res.send({
            msg: "community saved successfully",
            community: savedCommunity,
          });

          activityLogController.insertLogs(
            {},
            savedCommunity._id,
            "community",
            "create",
            existingUser
          );
        }
      );
    }
  );
}

function handleGetcommunities(req, res) {
  const userId = common.getUserId(req) || "";
  communityController.getAllCommunity(req, res, userId);
}

function handleGetCommunityById(req, res) {
  const userId = common.getUserId(req) || "";
  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      return communityController.getCommunityById(req, res,(err,community)=>{
        if(err || !community){
          return common.sendErrorResponse(res,"Err in finding the community");
        }
        return res.send({
          data: community,
          msg: "Successfully fetched community",
        });
      });
    }
  );
}

function handleUpdatecommunity(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      communityController.updateCommunity(req, res, existingUser._id);
    }
  );
}
function handleRemovecommunity(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      communityController.removeCommunity(req, res, existingUser._id);
    }
  );
}

function handleAddStaff(req, res) {
  userController.findUserByQuery(
    {
      $or: [
        { emailId: req.body.emailId },
        { mobileNumber: req.body.mobileNumber },
      ],
    },
    {},
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      communityController.addStaff(req, res, existingUser);
    }
  );
}

function handleRemoveStaff(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      communityController.removeStaff(req, res, existingUser._id);
    }
  );
}
function handleGetAllStaff(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      communityController.getAllStaff(req, res, existingUser._id);
    }
  );
}

module.exports = Router;
