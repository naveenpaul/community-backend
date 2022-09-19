const express = require("express");
const router = express.Router();
const async = require("async");
const user = require("../controllers/user");
const commonUtility = require("../common/commonUtility");
const organisation = require("../controllers/organisation");

const userController = new user();
const common = new commonUtility();
const orgController = new organisation();

router.post("/organisation/create", common.authorizeUser, handleOrgCreate);
router.post("/organisation/update", common.authorizeUser, handleOrgUpdate);



//Organisation Creation Handler
function handleOrgCreate(req, res) {

  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    null,
    (err, existingUser) => {
      orgController.createOrg(req, existingUser, (err, data) => {
        if (err || !data) {
          return common.sendErrorResponse(res, "Error Creating User");
        }
    
        res.send({
          msg: "",
          data: data,
        });
      });
    }
  );
}

//Organisation Update Handler
function handleOrgUpdate(req, res) {
  const orgId = common.getOrgId(req) || "";

  userController.updateUserDetails(req, res, orgId);
}


module.exports = router;
