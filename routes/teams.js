const express = require("express");
const router = express.Router();

const commonUtility = require("../common/commonUtility");
const user = require("../controllers/user");
const teams = require("../controllers/teams");
const activityLog = require("../controllers/activityLogs");

const common = new commonUtility();
const teamsController = new teams();
const userController = new user();
const activityLogController = new activityLog();

router.post("/create/team", common.authorizeUser, handleCreateTeam);
router.post("/team/update", common.authorizeUser, handleUpdateTeam);
router.post("/team/add/member", common.authorizeUser, handleAddMember);
router.post("/team/remove/member", common.authorizeUser, handleRemoveMember);
router.post(
  "/team/update/template",
  common.authorizeUser,
  handleUpdateTemplate
);
router.post("/team/update/member", common.authorizeUser, handleUpdateMember);
router.post("/team/all", common.authorizeUser, handleGetAllTeams);
router.post("/team/by/id", common.authorizeUser, handleGetTeamById);
router.get("/team/delete/:teamId", common.authorizeUser, handleDeleteTeam);
router.get(
  "/team/get/all/team/members",
  common.authorizeUser,
  handleGetAllTeamMembers
);

function handleCreateTeam(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.createNewTeam(
        req,
        res,
        existingUser,
        (teamErr, savedTeam) => {
          if (teamErr || !savedTeam) {
            return common.sendErrorResponse(
              res,
              "Error in saving team details"
            );
          }

          res.send({
            msg: "Team saved successfully",
            team: savedTeam,
          });

          activityLogController.insertLogs(
            {},
            savedTeam._id,
            "team",
            "create",
            existingUser
          );
        }
      );
    }
  );
}

function handleUpdateTeam(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.updateTeam(req, res, existingUser.emailId);
    }
  );
}

function handleAddMember(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.addMember(req, res, existingUser.emailId);
    }
  );
}

function handleRemoveMember(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.removeMember(req, res, existingUser.emailId);
    }
  );
}

function handleUpdateMember(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.updateMember(req, res, existingUser.emailId);
    }
  );
}

function handleDeleteTeam(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.deleteTeam(req, res, existingUser.emailId);
    }
  );
}

function handleGetAllTeams(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.getAllTeams(req, res, existingUser.emailId);
    }
  );
}

function handleGetTeamById(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.getTeamById(
        req,
        res,
        existingUser.emailId,
        (existingTeam) => {
          res.send({
            team: existingTeam,
          });
        }
      );
    }
  );
}

function handleUpdateTemplate(req, res, next) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      teamsController.updateTeamTemplate(req, res, existingUser.emailId);
    }
  );
}

function handleGetAllTeamMembers(req, res) {
  const teamId = req.query.teamId;

  if (!common.isObjectId(teamId)) {
    return common.sendErrorResponse(res, "Please specifiy the valid team id");
  }

  teamsController.getAllTeamMembers(teamId, (teamMembers) => {
    teamMembers = teamMembers || [];

    teamMembers.forEach((member) => {
      member.fullName = member.firstName + " " + member.lastName;
    });

    return res.send({
      msg: "Successfully got team members",
      teamMembers: teamMembers,
    });
  });
}

module.exports = router;
