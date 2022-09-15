const validator = require("validator");
const formModel = require("../models/form");

const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
function Forms() {}

Forms.prototype.createForm = (req, res, user, callback) => {
  if (!common.validateString(req.body.name)) {
    return common.sendErrorResponse(res, "Enter valid form name");
  }
  if (!common.isObjectId(req.body.teamId)) {
    return common.sendErrorResponse(res, "Enter valid team Id");
  }
  const newFormObj = {
    name: req.body.name,
    description: req.body.description,
    teamId: req.body.teamId,
    createdDate: req.body.createdDate,
    lastUpdated: req.body.lastUpdated,
    owner: user,
    sharedWith: [],
    fields: req.body.fields,
  };
  const newForm = new formModel(newFormObj);
  newForm.save(callback);
};

Forms.prototype.updateForm = (req, res, user,callback) => { 
    const formId = req.body.formId;
    if (!common.isObjectId(formId)) {
        return common.sendErrorResponse(
          res,
          "Please specifiy the valid form id"
        );
      }
    const updateObj = {
        name: req.body.name,
        description: req.body.description,
        lastUpdated: req.body.lastUpdated,
        sharedWith:[],
        fields:req.body.fields,
    }
    formModel.updateOne({_id: formId}, {$set: updateObj}, callback);
}
Forms.prototype.deleteForm = (req, res, user,callback) => { 
    const formId = req.body.formId;
    if (!common.isObjectId(formId)) {
        return common.sendErrorResponse(
          res,
          "Please specifiy the valid form id"
        );
    }
   
    formModel.deleteOne({_id: formId}, callback);
};

Forms.prototype.getFormByTeamId = (teamId, projection, callback) => { 
    if (!projection) {
        projection = {
            _id: 1,
            name: 1,
            owner: 1,
            description:1
        }
    }
    formModel.find({teamId: common.castToObjectId(teamId)}, projection, callback);
 
} 

Forms.prototype.getFormById = (formId, projection, callback) => {
  formModel.findOne(
    { _id: common.castToObjectId(formId) },
    projection,
    callback
  );
};

Forms.prototype.getFullFormsByTeamId = (teamId, projection, callback) => {
  formModel.find(
    { teamId: common.castToObjectId(teamId) },
    projection,
    callback
  );
};

module.exports = Forms;
