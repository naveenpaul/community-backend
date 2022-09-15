const express = require("express");
const router = express.Router();
const async = require("async");

const commonUtility = require("../common/commonUtility");
const assessment = require("../controllers/assessment");
const formUtility = require("../controllers/formUtility");
const user = require("../controllers/user");
const files = require("../controllers/files");
const projects = require("../controllers/projects");
const activityLog = require("../controllers/activityLogs");

const common = new commonUtility();
const filesController = new files();
const userController = new user();
const projectsController = new projects();
const activityLogController = new activityLog();
const assessmentController = new assessment();
const formUtilityController = new formUtility();


router.post("/submit/assessment", common.authorizeUser, handleSubmitAssessment);
router.post("/assessment/update", common.authorizeUser, handleUpdateAssessment);
router.post("/assessment/delete", common.authorizeUser, handleDeleteAssessment);
router.get("/assessment/download/:assessmentId", common.authorizeUser, handleDownloadAssessment);
router.post("/list/assessments", common.authorizeUser, handleListAssessments);
router.get(
  "/assessment/by/assessmentId/:assessmentId",
  common.authorizeUser,
  handleGetAssessmentByAssessmentId
);
// router.post("/assessment/by/formId", common.authorizeUser, handleGetAssessmentByFormId);

function handleSubmitAssessment(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      //controller
      assessmentController.submitAssessment(
        req,
        res,
        existingUser,
        (AssessmentErr, savedAssessment) => {
          if (AssessmentErr || !savedAssessment) {
            return common.sendErrorResponse(
              res,
              "Error in submitting new Assessment"
            );
          }

          res.send({
            msg: "Assessment submitted successfully",
            assessment: savedAssessment,
          });
        }
      );
    }
  );
}

function handleUpdateAssessment(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      assessmentController.updateAssessment(
        req,
        res,
        existingUser,
        (AssessmentErr, updateAssessment) => {
          if (AssessmentErr || !updateAssessment) {
            return common.sendErrorResponse(
              res,
              "Error in updating Assessment"
            );
          }

          res.send({
            msg: "Assessment updated successfully",
          });
          // activityLogController.insertLogs({}, savedProject._id, 'project', 'create', existingUser)
        }
      );
    }
  );
}

function handleDeleteAssessment(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      assessmentController.deleteAssessment(
        req,
        res,
        existingUser,
        (FormErr, response) => {
          if (FormErr) {
            return common.sendErrorResponse(res, "Error in updating form");
          }
          res.send({
            msg: "Assessment Deleted successfully",
          });
          // activityLogController.insertLogs({}, savedProject._id, 'project', 'create', existingUser)
        }
      );
    }
  );
}


function handleListAssessments(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      assessmentController.listAssessments(
        req,
        res,
        existingUser,
        (AssessmentErr, assessment) => {
          if (AssessmentErr || !assessment) {
            return common.sendErrorResponse(
              res,
              "Error in fetching Assessment List"
            );
          }

          res.send({
            msg: "Assessment list fetched sucessfully",
            assessments: assessment,
          });
          // activityLogController.insertLogs({}, savedProject._id, 'project', 'create', existingUser)
        }
      );
    }
  );
}

function handleGetAssessmentByAssessmentId(req, res) {
  const assessmentId = req.params.assessmentId;

  if (!common.isObjectId(assessmentId)) {
    return common.sendErrorResponse(res, "Enter valid assessment Id");
  }

  assessmentController.getAssessmentByAssessmentId(
    assessmentId,
    {},
    (assessmentErr, assessment) => {
      if (assessmentErr || !assessment) {
        return common.sendErrorResponse(res, "Error in getting assessment");
      }

      res.send({
        msg: "Fetched assessment successfully",
        assessment: assessment,
      });
    }
  );
}
function handleDownloadAssessment(req, res) {
  const assessmentId = req.params.assessmentId;

  if (!common.isObjectId(assessmentId)) {
    return common.sendErrorResponse(res, "Enter valid assessment Id");
  }

  assessmentController.getAssessmentByAssessmentId(
    assessmentId,
    {},
    (assessmentErr, assessment) => {
      if (assessmentErr || !assessment) {
        return common.sendErrorResponse(res, "Error in getting assessment");
      }
      formUtilityController.downloadAssessment(assessment,res,(err,file)=>{
        if(err){
          return common.sendErrorResponse(err,"Error in downloading assessment.");
        }
        
        res.send({
          link:'form'+assessment._id+'.xlsx'
        })
      })
    }
  );
}
// function handleGetAssessmentByFormId(req, res) {
//   const userId = common.getUserId(req) || "";

//   userController.findUserByUserId(
//     common.castToObjectId(userId),
//     common.getUserDetailsFields(),
//     (err, existingUser) => {
//       if (err || !existingUser) {
//         return common.sendErrorResponse(res, "Error getting user details");
//       }
//       assessmentController.getAssessmentByFormId(
//         req,
//         res,
//         existingUser,
//         (AssessmentErr, assessment) => {
//           if (AssessmentErr || !assessment) {
//             return common.sendErrorResponse(
//               res,
//               "Error in fetching Assessment"
//             );
//           }

//           res.send({
//             msg: "Assessment by form Id fetched successfully",
//             assessment: assessment,
//           });
//           // activityLogController.insertLogs({}, savedProject._id, 'project', 'create', existingUser)
//         }
//       );
//       // assessmentController.getAssessmentByFormId(formId, {}, (assessmentErr, assessment) => {
//       //   if (assessmentErr || !assessment) {
//       //     return common.sendErrorResponse(res, "Error in getting assessment");
//       //   }

//       //   res.send({
//       //     msg: "Fetched assessment by form Id successfully",
//       //     assessment: assessment,
//       //   });
//       // });
//     });
// }

module.exports = router;
