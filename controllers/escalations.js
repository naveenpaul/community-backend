const validator = require("validator");
const EscalationsModel = require("../models/escalations");

const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
function Escalations() {}

Escalations.prototype.escalationAdd = (req, res, user) => {
  const projectId = req.body.projectId;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Enter valid project Id");
  }

  const escalationsModelObj = {
    teamId: req.body.teamId,
    projectId: req.body.projectId,
    taskId: req.body.taskId,
    taskName: req.body.taskName,
    toUser: req.body.toUser,
    ownerEmailId: user,
    subject: req.body.subject,
    description: req.body.description,
    acknowledgement: req.body.acknowledgement,
    status: req.body.status || "Open",
  };
  escalationsModelObj.resolutionDate = req.body.resolutionDate
    ? new Date(req.body.resolutionDate)
    : req.body.resolutionDate;

  const newEscalation = new EscalationsModel(escalationsModelObj);
  newEscalation.save((escalationErr, savedEscalation) => {
    console.log(escalationErr);
    if (escalationErr || !savedEscalation) {
      return common.sendErrorResponse(res, "Error in creating new escalation");
    }

    return res.send({
      msg: "Escalation created successfully",
      escalation: savedEscalation,
    });
  });
};

Escalations.prototype.escalationUpdate = (req, res) => {
  const escalation = req.body.escalation;

  if (!common.isObjectId(escalation._id)) {
    return common.sendErrorResponse(res, "Enter valid escalation Id");
  }

  EscalationsModel.updateOne(
    { _id: common.castToObjectId(escalation._id) },
    { $set: escalation },
    (updateEscalationErr, updatedEscalation) => {
      if (updateEscalationErr || !updatedEscalation) {
        return common.sendErrorResponse(res, "Error in updating escalation");
      }

      res.send({
        msg: "Updated escalation successfully",
      });
    }
  );
};

Escalations.prototype.escalationDelete = (req, res) => {
  const escalationId = req.params.escalationId;

  if (!common.isObjectId(escalationId)) {
    return common.sendErrorResponse(res, "Enter valid escalation Id");
  }

  EscalationsModel.remove(
    { _id: common.castToObjectId(escalationId) },
    (escalationRemoveErr, removedEscalation) => {
      if (escalationRemoveErr || !removedEscalation) {
        return common.sendErrorResponse(res, "Error in deleting escalation");
      }

      res.send({
        msg: "Deleted escalation successfully",
        escalation: removedEscalation,
      });
    }
  );
};

Escalations.prototype.escalationById = (req, res) => {
  const escalationId = req.params.escalationId;

  if (!common.isObjectId(escalationId)) {
    return common.sendErrorResponse(res, "Enter valid escalation Id");
  }

  EscalationsModel.findOne(
    { _id: common.castToObjectId(escalationId) },
    (escalationByIdErr, escalationById) => {
      if (escalationByIdErr || !escalationById) {
        return common.sendErrorResponse(res, "Error in getting escalation");
      }

      res.send({
        msg: "Got escalation successfully",
        escalation: escalationById,
      });
    }
  );
};

Escalations.prototype.escalationList = (req, res) => {
  const projectId = req.body.projectId;
  const taskId = req.body.taskId;
  let projection = req.body.projection || {};

  const findQuery = {};

  if (projectId) {
    if (!common.isObjectId(projectId)) {
      return common.sendErrorResponse(res, "Enter valid projectId Id");
    }

    findQuery.projectId = common.castToObjectId(projectId);
  }

  if (taskId) {
    if (!common.isObjectId(taskId)) {
      return common.sendErrorResponse(res, "Enter valid task Id");
    }

    findQuery.taskId = common.castToObjectId(taskId);
  }

  if (Object.keys(projection).length == 0) {
    projection = {
      toUser: 1,
      subject: 1,
      status: 1,
      resolutionDate: 1,
      acknowledgement: 1,
      description: 1,
    };
  }

  EscalationsModel.find(
    findQuery,
    projection,
    (escalationListErr, escalationList) => {
      if (escalationListErr || !escalationList) {
        return common.sendErrorResponse(res, "Error in getting escations list");
      }

      return res.send({
        msg: "Succeessfully got escalation list",
        escalationsList: escalationList,
      });
    }
  );
};

Escalations.prototype.escalationDownload = (req, res) => {};

module.exports = Escalations;
