const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    teamId: mongoose.Schema.Types.ObjectId,
    projectId: mongoose.Schema.Types.ObjectId,
    material: String,
    unit: String,
    materialActivity: [{
      gstNumber: String,
      invoiceNumber: String,
      note: String,
      quantity: Number,
      date: Date,
      action: {
        type: String,
        enum: ["purchased", "returned","consumed"],
      },
      owner: {
        _id: mongoose.Schema.Types.ObjectId,
        firstName: String,
        lastName: String,
        emailId: String,
        mobileNumber: Number,
        profilePicUrl: String,
      },
      files: [
        {
          name: String,
          url: String,
          date: Date,
        }
      ],
    }],
    consumedStock: {
      type: Number,
      default: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model("inventory", inventorySchema, "inventory");

module.exports = Inventory;