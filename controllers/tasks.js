const TasksModel = require("../models/tasks");
const TasksTrashModel = require("../models/tasksTrash");
const moment = require("moment");

const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
function Tasks() {}

Tasks.prototype.createTask = (req, res, user, callback) => {
  const task = req.body.task || {};
  delete task._id;

  if (!common.isObjectId(task.teamId)) {
    return common.sendErrorResponse(res, "Enter valid team Id");
  }

  if (!common.isObjectId(task.projectId)) {
    return common.sendErrorResponse(res, "Enter valid project Id");
  }

  if (!common.isObjectId(task.sectionId)) {
    return common.sendErrorResponse(res, "Enter valid section Id");
  }
  let unitUpdateObj = { totalWork: 100, unit: "" };
  let totalProgressObj = {
    unit: "",
    totalProgress: 0,
    totalProgressPercentage: 0,
  };

  const taskModelObj = {
    teamId: task.teamId,
    projectId: task.projectId,
    sectionId: task.sectionId,
    taskName: task.taskName,
    progressUpdate: [],
    sectionName: task.sectionName,
    unitUpdate: unitUpdateObj,
    totalProgress: totalProgressObj,
    members: task.members || [],
    description: task.description,
    dependsOnTaskName: task.dependsOnTaskName,
    dependsOn: task.dependsOn,
    completed: task.completed,
    tags: task.tags,
    attachments: task.attachments,
    checklists: task.checklists,
    ownerEmailId: user,
    labels: task.labels,
    dueDatesRemark: task.dueDatesRemark || [],
  };

  taskModelObj.startDate = task.startDate
    ? new Date(task.startDate)
    : task.startDate;
  taskModelObj.dueDate = task.dueDate ? new Date(task.dueDate) : task.dueDate;
  taskModelObj.originalDueDate = task.dueDate
    ? new Date(task.dueDate)
    : task.dueDate;

  const newTask = new TasksModel(taskModelObj);

  newTask.save(callback);
};

Tasks.prototype.deleteTask = (req, res) => {
  const taskId = req.params.taskId;

  if (!common.isObjectId(taskId)) {
    return common.sendErrorResponse(res, "Enter valid taskId");
  }

  TasksModel.findOneAndDelete(
    { _id: common.castToObjectId(taskId) },
    (taskRemoveErr, removedTask) => {
      if (taskRemoveErr || !removedTask) {
        return common.sendErrorResponse(res, "Error in removing the task");
      }

      res.send({
        msg: "Task removed successfully",
        task: removedTask,
      });

      insertTaskTrash(removedTask);
    }
  );
};

Tasks.prototype.updateTask = (taskId, task, callback) => {
  TasksModel.updateOne({ _id: taskId }, { $set: task }, callback);
};

Tasks.prototype.addDueDateInTask = (taskId, dateDetail, callback) => {
  TasksModel.updateOne(
    { _id: taskId },
    { $push: { dueDatesRemark: { $each: [dateDetail], $position: 0 } } },
    callback
  );
};

Tasks.prototype.getTaskById = (taskId, projection, callback) => {
  TasksModel.findOne(
    { _id: common.castToObjectId(taskId) },
    projection,
    callback
  );
};

Tasks.prototype.getTasksByProjectId = (projectId, projection, callback) => {
  if (!projection) {
    projection = {
      _id: 1,
      taskName: 1,
      ownerEmailId: 1,
      completed: 1,
    };
  }

  TasksModel.find(
    { projectId: common.castToObjectId(projectId) },
    projection,
    callback
  );
};

Tasks.prototype.getTasksByQuery = (findQuery, projection, callback) => {
  if (!projection) {
    projection = {
      _id: 1,
      taskName: 1,
      ownerEmailId: 1,
      completed: 1,
      tags: 1,
      dueDate: 1,
      originalDueDate: 1,
      startDate: 1,
    };
  }

  // TasksModel.find(findQuery, projection).lean().exec(callback);
  TasksModel.find(findQuery, projection, callback);
};

Tasks.prototype.getTasksByQueryLeanReturn = (
  findQuery,
  projection,
  callback
) => {
  if (!projection) {
    projection = {
      _id: 1,
      taskName: 1,
      ownerEmailId: 1,
      completed: 1,
      tags: 1,
      dueDate: 1,
      originalDueDate: 1,
      startDate: 1,
    };
  }

  TasksModel.find(findQuery, projection).lean().exec(callback);
};

