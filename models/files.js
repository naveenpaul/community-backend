const mongoose = require("mongoose");
const filesSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["EVENT", "POST", "USERPROFILE"],
    },
    orgId: mongoose.Schema.Types.ObjectId,
    ownerId: mongoose.Schema.Types.ObjectId,
    type: String,
    fileName: String,
    location: String,
  },
  { timestamps: true }
);

const Files = mongoose.model("files", filesSchema);
module.exports = Files;
