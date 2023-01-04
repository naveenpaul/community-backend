const validator = require("validator");
const User = require("../models/User");

const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

function Login() {}

Login.prototype.registerNewUser = (req, res, callback) => {
  if (
    req.body.mobileNumber &&
    !validator.isMobilePhone(req.body.mobileNumber)
  ) {
    return common.sendErrorResponse(res, "Please enter a valid mobile number");
  }

  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    fullName: req.body.fullName || req.body.firstName + " " + req.body.lastName,
    registeredWith: "MOBILENUMBER",
    mobileNumber: req.body.mobileNumber,
    profilePicUrl: req.body.profilePicUrl,
  });

  User.findOne({ mobileNumber: req.body.mobileNumber }, (err, existingUser) => {
    if (err) {
      return common.sendErrorResponse(res, "Error in fetching user details");
    }

    if (existingUser) {
      res.status(200);
      return res.send({
        msg: "User already exists",
        credentials: common.composeUserLoginCredentials(existingUser),
      });
    }

    user.save(callback);
  });
};

module.exports = Login;
