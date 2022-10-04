const comment = require("../models/comments");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

function Comment() {}

Comment.prototype.addComment = (req, res, callback) => {
    const newComment = new comment({
        sourceId: common.castToObjectId(req.body.sourceId),
        source: req.body.source,
        // createdAt: req.body.createdAt,
        // updatedAt: req.body.updatedAt,
        fullName: req.body.fullName,
        profilePicUrl: req.body.profilePicUrl,
        userId: common.getUserId(req),
        date: req.body.date,
        isStaff: req.body.isStaff,
    });
    newComment.save(callback);
};

Comment.prototype.getAllComments = (req, res) => {
    const sourceId = req.body.sourceId == null ? "" : req.body.sourceId;
    comment
        .find({
            sourceId: common.castToObjectId(sourceId),
            source: req.body.type,
        })
        .lean()
        .exec((err, existingComments) => {
            if (err || !existingComments) {
                return common.sendErrorResponse(res, "Error in getting Content");
            }
            existingComments = existingComments || [];

            // existingComment.forEach((Comment) => {
            //   Comment.link = "/Comment/" + Comment._id;
            // });

            return res.send({
                users: existingComments,
                msg: "successfully got all Comments",
                length: existingComments.length,
            });
        });
};

Comment.prototype.removeComment = (req, res) => {
    const id = common.castToObjectId(req.body.id);
    comment.deleteOne({ userId: common.getUserId(req) }, (deleteErr, deleteEvent) => {
        if (deleteErr || !deleteEvent) {
            return common.sendErrorResponse(res, "Failed to delete the Event");
        }
        return res.send({ msg: "Succcessfully removed the event" });
    });
};
module.exports = Comment;
