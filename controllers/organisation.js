const { promisify } = require("util");
const crypto = require("crypto");
const _ = require("lodash");
const Organisation = require("../models/Organisation");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
const randomBytesAsync = promisify(crypto.randomBytes);


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

  //Search Organisation
  OrgController.prototype.searchOrg = (searchQuery, callback) => {
    Organisation.find({
      $text: {
        $search: searchQuery,
        $caseSensitive: false,
      },
    })
      .lean()
      .exec((organisationsErr, organisations) => {
        if (organisationsErr) {
          console.log("Error in getting users");
        }
        callback(organisations || []);
      });
  };


  //Delete Organisation
  OrgController.prototype.deleteOrg = async (req,res, orgId) =>{
    try{
         await Organisation.findByIdAndDelete(req.params.id);
        res.status(200).json("Organisation has been Deleted");
       } catch(err){
        next(err);
       }
}
module.exports = OrgController;