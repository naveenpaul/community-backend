const express = require("express");
const async = require("async");
const router = express.Router();
const _ = require("lodash");
const moment = require("moment");

const commonUtility = require("../common/commonUtility");
const user = require("../controllers/user");
const projects = require("../controllers/projects");
const teams = require("../controllers/teams");
const files = require("../controllers/files");
const templates = require("../controllers/templates");
const tasks = require("../controllers/tasks");
const activityLog = require("../controllers/activityLogs");

const common = new commonUtility();
const projectsController = new projects();
const teamsController = new teams();
const filesController = new files();
const templatesController = new templates();
const userController = new user();
const tasksController = new tasks();
const activityLogController = new activityLog();

router.post("/create/project", common.authorizeUser, handleCreateProject);
router.post("/project/update", common.authorizeUser, handleUpdateProject);
router.post("/list/projects", common.authorizeUser, handleListProjects);
router.post("/project/user/access", common.authorizeUser, handleUserAccess);
router.post(
  "/list/recent/projects",
  common.authorizeUser,
  handleListRecentProjects
);
router.post("/project/by/id", common.authorizeUser, handleProjectById);
router.post(
  "/project/tasks/by/id",
  common.authorizeUser,
  handleProjectTasksById
);
router.post(
  "/project/tasks/by/id/:filter",
  common.authorizeUser,
  handleProjectTasksById
);
router.get(
  "/project/get/all/team/members",
  common.authorizeUser,
  handleGetAllTeamMembers
);
router.post(
  "/project/add/team/member",
  common.authorizeUser,
  handleAddTeamMemberProject
);
router.post(
  "/project/remove/team/member",
  common.authorizeUser,
  handleRemoveTeamMember
);
router.get(
  "/project/delete/:projectId",
  common.authorizeUser,
  handleDeleteProject
);
router.post("/project/get/files", common.authorizeUser, getProjectFiles);
router.post("/project/add/section", common.authorizeUser, handleAddSection);
router.post(
  "/project/remove/section",
  common.authorizeUser,
  handleRemoveSection
);
router.post("/project/edit/section", common.authorizeUser, handleEditSection);

function handleCreateProject(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      if (!req.body.templateId) {
        projectsController.createProject(
          req,
          res,
          existingUser,
          null,
          (projectErr, savedProject) => {
            if (projectErr || !savedProject) {
              return common.sendErrorResponse(
                res,
                "Error in creating new project"
              );
            }

            res.send({
              msg: "Project created successfully",
              project: savedProject,
            });

            activityLogController.insertLogs(
              {},
              savedProject._id,
              "project",
              "create",
              existingUser
            );
          }
        );
      } else {
        templatesController.getTemplateById(
          res,
          req.body.templateId,
          (template) => {
            template.sections.forEach((section) => {
              delete section.tasks;
            });

            projectsController.createProject(
              req,
              res,
              existingUser,
              template,
              (projectErr, savedProject) => {
                if (projectErr || !savedProject) {
                  return common.sendErrorResponse(
                    res,
                    "Error in creating new project"
                  );
                }

                res.send({
                  msg: "Project created successfully",
                  project: savedProject,
                });

                activityLogController.insertLogs(
                  {},
                  savedProject._id,
                  "project",
                  "create",
                  existingUser
                );
              }
            );
          }
        );
      }
    }
  );
}

function handleUpdateProject(req, res) {
  const userId = common.getUserId(req) || "";
  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      projectsController.updateProject(
        req,
        res,
        existingUser,
        (projectErr, updateProject) => {
          if (projectErr || !updateProject) {
            console.log(projectErr);
            return common.sendErrorResponse(
              res,
              "Error in updating new project"
            );
          }

          res.send({
            msg: "Project updated successfully",
          });
          // activityLogController.insertLogs({}, savedProject._id, 'project', 'create', existingUser)
        }
      );
    }
  );
}

function handleGetAllTeamMembers(req, res) {
  const projectId = req.query.projectId;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid project id"
    );
  }

  projectsController.getAllTeamMembers(
    projectId,
    (teamMembersErr, teamMembers) => {
      if (teamMembersErr || !teamMembers) {
        return res.send({
          msg: "Error in getting team members",
          teamMembers: [],
        });
      }

      teamMembers = teamMembers || {} ? teamMembers.teamMembers : [];

      teamMembers.forEach((member) => {
        member.fullName = member.firstName + " " + member.lastName;
      });

      return res.send({
        msg: "Successfully got team members",
        teamMembers: teamMembers,
      });
    }
  );
}

