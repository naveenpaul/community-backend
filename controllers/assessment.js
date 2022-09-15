const validator = require("validator");
const assessmentModel = require("../models/assessment");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
function Assessments() {}

Assessments.prototype.submitAssessment = (req, res, user, callback) => {
  if (!common.isObjectId(req.body.formId)) {
    return common.sendErrorResponse(res, "Enter valid form Id");
  }
  if (!common.isObjectId(req.body.projectId)) {
    return common.sendErrorResponse(res, "Enter valid projectId");
  }
  const newAssessmentObj = {
    formId: req.body.formId,
    teamId: req.body.teamId,
    projectId: req.body.projectId,
    formCreatedDate: req.body.formCreatedDate,
    formName: req.body.formName,
    formDescription: req.body.formDescription,
    submittedAt: req.body.submittedAt,
    submittedBy: user,
    fields: req.body.fields,
  };
  const newAssessment = new assessmentModel(newAssessmentObj);
  newAssessment.save(callback);
};
Assessments.prototype.updateAssessment = (req, res, user, callback) => {
  const assessmentId = req.body.assessmentId;
  if (!common.isObjectId(assessmentId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid assessment id"
    );
  }
  const updateObj = {
    submittedAt: req.body.submittedAt,
    fields: req.body.fields,
  };
  assessmentModel.updateOne(
    { _id: assessmentId },
    { $set: updateObj },
    callback
  );
};
Assessments.prototype.deleteAssessment = (req, res, user, callback) => {
  const assessmentId = req.body.assessmentId;
  if (!common.isObjectId(assessmentId)) {
    return common.sendErrorResponse(res, "Please specifiy the valid form id");
  }

  assessmentModel.deleteOne({ _id: assessmentId }, callback);
};
Assessments.prototype.deleteAssessment = (req, res, user, callback) => {
  const assessmentId = req.body.assessmentId;
  if (!common.isObjectId(assessmentId)) {
    return common.sendErrorResponse(res, "Please specifiy the valid form id");
  }

  assessmentModel.deleteOne({ _id: assessmentId }, callback);
};

Assessments.prototype.getAssessmentByAssessmentId = (
  assessmentId,
  projection,
  callback
) => {
  assessmentModel.findOne(
    { _id: common.castToObjectId(assessmentId) },
    projection,
    callback
  );
};
Assessments.prototype.listAssessments = (req, res, user, callback) => {
  const projectId = req.body.projectId;
  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Enter valid project Id");
  }

  //assessment controller
  const findQuery = {
    projectId: common.castToObjectId(projectId),
    "submittedBy.emailId": user.emailId,
  };
  const projection = {
    _id: 1,
    projectId: 1,
    teamId: 1,
    formName: 1,
    formDescription: 1,
    submittedAt: 1,
    formId: 1,
    submittedBy:1
  };
  assessmentModel.find(findQuery, projection, callback);
};

module.exports = Assessments;
