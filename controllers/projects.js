const validator = require("validator");
const projects = require("../models/projects");

const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
function Projects() {}

Projects.prototype.createProject = (req, res, user, template, callback) => {
  template = template || {};

  if (!common.validateString(req.body.projectName)) {
    return common.sendErrorResponse(res, "Enter valid project name");
  }

  if (!common.isObjectId(req.body.teamId)) {
    return common.sendErrorResponse(res, "Enter valid team Id");
  }

  const newProjectObj = {
    projectName: req.body.projectName,
    description: req.body.description,
    teamId: req.body.teamId,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    sections: template ? template.sections : [],
    tags: req.body.tags || [],
    ownerEmailId: user,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  };

  newProjectObj.teamMembers =
    (req.body.teamMembers || []).length == 0 ? [user] : req.body.teamMembers;
  const newProject = new projects(newProjectObj);

  newProject.save(callback);
};

Projects.prototype.deleteProject = (req, res, user) => {
  const projectId = req.params["projectId"];

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid project id"
    );
  }

  projects.remove(
    {
      _id: common.castToObjectId(projectId),
      "teamMembers.emailId": user.emailId,
    },
    (removedProjectErr, removedProject) => {
      if (removedProjectErr || !removedProject) {
        return common.sendErrorResponse(res, "Error in deleting project");
      }

      res.send({
        msg: "Successfully deleted the project",
        project: removedProject,
      });
    }
  );
};

Projects.prototype.getProjectFiles = (projectId, callback) => {
  projects.findOne(
    { _id: common.castToObjectId(projectId) },
    { sections: 1 },
    callback
  );
};

Projects.prototype.getProjectById = (projectId, projection, callback) => {
  projects.findOne(
    { _id: common.castToObjectId(projectId) },
    projection,
    callback
  );
};

Projects.prototype.getAllTeamMembers = (projectId, callback) => {
  projectId = common.castToObjectId(projectId);

  projects
    .findOne({ _id: projectId }, { teamMembers: 1 })
    .lean()
    .exec(callback);
};

Projects.prototype.getUserAccess = (userId, projectId, callback) => {
  projectId = common.castToObjectId(projectId);

  projects
    .findOne({ _id: projectId }, { teamMembers: 1 })
    .lean()
    .exec((projectErr, teamMembers) => {
      let matchFound = false;

      if (projectErr || !teamMembers) {
        matchFound = false;
      } else {
        teamMembers = teamMembers.teamMembers || [];
        teamMembers.forEach((member) => {
          if (member._id.toString() == userId && member.viewOnly == true) {
            matchFound = true;
          }
        });
      }

      callback(matchFound);
    });
};

Projects.prototype.listProjects = (req, res, user, callback) => {
  let projection = {};
  let teamId = req.body.teamId;

  if (!common.isObjectId(teamId)) {
    return common.sendErrorResponse(res, "Please specifiy the valid teamId id");
  }

  if (req.body.projection) {
    projection = req.body.projection;
  } else {
    projection = {
      projectName: 1,
      description: 1,
      teamMembers: 1,
      startDate: 1,
      endDate: 1,
      createdAt:1
    };
  }

  const findQuery = {
    "teamMembers.emailId": user.emailId,
    teamId: common.castToObjectId(teamId),
  };

  projects
    .find(findQuery, projection)
    .lean()
    .exec(function (projectListError, projectList) {
      if (projectListError || !projectList) {
        return common.sendErrorResponse(res, "Error in getting project list");
      }

      callback(projectList);
    });
};

Projects.prototype.listRecentProjects = (req, res, user, callback) => {
  let projection = {};

  if (req.body.projection) {
    projection = req.body.projection;
  } else {
    projection = {
      projectName: 1,
      teamMembers: 1,
      city: 1,
      teamId: 1,
    };
  }

  const findQuery = {
    "teamMembers.emailId": user.emailId,
  };

  projects.find(findQuery, projection, (projectListError, projectList) => {
    if (projectListError || !projectList) {
      return common.sendErrorResponse(res, "Error in getting project list");
    }

    callback(projectList);
  });
};

