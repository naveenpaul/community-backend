const express = require("express");
const router = express.Router();
const async = require("async");

const commonUtility = require("../common/commonUtility");
const user = require("../controllers/user");
const tasks = require("../controllers/tasks");
const inventory = require("../controllers/inventory");
const projects = require("../controllers/projects");
const activityLog = require("../controllers/activityLogs");

const common = new commonUtility();
const tasksController = new tasks();
const InventoryController = new inventory();
const projectsController = new projects();
const userController = new user();
const activityLogController = new activityLog();

router.post("/tasks/add", common.authorizeUser, handleAddTask);
router.get("/task/delete/:taskId", common.authorizeUser, handleDeleteTask);
router.post("/tasks/update", common.authorizeUser, handleTaskUpdate);
router.post("/task/updateDueDateRemark", common.authorizeUser, handleTaskUpdateDueDateRemark);
router.get("/task/by/id/:taskId", common.authorizeUser, handleGetTaskById);
router.post("/task/get/all", common.authorizeUser, handleGetAllTasks);
router.post(
  "/task/sections/get/all",
  common.authorizeUser,
  handleGetAllTasksWithSections
);
router.post("/task/add/member", common.authorizeUser, handleTaskAddMember);
router.post(
  "/task/remove/member",
  common.authorizeUser,
  handleTaskRemoveMember
);
router.post(
  "/task/add/checklist",
  common.authorizeUser,
  handleTaskAddChecklist
);
router.post(
  "/task/remove/checklist",
  common.authorizeUser,
  handleTaskRemoveChecklist
);
router.post(
  "/task/update/checklist",
  common.authorizeUser,
  handleTaskUpdateChecklist
);
router.post(
  "/task/add/checklist/item",
  common.authorizeUser,
  handleTaskAddChecklistItem
);
router.post(
  "/task/remove/checklist/item",
  common.authorizeUser,
  handleTaskRemoveChecklistItem
);
router.post(
  "/task/remove/checklist/item",
  common.authorizeUser,
  handleTaskRemoveChecklistItem
);
router.post(
  "/task/update/checklist/item",
  common.authorizeUser,
  handleTaskUpdateChecklistItem
);
router.post(
  "/task/update/inventory",
  common.authorizeUser,
  handleTaskUpdateInventory
);
router.post(
  "/task/progress/update",
  common.authorizeUser,
  handleTaskUpdateProgress
)
router.post(
  "/task/unit/update",
  common.authorizeUser,
  handleTaskUnitUpdate
)
router.get("/task/get/units", common.authorizeUser, getAllUnits);
router.get("/task/user/get/all", common.authorizeUser, getAllMyTasks);

function getAllUnits(req, res) {
  var units = [
    "percent",
    "square meter",
    "meter",
    "numbers",
    "square feet",
    "feet",
    "yard",
    "kilometer",
    "gallons",
    "cubic meter",
  ]
  res.send({
    msg: "Fetched units successfully",
    units: units,
  });
}

function getAllMyTasks(req, res) {
  const userId = common.getUserId(req) || "";

  let findQ = {
    "ownerEmailId._id": userId,
  };

  tasksController.getTasksByQuery(findQ, null, (taskErr, tasks) => {
    res.send({
      msg: "Task fetched successfully",
      tasks: tasks,
    });
  });
}

function handleAddTask(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      tasksController.createTask(
        req,
        res,
        existingUser,
        (taskErr, savedTask) => {
          if (taskErr || !savedTask) {
            return common.sendErrorResponse(res, "Error in creating new task");
          }
          res.send({
            msg: "Task created successfully",
            task: savedTask,
          });
      
          activityLogController.insertLogs(
            {},
            savedTask._id,
            "task",
            "create",
            existingUser
          );
        }
      );
    }
  );
}

function handleDeleteTask(req, res) {
  tasksController.deleteTask(req, res);
}

function handleTaskUpdate(req, res) {
  const userId = common.getUserId(req) || "";
  const task = req.body.task;
  let taskId = task._id;

  if (!common.isObjectId(taskId)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }
  taskId = common.castToObjectId(taskId);

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      
      tasksController.updateTask(
        taskId,
        task,
        (updateTaskErr, updateTaskResult) => {
          if (updateTaskErr || !updateTaskResult) {
            return common.sendErrorResponse(res, "Error in updating task");
          }

          res.send({
            msg: "Updated task successfully",
          });

          activityLogController.insertLogs(
            task,
            taskId,
            "task",
            "update",
            existingUser
          );
        }
      );
    }
  );
}
function handleTaskUpdateDueDateRemark(req,res){
  const userId = common.getUserId(req) || "";
   
  let taskId = req.body.taskId;

  if (!common.isObjectId(taskId)) {
    console.log(taskId);
    
    return common.sendErrorResponse(res, "Enter valid task Id");
  }
  taskId = common.castToObjectId(taskId);

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      
      tasksController.addDueDateInTask(
        taskId,
        req.body.dateDetail,
        (updateTaskErr, updateTaskResult) => {
          if (updateTaskErr || !updateTaskResult) {
            return common.sendErrorResponse(res, "Error in updating task");
          }
          res.send({
            msg: "Updated task successfully",
          });
        }
      );
    }
  );
}


