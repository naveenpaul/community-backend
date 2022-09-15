const express = require("express");
const router = express.Router();
const async = require("async");

const commonUtility = require("../common/commonUtility");
const form = require("../controllers/form");
const user = require("../controllers/user");
const files = require("../controllers/files");
const projects = require("../controllers/projects");
const activityLog = require("../controllers/activityLogs");

const common = new commonUtility();
const filesController = new files();
const userController = new user();
const projectsController = new projects();
const activityLogController = new activityLog();
const formController = new form();

router.post("/create/form", common.authorizeUser, handleCreateForm);
router.post("/form/update", common.authorizeUser, handleUpdateForm);
router.post("/form/delete", common.authorizeUser, handleDeleteForm);
router.post("/list/forms", common.authorizeUser, handleListForms);
router.get("/form/by/id/:formId", common.authorizeUser, handleGetFormById);
router.get(
  "/list/forms/full/:teamId",
  common.authorizeUser,
  handleListFormsByTeamId
);

function handleCreateForm(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      formController.createForm(
        req,
        res,
        existingUser,
        (FormErr, savedForm) => {
          if (FormErr || !savedForm) {
            return common.sendErrorResponse(res, "Error in creating new Form");
          }

          res.send({
            msg: "Form created successfully",
            form: savedForm,
          });
        }
      );
    }
  );
}
function handleUpdateForm(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      formController.updateForm(
        req,
        res,
        existingUser,
        (FormErr, updateForm) => {
          if (FormErr || !updateForm) {
            return common.sendErrorResponse(res, "Error in updating form");
          }

          res.send({
            msg: "Form updated successfully",
          });
          // activityLogController.insertLogs({}, savedProject._id, 'project', 'create', existingUser)
        }
      );
    }
  );
}

function handleDeleteForm(req, res) {
 
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      formController.deleteForm(
        req,
        res,
        existingUser,
        (FormErr, response) => {
          if (FormErr ) {
            return common.sendErrorResponse(
              res,
              "Error in updating form"
            );
          }

          res.send({
            msg: "Form Deleted successfully",
          });
          // activityLogController.insertLogs({}, savedProject._id, 'project', 'create', existingUser)
        }
      );
    }
  );
  
}

function handleListForms(req, res) {
  const teamId = req.body.teamId;

  if (!common.isObjectId(teamId)) {
    return common.sendErrorResponse(res, "Enter valid team Id");
  }

  formController.getFormByTeamId(
    teamId,
    req.body.projection,
    (formErr, forms) => {
      if (formErr || !forms) {
        return common.sendErrorResponse(res, "Error in getting forms");
      }

      res.send({
        msg: "Got forms successfully",
        forms: forms,
      });
    }
  );
}

function handleGetFormById(req, res) {
  const formId = req.params.formId;

  if (!common.isObjectId(formId)) {
    return common.sendErrorResponse(res, "Enter valid form Id");
  }

  formController.getFormById(formId, {}, (formErr, form) => {
    if (formErr || !form) {
      return common.sendErrorResponse(res, "Error in getting form");
    }

    res.send({
      msg: "Fetched form successfully",
      form: form,
    });
  });
}

function handleListFormsByTeamId(req, res) {
  const teamId = req.params.teamId;

  if (!common.isObjectId(teamId)) {
    return common.sendErrorResponse(res, "Enter valid team Id");
  }

  formController.getFullFormsByTeamId(teamId, {}, (formErr, forms) => {
    if (formErr || !forms) {
      return common.sendErrorResponse(res, "Error in getting forms");
    }

    res.send({
      msg: "Forms retrieved successfully",
      forms: forms,
    });
  });
}

module.exports = router;
