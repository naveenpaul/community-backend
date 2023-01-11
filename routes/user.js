const express = require("express");
const router = express.Router();
const validator = require("validator");
const moment = require("moment");

const commonUtility = require("../common/commonUtility");
const user = require("../controllers/user");
const login = require("../controllers/login");
const activityLog = require("../controllers/activityLogs");

const common = new commonUtility();
const userController = new user();
const activityLogController = new activityLog();

router.post("/user/details", common.authorizeUser, handleUserDetails);
router.post(
  "/user/details/update",
  common.authorizeUser,
  handleUpdateUserDetails
);
router.get("/user/search", common.authorizeUser, handleUserSearch);
router.post(
  "/user/details/by/email",
  common.authorizeUser,
  handleUserDetailsByEmail
);
router.get("/user/:id", common.authorizeUser, handleGetUserById);

function handleUserDetails(req, res) {
  const userId = common.getUserId(req) || "";
  let projection = req.body.projection || common.getUserDetailsFields();

  projection.updatedAt = 1;

  userController.findUserByUserId(
    common.castToObjectId(userId),
    projection,
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      if (
        existingUser.updatedAt &&
        new Date(existingUser.updatedAt) &&
        moment().diff(moment(existingUser.updatedAt), "days") >= 1
      ) {
        userController.updateLastLoginDate(common.castToObjectId(userId));
      }

      res.send({
        msg: "Successfully got user details",
        user: existingUser,
      });
    }
  );
}

function handleUpdateUserDetails(req, res) {
  const userId = common.getUserId(req) || "";

  userController.updateUserDetails(req, res, userId);
}

function handleUserSearch(req, res) {
  const searchQuery = req.query.searchQuery;

  userController.searchUser(searchQuery, (users) => {
    res.send({
      users: users,
    });
  });
}

function handleGetUserById(req, res) {
  const userId = common.castToObjectId(req.params.id);

  userController.findUserByUserId(userId, {}, (error, existingUser) => {
    if (error || !existingUser) {
      return common.sendErrorResponse(res, "Error in getting user");
    }
    res.send({
      users: existingUser,
    });
  });
}

function handleUserDetailsByEmail(req, res) {
  const emailId = req.body.emailId;
  const findQuery = {};

  if (validator.isMobilePhone(emailId)) {
    findQuery.mobileNumber = emailId;
  }

  findQuery[validator.isMobilePhone(emailId) ? "mobileNumber" : "emailId"] =
    emailId;
  userController.findUserByQuery(
    findQuery,
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return res.send({
          userExists: false,
          user: {},
        });
      }

      res.send({
        userExists: true,
        user: existingUser,
      });
    }
  );
}

module.exports = router;