function handleDeleteProject(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      projectsController.deleteProject(req, res, existingUser);
    }
  );
}

function getProjectFiles(req, res) {
  const projectId = req.body.projectId;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid project id"
    );
  }

  projectsController.getProjectFiles(projectId, (projectErr, projects) => {
    if (projectErr || !projects) {
      return common.sendErrorResponse(
        res,
        "Error in getting project files list"
      );
    }

    const sectionIds = [];
    const fileDirColor = "#555";
    const filesHierarchy = [];
    projects.sections = projects.sections || [];

    projects.sections.forEach((section) => {
      sectionIds.push(section._id);
      filesHierarchy.push({
        data: {
          sectionId: section._id,
          name: section.name,
          files: 0,
          kind: "dir",
          color: fileDirColor,
        },
        children: [],
      });
    });

    if (sectionIds.length > 0) {
      const query = {
        projectId: projectId,
        sectionId: { $in: sectionIds },
      };
      const projection = {
        _id: 1,
        type: 1,
        fileName: 1,
        uniqFileName: 1,
        sectionId: 1,
      };

      filesController.getFilesByQuery(query, projection, (files) => {
        const filesBySectionId = _.groupBy(files, (file) => file.sectionId);

        filesHierarchy.forEach((file) => {
          const selectedFile = filesBySectionId[file.data.sectionId];

          if (selectedFile) {
            file["data"]["files"] = selectedFile.length || 0;

            selectedFile.forEach((el) => {
              file["children"].push({
                data: {
                  fileId: el._id,
                  name: el.fileName,
                  kind: el.type,
                  link: el.uniqFileName,
                },
              });
            });
          }
        });

        res.send({
          msg: "Successfully got files",
          files: filesHierarchy,
        });
      });
    }
  });
}

function handleProjectById(req, res) {
  const projectId = req.body.projectId;
  const projection = req.body.projection || {};

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid project id"
    );
  }

  projectsController.getProjectById(
    projectId,
    projection,
    (projectErr, project) => {
      if (projectErr || !project) {
        return common.sendErrorResponse(res, "Error in getting project");
      }

      res.send({
        msg: "Successfully got the project",
        project: project,
      });
    }
  );
}

