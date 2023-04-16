const CommonUtility = require("../common/commonUtility");
const matrimonyConnections = require("../models/matrimony_connections");
const common = new CommonUtility();

function MatrimonyConnections() {}

MatrimonyConnections.prototype.addRequest = (req, user, callback) => {
    const newRequest = matrimonyConnections({
        ownerId: user._id,
        ownerName: user.name,
        receiverId: common.castToObjectId(req.body.receiverId),
        receiverName: req.body.receiverName,
    });

    newRequest.save(callback);
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
    const type = req.params.type;
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
        .exec(callback);
};

module.exports = MatrimonyConnections;
