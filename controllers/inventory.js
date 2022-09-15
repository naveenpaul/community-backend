const Inventory = require("../models/inventory");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

const reader = require('xlsx');

function InventoryController() {}

InventoryController.prototype.addExcelFileInventory = (filepath,projectId,teamId,response) =>{

    const file = reader.readFile(filepath);
  
    let data = []

    //valid units
    //const units = ['Kgs', 'Nos', 'Quintal', 'Feet', 'Meters', 'Pounds', 'Bags', 'Bricks', 'Gallons', 'CUM', 'SQM', 'SQF'];
    // !(units.includes(res.unit))
    
    const sheets = file.SheetNames
    
    let status;

    for(let i = 0; i < sheets.length; i++)
    {
    const temp = reader.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]])

    temp.forEach((res) => {
        res.projectId = projectId;
        res.teamId = teamId;

        //property check
        const materialPropertyCheck = 'material' in res;
        const unitPropertyCheck = 'unit' in res;

        //property and unit value check
        if(!materialPropertyCheck || !unitPropertyCheck)
        {
          status = true;
        }
          
        data.push(res);
    })
    }
    if(status)
      return common.sendErrorResponse(response,"Wrong Excel format");

    //Bulk insert into db inventory collection
    try {
      Inventory.insertMany(data);
  } catch (e) {
      return common.sendErrorResponse(response,"error in inserting data into db")
  }

    response.send({msg:"Excel file uploaded successfully"});
}

InventoryController.prototype.listWarehouse = (inventoryId,projection,callback) =>
{
  Inventory.find({ _id: inventoryId }, projection)
  .lean()
  .exec((inventoryListErr, warehouseList) => {
    if (inventoryListErr || !warehouseList) {
      callback([]);
    } else {
      callback(warehouseList);
    }
  });
}
InventoryController.prototype.consumeInventory = (inventoryId, inventoryObj, callback) => {
 
  let updateObj = {};
  
  
  // if (inventoryObj.action == "consumed") {
  //   updateObj = {
  //       consumedStock: +inventoryObj.quantity,
  //       currentStock: -inventoryObj.quantity,
  //   };
  // } else if (inventoryObj.action == "returned") {
  //   updateObj = {
  //       currentStock: +inventoryObj.quantity,
  //   };
  // }
  // Inventory.updateOne({ _id: inventoryId }, { $inc: updateObj }, (err, data) => {
          
  //         callback(true);
  //       });

        Inventory.updateOne( { _id: inventoryId }, { $push: { consumptionActivity: inventoryObj } }, (warehouseUpdateErr, warehouseUpdateResult) => {
          if (warehouseUpdateErr || !warehouseUpdateResult) {
            callback(false);
          } else {
            let updateObj = {};
    
           if (inventoryObj.action == "consumed") {
    updateObj = {
        consumedStock: +inventoryObj.quantity,
        currentStock: -inventoryObj.quantity,
    };
  } else if (inventoryObj.action == "returned") {
    updateObj = {
        currentStock: +inventoryObj.quantity,
    };
  }
            Inventory.updateOne( { _id: inventoryId }, { $inc: updateObj }, (err, data) => {
              callback(true);
            });
          }
        }
      );
};


InventoryController.prototype.addInventoryWarehouse = (inventoryId, warehouse, callback) => {
  Inventory.updateOne( { _id: inventoryId }, { $push: { materialActivity: warehouse } }, (warehouseUpdateErr, warehouseUpdateResult) => {
      if (warehouseUpdateErr || !warehouseUpdateResult) {
        callback(false);
      } else {
        let updateObj = {};
        
        if (warehouse.action == "consumed") {
          updateObj = {
              consumedStock: +warehouse.quantity,
              currentStock: -warehouse.quantity,
          };
        }
        else if (warehouse.action == 'purchased') {
          updateObj = {
            currentStock: +warehouse.quantity 
          }
        } else if (warehouse.action == 'returned') {
          updateObj = {
            currentStock: -warehouse.quantity 
          }
        }
        Inventory.updateOne( { _id: inventoryId }, { $inc: updateObj }, (err, data) => {
          callback(true);
        });
      }
    }
  );
};

InventoryController.prototype.addInventory = (inventory, callback) => {
  const newInventory = new Inventory(inventory);
  newInventory.save(callback);
};

InventoryController.prototype.listInventory = (
  projectId,
  projection,
  callback
) => {
  Inventory.find({ projectId: projectId }, projection)
    .lean()
    .exec((inventoryListErr, inventoryList) => {
      if (inventoryListErr || !inventoryList) {
        callback([]);
      } else {
        callback(inventoryList);
      }
    });
};

InventoryController.prototype.deleteInventory = (inventoryId, callback) => {
  Inventory.remove({ _id: inventoryId }, (deleteErr, deleteResult) => {
    if (deleteErr || !deleteResult) {
      callback(false);
    } else {
      callback(true);
    }
  });
};

InventoryController.prototype.getInventoryById = (inventoryId, projection, callback) => {
  Inventory.findOne({_id: inventoryId}, projection, (inventoryByIdErr, inventory) => {
    if (inventoryByIdErr || !inventory) {
      callback({});
    } else {
      callback(inventory);
    }
  })
}

InventoryController.prototype.getCurrentStock = (inventoryId, callback) => {
  Inventory.findOne({_id: inventoryId}, {currentStock: 1}, (inventoryByIdErr, inventory) => {
    if (inventoryByIdErr || !inventory) {
      callback(0)
    } else {
      callback(inventory.currentStock);
    }
  })
}

InventoryController.prototype.updateInventoryNumbers = (inventoryObj, user) => {
  let updateObj = {};

  if (inventoryObj.action == "consumed") {
      updateObj = {
        $inc: {
          consumedStock: +inventoryObj.quantity,
          currentStock: -inventoryObj.quantity,
        },
      };
  } else if (inventoryObj.action == "returned") {
      updateObj = {
        $inc: {
          currentStock: +inventoryObj.quantity,
        },
      };
  }

  updateObj['$push'] = {
    consumptionActivity: {
      sourceId: inventoryObj.taskId,
      action: inventoryObj.action,
      owner: user,
      date: new Date(),
      quantity: inventoryObj.quantity,
      note: inventoryObj.note,
    },
  };

  Inventory.updateOne({ _id: common.castToObjectId(inventoryObj.inventoryId) }, updateObj, (err, data) => {});
};

module.exports = InventoryController;