Tasks.prototype.taskAddMember = (req, res) => {
  const task = req.body.task;

  if (!task._id) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!common.validateString(task.member)) {
    return common.sendErrorResponse(
      res,
      "Please specify team member details to add"
    );
  }

  TasksModel.updateOne(
    { _id: common.castToObjectId(task._id) },
    { $push: { members: task.member } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in updating team member");
      }

      res.send({
        msg: "Team member updated successfully",
        task: updatedTask,
      });
    }
  );
};

Tasks.prototype.taskAddMember = (req, res) => {
  const task = req.body.task;

  if (!task._id) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!common.validateString(task.member)) {
    return common.sendErrorResponse(
      res,
      "Please specify team member details to add"
    );
  }

  TasksModel.updateOne(
    { _id: common.castToObjectId(task._id) },
    { $push: { members: task.member } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in updating team member");
      }

      res.send({
        msg: "Team member updated successfully",
        task: updatedTask,
      });
    }
  );
};

Tasks.prototype.taskRemoveMember = (req, res) => {
  const task = req.body.task;

  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!common.isObjectId(task.memberId)) {
    return common.sendErrorResponse(res, "Please specify valid member id");
  }

  TasksModel.updateOne(
    { _id: common.castToObjectId(task._id) },
    { $pull: { members: { _id: common.castToObjectId(task.memberId) } } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in removing team member");
      }

      res.send({
        msg: "Team member removed successfully",
        task: updatedTask,
      });
    }
  );
};

Tasks.prototype.taskAddChecklist = (req, res) => {
  const task = req.body.task;

  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!task.checklistName) {
    return common.sendErrorResponse(res, "Please specify checklist name");
  }

  const updateObj = {
    checklistName: task.checklistName,
    items: [],
  };

  TasksModel.updateOne(
    { _id: common.castToObjectId(task._id) },
    { $push: { checklists: updateObj } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in adding checklist item");
      }

      res.send({
        msg: "Checklist added successfully",
        task: updatedTask,
      });
    }
  );
};
Tasks.prototype.taskUnitUpdate = (req, res) => {
  const task = req.body.task;
  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }
  const updateObj = {
    unit: task.unit,
    totalWork: task.totalWork,
  };

  TasksModel.updateOne(
    { _id: common.castToObjectId(task._id) },
    { $set: { unitUpdate: updateObj } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in updating unit");
      }
      res.send({
        msg: "unit updated successfully",
      });
    }
  );
};
Tasks.prototype.taskUpdateProgress = (req, res) => {
  const task = req.body.task;

  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  var progress = (task.workDone / task.totalWork) * 100;
  const updateObj = {
    progress: progress,
    workDone: task.workDone,
    date: task.date,
    remark: task.remark,
    unit: task.unit,
    totalWork: task.totalWork,
    files: task.files,
  };
  totalProgress = task.workDone + task.totalProgress;
  totalProgressPercentage = (totalProgress / task.totalWork) * 100;
  const totalProgressObj = {
    unit: task.unit,
    totalProgressPercentage: totalProgressPercentage,
    totalProgress: totalProgress,
  };

  TasksModel.updateOne(
    { _id: common.castToObjectId(task._id) },
    { $set: { totalProgress: totalProgressObj } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in updating totalprogress");
      }
    }
  );

  TasksModel.updateOne(
    { _id: common.castToObjectId(task._id) },
    { $push: { progressUpdate: updateObj } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in updating progress");
      }

      res.send({
        msg: "Progress updated successfully",
      });
    }
  );
};

Tasks.prototype.taskRemoveChecklist = (req, res) => {
  const task = req.body.task;

  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!common.isObjectId(task.checklistId)) {
    return common.sendErrorResponse(res, "Enter valid checklist Id");
  }

  TasksModel.updateOne(
    { _id: common.castToObjectId(task._id) },
    { $pull: { checklists: { _id: common.castToObjectId(task.checklistId) } } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in removing checklist");
      }

      res.send({
        msg: "Checklist removed successfully",
        task: updatedTask,
      });
    }
  );
};

Tasks.prototype.taskUpdateChecklist = (req, res) => {
  const task = req.body.task;

  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!common.isObjectId(task.checklistId)) {
    return common.sendErrorResponse(res, "Enter valid checklist Id");
  }

  TasksModel.updateOne(
    {
      _id: common.castToObjectId(task._id),
      "checklists._id": common.castToObjectId(task.checklistId),
    },
    { $set: { "checklists.$.checklistName": task.checklistName } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(
          res,
          "Error in updating checklist name"
        );
      }

      res.send({
        msg: "Checklist name updated successfully",
        task: updatedTask,
      });
    }
  );
};