function handleGetTaskById(req, res) {
  const taskId = req.params.taskId;

  if (!common.isObjectId(taskId)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  tasksController.getTaskById(taskId, {}, (taskErr, task) => {
    if (taskErr || !task) {
      return common.sendErrorResponse(res, "Error in getting task");
    }

    res.send({
      msg: "Fetched task successfully",
      task: task,
    });
  });
}

function handleGetAllTasks(req, res) {
  const projectId = req.body.projectId;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Enter valid project Id");
  }

  tasksController.getTasksByProjectId(
    projectId,
    req.body.projection,
    (tasksErr, tasks) => {
      if (tasksErr || !tasks) {
        return common.sendErrorResponse(res, "Error in getting tasks");
      }

      res.send({
        msg: "Got tasks successfully",
        tasks: tasks,
      });
    }
  );
}

function handleGetAllTasksWithSections(req, res) {
  const projectId = req.body.projectId;

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Enter valid project Id");
  }

  async.parallel(
    {
      task: function (callback) {
        tasksController.getTasksByProjectId(
          projectId,
          { taskName: 1,
            dueDate:1,
            originalDueDate:1
          },
          (tasksErr, tasks) => {
            if (tasksErr || !tasks) {
              callback(null, []);
            } else {
              callback(null, tasks);
            }
          }
        );
      },
      project: function (callback) {  
        projectsController.getProjectById(
          projectId,
          { sections: 1 },
          (projectErr, project) => {
            if (projectErr || !project) {
              callback(null, []);
            } else {
              callback(null, project);
            }
          }
        );
      },
    },
    function (asyncErr, result) {
      const tasks = result.task || [];
      const sections = result.project.sections || [];

      res.send({
        tasks: tasks.map((el) => {
          return { id: el._id, taskName: el.taskName ,dueDate: el.dueDate,originalDueDate: el.originalDueDate};
        }),
        sections: sections.map((el) => {
          return { id: el._id, name: el.name };
        }),
      });
    }
  );
}
function handleTaskUpdateProgress(req, res) {
  tasksController.taskUpdateProgress(req, res);
}
function handleTaskUnitUpdate(req, res) {
  tasksController.taskUnitUpdate(req, res);
}
function handleTaskAddMember(req, res) {
  tasksController.taskAddMember(req, res);
}

function handleTaskRemoveMember(req, res) {
  tasksController.taskRemoveMember(req, res);
}

function handleTaskAddChecklist(req, res) {
  tasksController.taskAddChecklist(req, res);
}

function handleTaskRemoveChecklist(req, res) {
  tasksController.taskRemoveChecklist(req, res);
}

function handleTaskUpdateChecklist(req, res) {
  tasksController.taskUpdateChecklist(req, res);
}

function handleTaskAddChecklistItem(req, res) {
  tasksController.taskAddChecklistItem(req, res);
}

function handleTaskRemoveChecklistItem(req, res) {
  tasksController.taskRemoveChecklistItem(req, res);
}

function handleTaskUpdateChecklistItem(req, res) {
  tasksController.taskUpdateChecklistItem(req, res);
}

function handleTaskUpdateInventory(req, res) {
  const taskId = req.body.taskId;
  const userId = common.getUserId(req) || "";

  if (!common.isObjectId(taskId)) {
    return common.sendErrorResponse(res, "Enter valid Task Id");
  }

  if (!common.isObjectId(req.body.inventoryId)) {
    return common.sendErrorResponse(res, "Enter valid Inventory Id");
  }

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      InventoryController.getCurrentStock(
        req.body.inventoryId,
        (currentStock) => {
          if (currentStock > req.body.quantity) {
            tasksController.getTaskById(
              taskId,
              { checklists: 1 },
              (taskErr, task) => {
                if (taskErr || !task) {
                  return common.sendErrorResponse(
                    res,
                    "Error in getting response"
                  );
                } else {
                  tasksController.taskUpdateInventory(
                    req,
                    existingUser,
                    task,
                    (updateStatus) => {
                      if (updateStatus) {
                        res.send({
                          msg: "Inventory updated successfully",
                        });

                        const inventoryObj = {
                          inventoryId: req.body.inventoryId,
                          material: req.body.material,
                          quantity: req.body.quantity,
                          action: req.body.action,
                          taskId: req.body.taskId,
                        };

                        InventoryController.updateInventoryNumbers(
                          inventoryObj,
                          existingUser
                        );
                      }
                    }
                  );
                }
              }
            );
          } else {
            common.sendErrorResponse(
              res,
              "Please enter quantity less than current stock"
            );
          }
        }
      );
    }
  );
}
module.exports = router;
