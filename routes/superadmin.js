const express = require("express");
const router = express.Router();
const async = require("async");

const commonUtility = require("../common/commonUtility");
const user = require("../controllers/user");

const common = new commonUtility();
const userController = new user();

router.post("/user/report", common.authorizeUser, handleUserData);

function handleUserData(req, res) {
  const userId = common.getUserId(req) || "";

  userController.getUsers(null, (err, data) => {
    if (err || !data) {
      return common.sendErrorResponse(res, "Error getting user details");
    }

    res.send({
      msg: "",
      data: data,
    });
  });
}

module.exports = router;