Projects.prototype.addTeamMember = (req, res, user) => {
  const projectId = req.body.projectId;
  const teamMember = req.body.teamMember || {};

  if (!common.validateString(projectId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid project id"
    );
  }

  if (Object.keys(teamMember).length < 1) {
    return common.sendErrorResponse(
      res,
      "Team member should have atleast one key"
    );
  }

  projects.updateOne(
    {
      "teamMembers.emailId": user.emailId,
      _id: common.castToObjectId(projectId),
    },
    { $push: { teamMembers: teamMember } },
    (teamUpdateErr, teamUpdateResult) => {
      if (teamUpdateErr || !teamUpdateResult) {
        return common.sendErrorResponse(res, "Error in adding team member");
      }

      res.send({
        msg: "Added team member successfully",
        project: teamUpdateResult,
      });
    }
  );
};

Projects.prototype.updateProject = (req, res, user, callback) => {
  const projectId = req.body.projectId;

  let updateObj;
  if(!req.body.tags){
    updateObj= {
      projectName: req.body.projectName,
      description: req.body.description,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      teamMembers: req.body.teamMembers,
    };
  }
  else{
    updateObj={
      tags: req.body.tags,
    }
  }

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid project id"
    );
  }
  
  projects.updateOne(
    {
      "teamMembers.emailId": user.emailId,
      _id: common.castToObjectId(projectId),
    },
    { $set: updateObj },
    callback
  );
};

Projects.prototype.removeTeamMember = (req, res, user) => {
  const projectId = req.body.projectId;
  const teamMemberEmailId = req.body.emailId || "";

  if (!common.validateString(projectId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid project id"
    );
  }

  if (!validator.isEmail(teamMemberEmailId)) {
    return common.sendErrorResponse(
      res,
      "Invalid team member email Id to remove"
    );
  }

  projects.updateOne(
    {
      "teamMembers.emailId": user.emailId,
      _id: common.castToObjectId(projectId),
    },
    { $pull: { teamMembers: { emailId: teamMemberEmailId } } },
    (teamUpdateErr, teamUpdateResult) => {
      if (teamUpdateErr || !teamUpdateResult) {
        return common.sendErrorResponse(
          res,
          "Error in removing removing member"
        );
      }

      res.send({
        msg: "removed team member successfully",
        project: teamUpdateResult,
      });
    }
  );
};

Projects.prototype.addSection = (req, res) => {
  const projectId = req.body.projectId;
  const sectionObj = {
    name: req.body.sectionName,
    tasks: [],
  };

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Please specify valid project Id");
  }

  projects.updateOne(
    { _id: common.castToObjectId(projectId) },
    {
      $push: { sections: sectionObj },
    },
    (sectionAddErr, sectionAddResult) => {
      if (sectionAddErr || !sectionAddResult) {
        return common.sendErrorResponse(res, "Error in adding the section");
      }

      res.send({
        msg: "Section Added Successfully",
      });
    }
  );
};

Projects.prototype.editSection = (req,res)=>{
  const projectId = req.body.projectId;
  const sectionObj = req.body.section;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Please specify valid project Id");
  }

  projects.updateOne(
    { _id: common.castToObjectId(projectId)},
    {
      $set: { "sections.$[sections]": sectionObj },
    },
    {
      arrayFilters:[
         {"sections._id":sectionObj._id}
      ]
    },
    (sectionAddErr, sectionAddResult) => {
      if (sectionAddErr || !sectionAddResult) {
        return common.sendErrorResponse(res, "Error in Editing the section");
      }

      res.send({
        msg: "Section Edited Successfully",
      });
    }
  );
}

Projects.prototype.removeSection = (req, res) => {
  const projectId = req.body.projectId;
  let sectionId = req.body.sectionId;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Please specify valid project Id");
  }

  if (!common.isObjectId(sectionId)) {
    return common.sendErrorResponse(res, "Please specify valid section Id");
  }

  sectionId = common.castToObjectId(sectionId);

  projects.updateOne(
    {
      _id: common.castToObjectId(projectId),
      "sections._id": sectionId,
    },
    {
      $pull: { sections: { _id: sectionId } },
    },
    (sectionRemoveErr, sectionRemoveResult) => {
      if (sectionRemoveErr || !sectionRemoveResult) {
        return common.sendErrorResponse(res, "Error in removing the section");
      }

      res.send({
        msg: "Section Removed Successfully",
      });
    }
  );
};

module.exports = Projects;
