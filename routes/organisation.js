const express = require("express");
const router = express.Router();
const async = require("async");
const commonUtility = require("../common/commonUtility");
const organisation = require("../controllers/organisation");


const common = new commonUtility();
const orgController = new organisation();

router.post("/organisation/create", common.authorizeUser, handleOrgCreate);
router.post("/organisation/update", common.authorizeUser, handleOrgUpdate);
router.get("/organisation/search", common.authorizeUser, handleOrgSearch);
router.delete("/organisation/delete/:id", common.authorizeUser, handleOrgDelete);



//Organisation Creation Handler
function handleOrgCreate(req, res) {

  const userId = common.getUserId(req) || "";

  orgController.findUserByUserId(
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

  orgController.updateOrgDetails(req, res, orgId);
}

//Organisation Update Handler
function handleOrgSearch(req, res) {
  const searchQuery = req.query.searchQuery;

  orgController.searchOrg(searchQuery, (organisations) => {
    res.send({
      organisation: organisations,
    });
  });
}

//Organisation Delete Handler
function handleOrgDelete(req,res){
  const orgId = common.getOrgId(req);

  orgController.deleteOrg(req,res, orgId);
}

module.exports = router;
