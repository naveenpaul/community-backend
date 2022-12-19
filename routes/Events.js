const express = require("express");
const Router = express.Router();
const CommonUtility = require("../common/commonUtility");
const event = require("../controllers/events");
const userControl = require("../controllers/user");

const common = new CommonUtility();
const eventController = new event();
const userController = new userControl();

Router.post("/events/add", common.authorizeUser, handleAddEvents);
Router.post("/events/get/all", common.authorizeUser, handleGetEvents);
Router.get("/events/feed/page/:pageNumber", common.authorizeUser, handleGetEventsFeed);
Router.get("/event/:eventId", common.authorizeUser, handleGetEventById);
Router.post("/events/add/like", common.authorizeUser, handleAddLikes);
Router.post("/events/add/comment", common.authorizeUser, handleAddComments);
Router.post("/events/remove", common.authorizeUser, handleRemoveEvent);
Router.post("/events/remove/comment", common.authorizeUser, handleRemoveComment);
Router.post("/events/remove/like", common.authorizeUser, handleRemoveLike);
Router.post("/events/update", common.authorizeUser, handleUpdateEvents);
Router.post("/events/get/all/comments", common.authorizeUser, handleGetAllComments);
Router.post("/events/get/all/likes", common.authorizeUser, handleGetAllLikes);

function handleAddEvents(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting User Details");
        }
        eventController.addEvent(req, res, (Err, saved) => {
            if (Err || !saved) {
                return common.sendErrorResponse(res, "Error in adding the Event");
            }
            res.send({
                msg: "Added Event Successfully",
            });
        });
    });
}

function handleGetEvents(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { userId: "" }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }
        eventController.getAllEvent(req, res);
    });
}

function handleGetEventsFeed(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), {}, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.getEventsFeed(req, res, existingUser);
    });
}

function handleGetEventById(req, res) {
    const userId = common.getUserId(req) || '';

    userController.findUserByUserId(common.castToObjectId(userId), { userId: '' }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }
        eventController.getEventById(req, res, existingUser);
    });
}

function handleUpdateEvents(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.updateEvent(req, res, existingUser.emailId);
    });
}
function handleRemoveEvent(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.removeEvent(req, res, existingUser.emailId);
    });
}

function handleAddLikes(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.addLike(req, res, existingUser.emailId);
    });
}
function handleAddComments(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.addComment(req, res, existingUser.emailId);
    });
}

function handleRemoveLike(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.removeLike(req, res, existingUser.emailId);
    });
}
function handleRemoveComment(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.removeComment(req, res, existingUser.emailId);
    });
}
function handleGetAllComments(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.getAllComment(req, res, existingUser.emailId);
    });
}
function handleGetAllLikes(req, res) {
    const userId = common.getUserId(req) || "";

    userController.findUserByUserId(common.castToObjectId(userId), { emailId: 1 }, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, "Error getting user details");
        }

        eventController.getAllLike(req, res, existingUser.emailId);
    });
}
module.exports = Router;
