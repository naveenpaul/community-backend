const like = require("../models/likes");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

function Like() {}

Like.prototype.addLike = (req, res, callback) => {
    const newLike = new like({
        sourceId: common.castToObjectId(req.body.sourceId),
        source: req.body.type,
        // createdAt: req.body.createdAt,
        // updatedAt: req.body.updatedAt,
        fullName: req.body.fullName,
        profilePicUrl: req.body.profilePicUrl,
        userId: common.getUserId(req),
        date: req.body.date,
    });
    newLike.save(callback);
};

Like.prototype.getAllLikes = (req, res) => {
    const sourceId = req.body.sourceId == null ? "" : req.body.sourceId;
    like.find({
        sourceId: common.castToObjectId(sourceId),
        type: req.body.type,
    })
        .lean()
        .exec((err, existingLike) => {
            if (err || !existingLike) {
                return common.sendErrorResponse(res, "Error in getting Content");
            }
            existingLike = existingLike || [];

            // existingLike.forEach((like) => {
            //   like.link = "/like/" + like._id;
            // });

            return res.send({
                users: existingLike,
                msg: "successfully got all likes",
                length: existingLike.length,
            });
        });
};
Like.prototype.removeLike = (req, res) => {
    const id = common.castToObjectId(req.body.id);
    
    like.deleteOne({ sourceId:id, userId: common.getUserId(req) }, (deleteErr, deleteEvent) => {
        if (deleteErr || !deleteEvent) {
            return common.sendErrorResponse(res, "Failed to delete the Event");
        }
        // return res.send({ msg: "Succcessfully removed the event" });
    });
};

module.exports = Like;
