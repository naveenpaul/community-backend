const express = require("express");
const Router = express.Router();
const CommonUtility = require("../common/commonUtility");
const event = require("../controllers/events");
const userControl = require("../controllers/user");
const notificationControl = require('../controllers/notification-service')

const common = new CommonUtility();
const eventController = new event();
const userController = new userControl();
const notificationController= new notificationControl();

Router.post("/events/add", common.authorizeUser, handleAddEvents);
Router.post("/events/get/all", common.authorizeUser, handleGetEvents);
Router.get(
  "/events/feed/page/:pageNumber/:cId",
  common.authorizeUser,
  handleGetEventsFeed
);
Router.get("/event/:eventId", common.authorizeUser, handleGetEventById);
Router.post("/events/add/like", common.authorizeUser, handleAddLikes);
Router.post("/events/add/comment", common.authorizeUser, handleAddComments);
Router.post("/events/remove", common.authorizeUser, handleRemoveEvent);
Router.post(
  "/events/remove/comment",
  common.authorizeUser,
  handleRemoveComment
);
Router.post("/events/remove/like", common.authorizeUser, handleRemoveLike);
Router.post("/events/update", common.authorizeUser, handleUpdateEvents);
Router.post(
  "/events/get/all/comments",
  common.authorizeUser,
  handleGetAllComments
);
Router.post("/events/get/all/likes", common.authorizeUser, handleGetAllLikes);

function handleAddEvents(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      eventController.addEvent(req, res, existingUser, (Err, saved) => {
        if (Err || !saved) {
          return common.sendErrorResponse(res, "Error in adding the Event");
        }
        notificationController.sendNotification(req,saved,'event',(err,response)=>{
          if(err){
            console.log("err in seding the notification");
          }
          res.send({
            msg: "Added Event Successfully",
            data:saved,
          });

        })
      });
    }
  );
}

function handleGetEvents(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { userId: "" },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      eventController.getAllEvent(req, res);
    }
  );
}

function handleGetEventsFeed(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    {},
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      eventController.getEventsFeed(req, res, existingUser);
    }
  );
}

function handleGetEventById(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { userId: "" },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      eventController.getEventById(req, res,(err,response)=>{
        res.send({
          event: response,
          msg: "Successfully got the event",
        });
      });
    }
  );
}

function handleUpdateEvents(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      eventController.updateEvent(req, res, existingUser.emailId);
    }
  );
}
function handleRemoveEvent(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      eventController.removeEvent(req, res, existingUser.emailId);
    }
  );
}

function handleAddLikes(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      eventController.addLike(req, res, existingUser);
    }
  );
}
function handleAddComments(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    {},
    (err, existingUser) => {
      if(err || !existingUser){
        return common.sendErrorResponse(res,"Error getting user details")
      }
      eventController.addComment(req, res, existingUser);
    }
  );
}

function handleRemoveLike(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      eventController.removeLike(req, res);
    }
  );

 

}
function handleRemoveComment(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      eventController.removeComment(req, res, existingUser.emailId);
    }
  );
}
function handleGetAllComments(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      eventController.getAllComment(req, res, existingUser.emailId);
    }
  );
}
function handleGetAllLikes(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      eventController.getAllLike(req, res, existingUser.emailId);
    }
  );
}
module.exports = Router;
