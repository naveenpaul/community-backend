const express = require('express')
const Router = express.Router()
const CommonUtility = require("../common/commonUtility");
const userControl = require("../controllers/user");
const notificationControl = require('../controllers/notification-service');
const MatrimonyUser = require('../controllers/matrimony_user');
const { authorization } = require('paypal-rest-sdk');

const common = new CommonUtility();
const userController = new userControl();
const notificationController= new notificationControl();
const matrimonyUserController=new MatrimonyUser();

Router.post("/matrimony/user/update", common.authorizeUser, handleUpdateUser);
Router.get('/matrimony/user/feed/:pageNumber',common.authorizeUser,handleGetUserFeed);

function handleUpdateUser(req,res){
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { userId: "" },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      matrimonyUserController.updateUserDetails(req, res,(err,saved)=>{
        if(err){
          return common.sendErrorResponse(res,"Error in updating the User");
        }
        return res.send({
          msg:"updated the  User",
          data:saved
        })
      });
    }
  );
}
function handleGetUserFeed(req,res){
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { userId: "" },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      matrimonyUserController.getUserFeed(req, res,(err,saved)=>{
        if(err){
          return common.sendErrorResponse(res,"Error in updating the User");
        }
        return res.send({
          msg:"updated the  User",
          data:saved
        })
      });
    }
  );
}
module.exports = Router;