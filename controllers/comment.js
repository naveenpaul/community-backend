const comment = require('../models/Comments');
const community = require('../models/Community');
const commonUtility = require('../common/commonUtility');
const common = new commonUtility();

function Comment() {}

Comment.prototype.addComment = (req, res, callback) => {
    const newComment = new comment({
        contentId: common.castToObjectId(req.body.contentId),
        type: req.body.type,
        // createdAt: req.body.createdAt,
        // updatedAt: req.body.updatedAt,
        fullName: req.body.fullName,
        profilePicUrl: req.body.profilePicUrl,
        memberId: common.castToObjectId(req.body.memberId),
        date: req.body.date,
        isStaff: req.body.isStaff,
    });
    newComment.save(callback);
};

Comment.prototype.getAllComments = (req, res) => {
    const contentId = req.body.contentId == null ? '' : req.body.contentId;
    comment
        .find({
            contentId: common.castToObjectId(contentId),
            type: req.body.type,
        })
        .lean()
        .exec((err, existingComments) => {
            if (err || !existingComments) {
                return common.sendErrorResponse(res, 'Error in getting Content');
            }
            existingComments = existingComments || [];

            // existingComment.forEach((Comment) => {
            //   Comment.link = "/Comment/" + Comment._id;
            // });

            return res.send({
                users: existingComments,
                msg: 'successfully got all Comments',
                length: existingComments.length,
            });
        });
};

Comment.prototype.removeComment = (req, res) => {
    const id = common.castToObjectId(req.body.id);
    comment.deleteOne({ _id: id }, (deleteErr, deleteEvent) => {
        if (deleteErr || !deleteEvent) {
            return common.sendErrorResponse(res, 'Failed to delete the Event');
        }
        return res.send({ msg: 'Succcessfully removed the event' });
    });
};
module.exports = Comment;
