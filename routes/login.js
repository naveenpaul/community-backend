const express = require("express");
const router = express.Router();
const validator = require("validator");

const commonUtility = require("../common/commonUtility");
const user = require("../controllers/user");
const login = require("../controllers/login");
const activityLog = require("../controllers/activityLogs");

const common = new commonUtility();
const loginController = new login();
const userController = new user();
const activityLogController = new activityLog();

router.post("/user/register", handleUserRegistration);
router.post("/user/login", handleUserLogin);

function handleUserRegistration(req, res) {
  loginController.registerNewUser(req, res, (saveErr, savedUser) => {
    if (saveErr) {
      console.log(saveErr);
      return common.sendErrorResponse(res, "Error in saving user details");
    } else {
      res.status(200);
      res.send({
        msg: "User added successfully",
        credentials: common.composeUserLoginCredentials(savedUser),
      });

      activityLogController.insertLogs(
        {},
        savedUser._id,
        "register",
        "create",
        savedUser
      );
    }
  });
}

function sendLoginResponse(res, user) {
  res.send({
    credentials: common.composeUserLoginCredentials(user),
    msg: "User logged in successfully",
  });

  activityLogController.insertLogs( {}, user._id, "login", "read", user);
}

function handleUserLogin(req, res) {
  const emailId = req.body.emailId;
  const password = req.body.password;
  const findQuery = {};

  if (validator.isMobilePhone(emailId)) {
    findQuery.mobileNumber = emailId;
  } else if (validator.isEmail(emailId)) {
    findQuery.emailId = emailId;
  }

  const projection = {
    emailId: 1,
    mobileNumber: 1,
    firstName: 1,
    lastName: 1,
    password: 1,
    registeredWith: 1,
    _id: 1,
  };

  userController.findUserByQuery(findQuery, projection, (err, existingUser) => {
    if (err || !existingUser) {
      common.sendErrorResponse(res, "User is not present, Please sign up");
    } else {
      if (req.body.loginWith == 'google') {
        sendLoginResponse(res, existingUser);

      } else {
        existingUser.comparePassword(password, (passwordErr, isMatch) => {
          if (isMatch) {
            sendLoginResponse(res, existingUser);
          } else {
            common.sendErrorResponse(res, "Please enter correct password");
          }
        });
      }
    }
  });
}

module.exports = router;
