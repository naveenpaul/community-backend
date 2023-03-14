const comment = require("../models/comments");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

function Comment() {}

Comment.prototype.addComment = (req, res, user, callback) => {
  const newComment = new comment({
    sourceId: common.castToObjectId(req.body.sourceId),
    source: req.body.source,
    fullName: user.fullName,
    profilePicUrl: user.profilePicUrl,
    userId: common.getUserId(req),
    description: req.body.description,
    date: new Date(),
    isStaff: req.body.isStaff,
  });
  newComment.save(callback);
};

Comment.prototype.getAllComments = (req, res) => {
  let pageNumber = parseInt(req.params.pageNumber);
  const limit = 10;
  const offset = (pageNumber - 1) * limit;

  comment
    .find({ sourceId: common.castToObjectId(req.query.sourceId) })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean()
    .exec((err, existingComments) => {
      if (err || !existingComments) {
        return common.sendErrorResponse(res, "Error in getting Content");
      }

      return res.send({
        comments: existingComments,
        msg: "Succcessfully got comments",
      });
    });
};

Comment.prototype.removeComment = (req, res) => {
  const id = common.castToObjectId(req.body.id);
  const sourceId = common.castToObjectId(req.body.sourceId);
  // console.log(id);
  comment.deleteOne(
    { _id: id, sourceId: sourceId, userId: common.getUserId(req) },
    (deleteErr, deleteEvent) => {
      if (deleteErr || !deleteEvent) {
        return common.sendErrorResponse(res, "Failed to delete the comment");
      }
      return res.send({ msg: "Succcessfully removed the comment" });
    }
  );
};

Comment.prototype.removeAllCommentsOfSource =(req,callback)=>{
  const sourceId=common.castToObjectId(req.body.sourceId);
  comment.deleteMany(
    {sourceId:sourceId},
    callback
  )
}
module.exports = Comment;