Tasks.prototype.taskAddChecklistItem = (req, res) => {
  const task = req.body.task;

  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!common.isObjectId(task.checklistId)) {
    return common.sendErrorResponse(res, "Enter valid checklist Id");
  }

  const updateObj = {
    itemName: task.item.itemName,
    completed: task.item.completed,
  };

  TasksModel.updateOne(
    {
      _id: common.castToObjectId(task._id),
      "checklists._id": common.castToObjectId(task.checklistId),
    },
    { $push: { "checklists.$.items": updateObj } },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in adding checklist item");
      }

      res.send({
        msg: "Checklist item added successfully",
        task: updatedTask,
      });
    }
  );
};

Tasks.prototype.taskRemoveChecklistItem = (req, res) => {
  const task = req.body.task;

  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!common.isObjectId(task.checklistId)) {
    return common.sendErrorResponse(res, "Enter valid checklist Id");
  }

  if (!common.isObjectId(task.checklistItemId)) {
    return common.sendErrorResponse(res, "Enter valid checklist Item Id");
  }

  TasksModel.updateOne(
    {
      _id: common.castToObjectId(task._id),
      "checklists._id": common.castToObjectId(task.checklistId),
    },
    {
      $pull: {
        "checklists.$.items": {
          _id: common.castToObjectId(task.checklistItemId),
        },
      },
    },
    (taskUpdateErr, updatedTask) => {
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(res, "Error in removing checklist");
      }

      res.send({
        msg: "Checklist item removed successfully",
        task: updatedTask,
      });
    }
  );
};

Tasks.prototype.taskUpdateChecklistItem = (req, res) => {
  const task = req.body.task;

  if (!common.isObjectId(task._id)) {
    return common.sendErrorResponse(res, "Enter valid task Id");
  }

  if (!common.isObjectId(task.checklistId)) {
    return common.sendErrorResponse(res, "Enter valid checklist Id");
  }

  if (!common.isObjectId(task.checklistItemId)) {
    return common.sendErrorResponse(res, "Enter valid checklist Item Id");
  }

  const findQuery = {
    _id: common.castToObjectId(task._id),
  };

  const arrayFilters = [
    { "i._id": common.castToObjectId(task.checklistId) },
    { "j._id": common.castToObjectId(task.checklistItemId) },
  ];

  const updateQuery = {
    "checklists.$[i].items.$[j].itemName": task.item.itemName,
    "checklists.$[i].items.$[j].completed": task.item.completed,
  };

  TasksModel.updateOne(
    findQuery,
    { $set: updateQuery },
    { arrayFilters: arrayFilters },
    (taskUpdateErr, updatedTask) => {
      console.log("task update error:", taskUpdateErr);
      if (taskUpdateErr || !updatedTask) {
        return common.sendErrorResponse(
          res,
          "Error in removing checklist item"
        );
      }

      res.send({
        msg: "Checklist item updated successfully",
        task: updatedTask,
      });
    }
  );
};

Tasks.prototype.taskUpdateInventory = (req, user, task, callback) => {
  const inventoryId = req.body.inventoryId;
  const action = req.body.action;
  const material = req.body.material;
  const unit = req.body.unit;
  const quantity = req.body.quantity;
  const todayDate = moment().format("DD MMM YYYY hh:mm A");
  const taskId = common.castToObjectId(req.body.taskId);

  const subTaskItem = {
    name: `${user.firstName} ${user.lastName} has ${action} ${quantity} ${unit} of ${material} on ${todayDate}`,
    completed: true,
    inventoryAction: action,
  };

  const selectedChecklist = task.checklists.findIndex((el) => {
    return el.forInventory == true && el.inventoryId == inventoryId;
  });

  if (selectedChecklist > -1) {
    task.checklists[selectedChecklist]["list"].push(subTaskItem);
  } else {
    task.checklists.push({
      forInventory: true,
      inventoryId: inventoryId,
      title: `Material Tracking - ${material}`,
      list: [subTaskItem],
    });
  }

  TasksModel.updateOne(
    { _id: taskId },
    { $set: task },
    (taskUpdateErr, taskUpdate) => {
      if (taskUpdateErr || !taskUpdate) {
        return common.sendErrorResponse(res, "Error in updating the task");
      } else {
        callback(true);
      }
    }
  );
};

const insertTaskTrash = (task) => {
  if (task) {
    delete task._id;

    const newTrashTask = new TasksTrashModel(task);
    newTrashTask.save((trashTaskErr, trashTask) => {});
  }
};

module.exports = Tasks;
