const validator = require("validator");
const User = require("../models/User");

const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

function Login() {}

Login.prototype.registerNewUser = (req, res, callback) => {
    let registeredWith = req.body.registeredWith || null;

    if (!registeredWith) {
        if (req.body.emailId) {
            registeredWith = "EMAILID";
        } else if (req.body.mobileNumber) {
            registeredWith = "MOBILENUMBER";
        }
    }

    if (registeredWith == null) {
        return common.sendErrorResponse(res, "Please enter either email Id or mobile number for registration");
    }

    if (req.body.emailId && !validator.isEmail(req.body.emailId)) {
        return common.sendErrorResponse(res, "Please enter a valid email address");
    }

    if (req.body.mobileNumber && !validator.isMobilePhone(req.body.mobileNumber)) {
        return common.sendErrorResponse(res, "Please enter a valid mobile number");
    }

    if (registeredWith !== "MOBILENUMBER" && registeredWith !== "gmail") {
        if (!validator.isLength(req.body.password, { min: 8 })) {
            return common.sendErrorResponse(res, "Password must be at least 8 characters long");
        }

        if (req.body.password !== req.body.confirmPassword) {
            return common.sendErrorResponse(res, "Passwords do not match");
        }
    }

    if (req.body.emailId) {
        req.body.emailId = validator.normalizeEmail(req.body.emailId, {
            gmail_remove_dots: false,
        });
    }

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        fullName: req.body.fullName || req.body.firstName + " " + req.body.lastName,
        emailId: req.body.emailId,
        registeredWith: registeredWith,
        mobileNumber: req.body.mobileNumber,
        profilePicUrl: req.body.profilePicUrl,
    });

    if (registeredWith !== "gmail" && registeredWith !== "MOBILENUMBER") {
        user.password = req.body.password;
    }

    User.findOne({ emailId: req.body.emailId }, (err, existingUser) => {
        if (err) {
            return common.sendErrorResponse(res, "Error in fetching user details");
        }

        if (existingUser) {
            res.status(200);
            return res.send({
                msg: "User with email address already exists",
                credentials: common.composeUserLoginCredentials(existingUser),
            });
        }

        user.save(callback);
    });
};

module.exports = Login;