function handleProjectTasksById(req, res) {
  const userId = common.getUserId(req) || "";

  const projectId = req.body.projectId;
  const teamId = req.body.teamId;
  const projectProjection = req.body.projectProjection || {};
  const taskProjection = req.body.taskProjection || {};

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(
      res,
      "Please specifiy the valid project id"
    );
  }

  if (!common.isObjectId(teamId)) {
    return common.sendErrorResponse(res, "Please specifiy the valid team id");
  }

  taskProjection.ownerEmailId = 1;

  async.parallel(
    {
      project: function (callback) {
        projectsController.getProjectById(
          projectId,
          projectProjection,
          (projectErr, project) => {
            if (projectErr || !project) {
              return callback(null, {});
            } else {
              callback(null, project);
            }
          }
        );
      },
      tasks: function (callback) {
        const findQuery = {
          projectId: common.castToObjectId(projectId),
        };

        teamsController.getAllTeamMembers(teamId, (teamMembers) => {
          teamMembers = teamMembers || [];
          const liu = teamMembers.find((el) => el._id.toString() == userId);

          if (liu && liu.contractor) {
            findQuery["members.emailId"] = {
              $in: [liu.emailId],
            };
          }
          tasksController.getTasksByQuery(
            findQuery,
            taskProjection,
            (tasksErr, tasks) => {
              if (tasksErr || !tasks) {
                return callback(null, []);
              }
              callback(null, tasks);
            }
          );
        });
      },
    },
    function (asyncErr, result) {
      const project = result.project || {};
      let tasks = result.tasks || [];
      const sectionWithTasks = {};

      const filter = req.params.filter;

      if (filter === "overdueTask") {
        tasks.forEach((task) => {
          if (
            task.dueDate !== null &&
            moment().isSame(task.dueDate, "date") &&
            moment().isSame(task.dueDate, "year") &&
            moment().isSame(task.dueDate, "month")
          ) {
          } else if (task.dueDate !== null && moment().isAfter(task.dueDate)) {
            if (!sectionWithTasks[task.sectionId]) {
              sectionWithTasks[task.sectionId] = [task];
            } else {
              sectionWithTasks[task.sectionId].push(task);
            }
          }
        });
      } else if (filter === "myTask") {
        tasks.forEach((task) => {
          if (
            JSON.stringify(task.ownerEmailId._id) === JSON.stringify(userId)
          ) {
            if (!sectionWithTasks[task.sectionId]) {
              sectionWithTasks[task.sectionId] = [task];
            } else {
              sectionWithTasks[task.sectionId].push(task);
            }
          }
        });
      } else if (filter === "openedTask") {
        tasks.forEach((task) => {
          if (!task.completed) {
            if (!sectionWithTasks[task.sectionId]) {
              sectionWithTasks[task.sectionId] = [task];
            } else {
              sectionWithTasks[task.sectionId].push(task);
            }
          }
        });
      } else if (filter === "closedTask") {
        tasks.forEach((task) => {
          if (task.completed) {
            if (!sectionWithTasks[task.sectionId]) {
              sectionWithTasks[task.sectionId] = [task];
            } else {
              sectionWithTasks[task.sectionId].push(task);
            }
          }
        });
      } else {
        tasks.forEach((task) => {
          if (!sectionWithTasks[task.sectionId]) {
            sectionWithTasks[task.sectionId] = [task];
          } else {
            sectionWithTasks[task.sectionId].push(task);
          }
        });
      }

      if (project.sections) {
        tasks = [];
        project.sections.forEach((section) => {
          section.isActive = true;
          section.tasks = sectionWithTasks[section._id] || [];
          tasks = tasks.concat(section.tasks);
        });
      }
      res.send({
        project: project,
        tasks: tasks,
      });
    }
  );
}

function handleListProjects(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      projectsController.listProjects(req, res, existingUser, (projectList) => {
        if (projectList && projectList[0]) {
          projectList.forEach(function (el) {
            el.img = common.generateImg(el.projectName);
          });
        }

        res.send({
          msg: "Successfully got project list",
          projects: projectList,
        });
      });
    }
  );
}

function handleListRecentProjects(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      projectsController.listRecentProjects(
        req,
        res,
        existingUser,
        (projectList) => {
          projectList = projectList || [];
          const projects = [];

          projectList.forEach((el) => {
            projects.push({
              members: el.teamMembers.length + " members",
              name: el.projectName,
              link: "/user-dashboard/list/" + el.teamId + "/" + el._id,
              teamId: el.teamId,
              city: el.city,
              _id: el._id,
              img: common.generateImg(el.projectName),
            });
          });

          res.send({
            msg: "Successfully got project list",
            projects: projects,
          });
        }
      );
    }
  );
}

function handleAddTeamMemberProject(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      projectsController.addTeamMember(req, res, existingUser);
    }
  );
}

function handleRemoveTeamMember(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      projectsController.removeTeamMember(req, res, existingUser);
    }
  );
}

function handleUserAccess(req, res) {
  const userId = common.getUserId(req) || "";
  const projectId = req.body.projectId;
  const teamId = req.body.teamId;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Please enter correct project Id");
  }

  async.parallel(
    {
      projectViewAccess: function (callback) {
        projectsController.getUserAccess(userId, projectId, (userAccess) => {
          // res.send({
          //   userAccess: userAccess
          // })
          callback(null, userAccess);
        });
      },
      contractorAccess: function (callback) {
        if (teamId) {
          teamsController.isContractor(userId, teamId, (isContractor) => {
            callback(null, isContractor);
          });
        } else {
          callback(null, false);
        }
      },
    },
    function (asyncErr, result) {
      res.send({
        userAccess: result.projectViewAccess,
        isContractor: result.contractorAccess,
      });
    }
  );
}

function handleAddSection(req, res) {
  projectsController.addSection(req, res);
}

function handleRemoveSection(req, res) {
  projectsController.removeSection(req, res);
}

function handleEditSection(req, res) {
  projectsController.editSection(req, res);
}

module.exports = router;
