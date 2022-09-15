const express = require("express");
const router = express.Router();
const moment = require("moment");
const _ = require("lodash");

const commonUtility = require("../common/commonUtility");
const tasks = require("../controllers/tasks");
const projects = require("../controllers/projects");

const common = new commonUtility();
const tasksController = new tasks();
const projectsController = new projects();

router.post("/dashboard/summary", common.authorizeUser, handleDashboardSummary);

function handleDashboardSummary(req, res) {
  const projectId = req.body.projectId;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Please pass valid project Id");
  }

  projectsController.getProjectById(projectId, {}, (projectErr, project) => {
    if (projectErr || !project) {
      return common.sendErrorResponse(res, "Error in getting project details");
    }

    if (project.startDate && project.endDate) {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);

      const findQuery = {
        projectId: common.castToObjectId(projectId),
        dueDate: { $ne: null },
      };

      const projection = {
        taskName: 1,
        members: 1,
        startDate: 1,
        dueDate: 1,
        originalDueDate: 1,
        completed: 1,
        sectionName: 1,
      };

      tasksController.getTasksByQueryLeanReturn(
        findQuery,
        projection,
        (tasksErr, tasks) => {
          if (tasksErr || !tasks) {
            return common.sendErrorResponse(
              res,
              "Error in getting the tasks list"
            );
          }

          tasks = tasks || [];
          tasks.forEach((task) => {
            if (!task.members || (task.members && task.members.length == 0)) {
              task.members = [
                {
                  _id: "",
                  firstName: "Unassigned",
                  lastName: "",
                  emailId: "unassigned",
                  profilePicUrl: "https://ui-avatars.com/api/?name=Unassigned",
                },
              ];
            }
            task.dueDateFormatted = moment(task.dueDate).format("DD MMM YYYY");
            task.originalDueDateFormatted = moment(
              task.originalDueDateFormatted
            ).format("DD MMM YYYY");
          });

          const overdueTasks = getOverdueTasks(tasks);
          const groupedTasks = getGroupedOverdueTasks(overdueTasks);

          res.send({
            timeline: getDashboardTimeline(startDate, endDate, tasks),
            dueTasks: overdueTasks,
            dueTasksByTeam: groupedTasks.team,
            dueTasksBySection: groupedTasks.section,
          });
        }
      );
    } else {
      res.send({
        timeline: [],
      });
    }
  });
}

function getOverdueTasks(tasks) {
  const dueTasks = [];

  tasks.forEach((task) => {
    if (
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      !task.completed
    ) {
      dueTasks.push(task);
    }
  });
  return dueTasks;
}

function getGroupedOverdueTasks(tasks) {
  const expandedTasks = [];
  tasks.forEach((task) => {
    task.members.forEach((member) => {
      task.ownerEmailId = member.emailId;
      task.fullName = member.firstName + " " + member.lastName;
      task.profilePicUrl = member.profilePicUrl;
      expandedTasks.push(task);
    });
  });

  const groupedTask = _.groupBy(expandedTasks, "ownerEmailId");
  const groupedTaskSection = _.groupBy(expandedTasks, "sectionName");
  const dueTasksByTeam = [];
  const dueTasksBySection = [];

  Object.keys(groupedTask).forEach((member) => {
    dueTasksByTeam.push({
      emailId: member,
      fullName: groupedTask[member][0]
        ? groupedTask[member][0]["fullName"]
        : "",
      value: groupedTask[member].length,
      tasks: groupedTask[member],
    });
  });

  Object.keys(groupedTaskSection).forEach((member) => {
    dueTasksBySection.push({
      sectionName: groupedTaskSection[member][0]
        ? groupedTaskSection[member][0].sectionName
        : "",
      value: groupedTaskSection[member].length,
      tasks: groupedTaskSection[member],
    });
  });

  return {
    team: dueTasksByTeam,
    section: dueTasksBySection,
  };
}

function getDashboardTimeline(startDate, endDate, tasks) {
  const numDays = moment(endDate).diff(moment(startDate), "days");
  const dateRange = [moment(startDate).format("DD MMM YYYY")];
  const timelineGraphData = [];

  for (i = 1; i <= numDays; i++) {
    dateRange.push(moment(startDate).add(i, "days").format("DD MMM YYYY"));
  }

  const tasksGrouped = _.groupBy(tasks, "dueDateFormatted");

  dateRange.forEach((date) => {
    let open = 0,
      completed = 0;

    if (tasksGrouped[date]) {
      tasksGrouped[date].forEach((task) => {
        if (task.completed) completed++;
        else open++;
      });
    }

    timelineGraphData.push({
      date: new Date(date).getTime(),
      open: open,
      completed: completed,
    });

    (open = 0), (completed = 0);
  });

  return timelineGraphData;
}

module.exports = router;
