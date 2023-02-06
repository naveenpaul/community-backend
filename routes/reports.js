const express = require("express");
const Router = express.Router();
const CommonUtility = require("../common/commonUtility");
const Report = require("../controllers/reports");
const userControl = require("../controllers/user");
const userController = new userControl();

const common = new CommonUtility();
const reportController = new Report();

Router.post("/report/add",common.authorizeUser,handleAddReports);
Router.delete("/report/delete",common.authorizeUser,handleDeleteReport);


function handleAddReports (req,res){
  const userId= common.getUserId(req) || "";
  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      reportController.addReport(req, res, existingUser, (Err, saved) => {
        if (Err || !saved) {
          return common.sendErrorResponse(res, "Error in adding the Report");
        }
        res.send({
          msg: "Added report Successfully",
        });
      });
    }
  );
}
function handleDeleteReport(req,res){
  const userId = common.getUserId(req) || "";
  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      reportController.deleteReport(req, res, existingUser, (Err, saved) => {
        if (Err || !saved) {
          return common.sendErrorResponse(res, "Error in deleting the Report");
        }
        res.send({
          msg: "Deleted report Successfully",
        });
      });
    });
}


module.exports = Router;