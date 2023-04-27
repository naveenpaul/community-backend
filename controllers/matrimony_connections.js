const CommonUtility = require("../common/commonUtility");
const matrimonyConnections = require("../models/matrimony_connections");
const common = new CommonUtility();
const matrimonyUserControl = require("../controllers/matrimony_user");
const matrimonyUserController = new matrimonyUserControl();
function MatrimonyConnections() {}

MatrimonyConnections.prototype.addRequest = (req, user, callback) => {
  let request = {
    ownerId: user._id,
    ownerName: user.name,
    ownerContact: user.contactNumber,
    receiverId: common.castToObjectId(req.body.receiverId),
    receiverName: req.body.receiverName,
    receiverContact: "",
  };

  matrimonyUserController.getUserContactNumber(req, (err, data) => {
    if (err) return callback(err, data);
    console.log(data);
    // return callback(err,data);
    request.receiverContact = data[0].contactNumber;
    const newRequest = matrimonyConnections({ ...request });
    newRequest.save(callback);
  });
};

MatrimonyConnections.prototype.updateConnectionStatus = (req, user, callback) => {
  const connectionId = common.castToObjectId(req.body.connectionId);
  console.log(connectionId);
  console.log(user._id);
  console.log(req.body.connectionResponse);
  matrimonyConnections
    .findOneAndUpdate(
      { _id: connectionId, receiverId: common.castToObjectId(user._id) },
      { $set: { status: req.body.connectionResponse } }
    )
    .exec(callback);
};
MatrimonyConnections.prototype.cancelRequest = (req, user, callback) => {
  const connectionId = common.castToObjectId(req.body.connectionId);
  matrimonyConnections.deleteOne({ _id: connectionId, ownerId: user._id }, callback);
};

MatrimonyConnections.prototype.getConnectionFeed = (req, user, callback) => {
  let pageNumber = parseInt(req.params.pageNumber);
  const limit = 10;
  const offset = (pageNumber - 1) * limit;
  // console.log(req.query.type);
  const type = req.query.type;
  var filter = { _id: "0" };

  if (type == "RECEIVED") {
    filter = { receiverId: user._id, status: "PENDING" };
  } else if (type == "SENT") {
    filter = { ownerId: user._id, status: "PENDING" };
  } else if (type == "ACCEPTED") {
    filter = {
      $or: [
        { receiverId: user._id, status: "ACCEPTED" },
        { ownerId: user._id, status: "ACCEPTED" },
      ],
    };
  }

  // console.log(filter);
  matrimonyConnections
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean()
    .exec((err, data) => {
      let filteredData = [];
      switch (type) {
        case "RECEIVED":
          filteredData = data.map((e) => {
            return {
              profilePicUrl:
                "https://dev-oasis-project-files.s3.ap-south-1.amazonaws.com/" +
                "matrimony/" +
                e.ownerId +
                "/" +
                0 +
                ".jpg",
              fullName: e.ownerName,
              contactNumber: null,
              id: e._id,
              type: type,
              createdAt: e.createdAt,
            };
          });
          break;
        case "SENT":
          filteredData = data.map((e) => {
            return {
              profilePicUrl:
                "https://dev-oasis-project-files.s3.ap-south-1.amazonaws.com/" +
                "matrimony/" +
                e.receiverId +
                "/" +
                0 +
                ".jpg",
              fullName: e.receiverName,
              contactNumber: null,
              id: e._id,
              type: type,
              createdAt: e.createdAt,
            };
          });
          break;
        case "ACCEPTED":
          filteredData = data.map((e) => {
            let id = user._id == e.ownerId ? e.receiverId : e.ownerId;
            let fullName = user._id == e.ownerId ? e.receiverName : e.ownerName;
            let contactNumber = user._id == e.ownerId ? e.receiverContact : e.ownerContact;
            return {
              profilePicUrl:
                "https://dev-oasis-project-files.s3.ap-south-1.amazonaws.com/" +
                "matrimony/" +
                id +
                "/" +
                0 +
                ".jpg",
              fullName: fullName,
              contactNumber: contactNumber,
              id: e._id,
              type: type,
              createdAt: e.createdAt,
            };
          });
          break;
        default:
          break;
      }

      return callback(err, filteredData);
    });
};

module.exports = MatrimonyConnections;
