const express = require("express");
const router = express.Router();

const commonUtility = require("../common/commonUtility");
const inventory = require("../controllers/inventory");
const user = require("../controllers/user");
const activityLog = require("../controllers/activityLogs");

const Inventory = require("../models/inventory");

const common = new commonUtility();
const inventoryController = new inventory();
const userController = new user();
const activityLogController = new activityLog();

router.post("/inventory/add", common.authorizeUser, handleAddInventory);
router.post(
  "/inventory/warehouse/add",
  common.authorizeUser,
  handleAddWarehouse
);
router.get(
  "/inventory/delete/:inventoryId",
  common.authorizeUser,
  handleDeleteInventory
);
router.post("/inventory/list", common.authorizeUser, handleListInventory);
router.post(
  "/inventory/current/stock",
  common.authorizeUser,
  handleInventoryCurrentStock
);
router.post(
  "/inventory/activity",
  common.authorizeUser,
  handleInventoryActivity
);
router.post(
  "/inventory/upload/excel/:projectId/:teamId",
  common.authorizeUser,
  handleUploadExcel
);

router.post(
  "/inventory/warehouse/activity",
  common.authorizeUser,
  handleAddWarehouse
);
router.post(
  "/inventory/consumeInventory",
  common.authorizeUser,
  handleConsumeInventory
);
router.post(
  "/inventory/warehouse/list",
  common.authorizeUser,
  handleListWarehouse
);

function handleListWarehouse(req, res) {
  const inventoryId = req.body.inventoryId;
  const projection = {
    purchaseActivity: 1,
  };
  inventoryController.listWarehouse(inventoryId, projection, (status) => {
    if (status) res.send(status);
    else res.send({ msg: "error in retrieving warehouse list" });
  });
}

function handleConsumeInventory(req, res) {
  let inventoryId = req.body.inventoryId;
  if (!common.isObjectId(inventoryId)) {
    return common.sendErrorResponse(res, "Please send proper inventory Id");
  }
  inventoryId = common.castToObjectId(inventoryId);
  const inventoryObj = {
    sourceId: req.body.consume.sourceId,
    action: req.body.consume.action,
    date: req.body.consume.date,
    quantity: req.body.consume.quantity,
    note: req.body.consume.note,
  };
  // console.log(inventoryObj);
  inventoryController.consumeInventory(
    inventoryId,
    inventoryObj,
    (updateStatus) => {
      if (updateStatus) {
        res.send({
          msg: "Inventory updated successfully",
        });
      } else {
        common.sendErrorResponse(res, "Error in updating inventory.");
      }
    }
  );
}

function handleAddWarehouse(req, res) {
  const userId = req.body.userId;
  let inventoryId = req.body.inventoryId;

  if (!common.isObjectId(inventoryId)) {
    return common.sendErrorResponse(res, "Please send proper inventory Id");
  }

  inventoryId = common.castToObjectId(inventoryId);
  userController.findUserByUserId(
    userId,
    common.getUserDetailsFields(),
    (err, existingUser) => {
      const warehouse = {
        gstNumber: req.body.warehouse.gstNumber,
        invoiceNumber: req.body.warehouse.invoiceNumber,
        note: req.body.warehouse.note,
        quantity: req.body.warehouse.quantity,
        date: req.body.warehouse.date,
        action: req.body.warehouse.action,
        owner: existingUser,
        files: req.body.warehouse.files,
      };
      inventoryController.addInventoryWarehouse(
        inventoryId,
        warehouse,
        (updateStatus) => {
          if (updateStatus) {
            res.send({
              msg: "Inventory updated to warehouse successfully",
            });
          } else {
            common.sendErrorResponse(
              res,
              "Error in updating inventory to warehouse"
            );
          }
        }
      );
    }
  );
}

function handleAddInventory(req, res) {
  let userId = common.getUserId(req) || "";
  userId = common.castToObjectId(userId);

  if (!common.isObjectId(req.body.teamId)) {
    return common.sendErrorResponse(res, "Enter valid team Id");
  }

  if (!common.isObjectId(req.body.projectId)) {
    return common.sendErrorResponse(res, "Enter valid project Id");
  }

  userController.findUserByUserId(
    common.castToObjectId(userId),
    common.getUserDetailsFields(),
    (err, existingUser) => {
      const inventory = {
        teamId: req.body.teamId,
        projectId: req.body.projectId,
        material: req.body.material,
        unit: req.body.unit,
        date: new Date(),
        owner: existingUser || {},
      };

      inventoryController.addInventory(
        inventory,
        (inventoryErr, newInventory) => {
          if (inventoryErr || !newInventory) {
            return common.sendErrorResponse(res, "Error in add inventory");
          }

          res.send({
            msg: "Inventory added successfully",
          });
        }
      );
    }
  );
}

function handleDeleteInventory(req, res) {
  let inventoryId = req.params.inventoryId;

  if (!common.isObjectId(inventoryId)) {
    return common.sendErrorResponse(res, "Enter valid inventory Id");
  }
  inventoryId = common.castToObjectId(inventoryId);

  inventoryController.deleteInventory(inventoryId, (status) => {
    if (!status) {
      return common.sendErrorResponse(res, "Error in deleting the inventory");
    }

    res.send({
      msg: "Inventory deleted successfully",
    });
  });
}

function handleListInventory(req, res) {
  let projectId = req.body.projectId;
  let projection = req.body.projection;

  if (!projection) {
    projection = {
      material: 1,
      unit: 1,
      consumedStock: 1,
      currentStock: 1,
    };
  }

  if (!common.isObjectId(projectId)) {
    return common.sendErrorResponse(res, "Enter valid project Id");
  }
  projectId = common.castToObjectId(projectId);

  inventoryController.listInventory(projectId, projection, (inventoryList) => {
    inventoryList.forEach((inventory) => {
      inventory.rateOfConsumption =
        inventory.currentStock > 0
          ? (
              ((inventory.consumedStock || 0) * 100) /
              +inventory.currentStock
            ).toFixed(2) + "%"
          : "0%";
    });
    res.send({
      inventoryList: inventoryList,
    });
  });
}

function handleInventoryCurrentStock(req, res) {
  let inventoryId = req.body.inventoryId;

  if (!common.isObjectId(inventoryId)) {
    return common.sendErrorResponse(res, "Enter valid inventory Id");
  }

  inventoryId = common.castToObjectId(inventoryId);

  inventoryController.getInventoryById(
    inventoryId,
    { currentStock: 1 },
    (inventory) => {
      res.send({
        currentStock: inventory.currentStock || 0,
      });
    }
  );
}

function handleInventoryActivity(req, res) {
  let inventoryId = req.body.inventoryId;

  if (!common.isObjectId(inventoryId)) {
    return common.sendErrorResponse(res, "Enter valid inventory Id");
  }

  inventoryId = common.castToObjectId(inventoryId);

  inventoryController.getInventoryById(
    inventoryId,
    {
      material: 1,
      unit: 1,
      materialActivity: 1,
      purchaseActivity: 1,
      consumptionActivity: 1,
    },
    (inventory) => {
      res.send({
        materialActivity: inventory.materialActivity || [],
        purchaseActivity: inventory.purchaseActivity || [],
        consumptionActivity: inventory.consumptionActivity || [],
        materialName: inventory.material,
        unit: inventory.unit,
      });
    }
  );
}

function handleUploadExcel(req, res) {
  const files = req.files || [];
  const projectId = req.params.projectId;
  const teamId = req.params.teamId;
  const filepath = files[0].path;

  inventoryController.addExcelFileInventory(filepath, projectId, teamId, res);
}
module.exports = router;
