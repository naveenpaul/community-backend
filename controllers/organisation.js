 
const _ = require("lodash");
const Organisation = require("../models/Organisation");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();



function OrgController() {}

//Create Organisation
OrgController.prototype.createOrg = (
    req,
  existingUser,
  
  callback
) => {
    let data = {
        name: req.body.name,
    address: {
      city: req.body.city,
      pincode: req.body.pincode,
      state: req.body.state,
      country: req.body.country,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    description: req.body.description,
    logo: req.body.logo,
    backgroundImg: req.body.backgroundImg,
    staff: [
        {
         userId: existingUser._id,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          emailId: existingUser.emailId,
          mobileNumber: existingUser.mobileNumber,
          profilePicUrl: existingUser.profilePicUrl,
          role: "ADMIN",
          },
        ]
    }
    
    
  Organisation.collection.insert([data],(err, existingUser) => {
    callback(err, existingUser);
  });
};

//Update Organisation
OrgController.prototype.updateOrgDetails = (req, res, orgId) => {
    const orgObj = {
      name: req.body.name || "",
      address:{
        city: req.body.city || "",
        pincode: req.body.pincode || "",
        state: req.body.country || "",
        country: req.body.country || "",
      },
      
      updatedAt: new Date(),
      description:req.body.description,
      logo:req.body.logo,
      backgroundImg:req.body.backgroundImg,
    };
  
    Organisation.updateOne(
      { _id: common.castToObjectId(orgId) },
      orgObj,
      (updateErr, updateResult) => {
        if (updateErr || !updateResult) {
          return common.sendErrorResponse(res, "Error in updating Organisation details");
        }
  
        res.send({
          msg: "Successfully updated Organisation details",
        });
      }
    );
  };
module.exports = OrgController;