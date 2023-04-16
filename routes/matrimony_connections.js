const express = require("express");
const CommonUtility = require("../common/commonUtility");
const MatrimonyConnections = require("../controllers/matrimony_connections");
const matrimonyUser = require("../controllers/matrimony_user");
const Router = express.Router();
const userControl = require("../controllers/user");
const notificationControl = require("../controllers/notification-service");

const notificationController = new notificationControl();
const common = new CommonUtility();
const matrimonyConnections = require("../models/matrimony_connections");
const userController = new userControl();
const MatrimonyConnectionsController = new MatrimonyConnections();
const matrimonyUserController = new matrimonyUser();

Router.post("/matrimony/connection/add", common.authorizeUser, handleAddConnection);
Router.post("/matrimony/connection/update", common.authorizeUser, handleUpdateConnection);
Router.post("/matrimony/connection/cancel", common.authorizeUser, handleCancelConnection);
Router.get("/matrimony/connection/feed/:pageNumber/:type", common.authorizeUser, handleGetConnectionFeed);
function handleAddConnection(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(
        common.castToObjectId(userId),
        { emailId: 1 },
        (err, existingUser) => {
            if (err || !existingUser) {
                return common.sendErrorResponse(res, "Error getting User Details");
            }
            matrimonyUserController.getUserByOwnerId(req, res, (err, user) => {
                MatrimonyConnectionsController.addRequest(req, user, (Err, saved) => {
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in adding the Request");
                    }
                    notificationController.sendNotificationForRequest(
                        req,
                        saved,
                        "request",
                        (err, response) => {
                            if (err) {
                                console.log("err in sending the notification");
                            }
                            res.send({
                                msg: "Added request Successfully",
                                data: saved,
                            });
                        }
                    );
                });
            });
        }
    );
}
function handleUpdateConnection(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(
        common.castToObjectId(userId),
        { emailId: 1 },
        (err, existingUser) => {
            if (err || !existingUser) {
                return common.sendErrorResponse(res, "Error getting User Details");
            }
            matrimonyUserController.getUserByOwnerId(req, res, (err, user) => {
                MatrimonyConnectionsController.updateConnectionStatus(req, user, (Err, saved) => {
                    // console.log(saved);
                    // console.log(err);
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in adding the Request");
                    }

                    res.send({
                        msg: "updated Successfully",
                        data: saved,
                    });
                });
            });
        }
    );
}

function handleCancelConnection(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(
        common.castToObjectId(userId),
        { emailId: 1 },
        (err, existingUser) => {
            if (err || !existingUser) {
                return common.sendErrorResponse(res, "Error getting User Details");
            }
            matrimonyUserController.getUserByOwnerId(req, res, (err, user) => {
                MatrimonyConnectionsController.cancelRequest(req, user, (Err, saved) => {
                    // console.log(saved);
                    // console.log(err);
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in deleting the Request");
                    }

                    res.send({
                        msg: "deleted Successfully",
                        data: saved,
                    });
                });
            });
        }
    );
}
function handleGetConnectionFeed(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(
        common.castToObjectId(userId),
        { emailId: 1 },
        (err, existingUser) => {
            if (err || !existingUser) {
                return common.sendErrorResponse(res, "Error getting User Details");
            }
            matrimonyUserController.getUserByOwnerId(req, res, (err, user) => {
                MatrimonyConnectionsController.getConnectionFeed(req, user, (Err, saved) => {
                    // console.log(saved);
                    // console.log(err);
                    if (Err) {
                        return common.sendErrorResponse(res, "Error in getting the Request");
                    }

                    return res.send({
                        msg: "got the request Successfully!",
                        data: saved,
                    });
                });
            });
        }
    );
}

module.exports = Router;
