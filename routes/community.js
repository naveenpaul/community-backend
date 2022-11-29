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

Router.post("/community/add", common.authorizeUser, handleAddcommunity);
Router.post("/community/get/all", common.authorizeUser, handleGetcommunity);
// Router.post("/community/get/",common.authorizeUser,handleGetCommunityById);
Router.post("/community/remove", common.authorizeUser, handleRemovecommunity);
Router.post("/community/update", common.authorizeUser, handleUpdatecommunity);
Router.post("/community/add/staff", common.authorizeUser, handleAddStaff);
Router.post("/community/remove/staff", common.authorizeUser, handleRemoveStaff);
Router.post("/community/get/all/staff", common.authorizeUser, handleGetAllStaff);

function handleAddcommunity(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), common.getUserDetailsFields(), (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        communityController.addCommunity(req, res, existingUser, (communityErr, savedCommunity) => {
            if (communityErr || !savedCommunity) {
                return common.sendErrorResponse(res, "Error in saving community details");
            }

            res.send({
                msg: "community saved successfully",
                community: savedCommunity,
            });

            activityLogController.insertLogs({}, savedCommunity._id, "community", "create", existingUser);
        });
    });
}

function handleGetcommunity(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { _id:1,emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }
        communityController.getAllCommunity(req, res,existingUser._id);
    });
}

function handleUpdatecommunity(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        communityController.updateCommunity(req, res, existingUser._id);
    });
}
function handleRemovecommunity(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        communityController.removeCommunity(req, res, existingUser._id);
    });
}

function handleAddStaff(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        communityController.addStaff(req, res, existingUser._id);
    });
}

function handleRemoveStaff(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        communityController.removeStaff(req, res, existingUser._id);
    });
}
function handleGetAllStaff(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        communityController.getAllStaff(req, res, existingUser._id);
    });
}

module.exports = Router;
