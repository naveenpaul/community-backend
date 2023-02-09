const like = require("../models/Likes");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
const _ = require("lodash");

function Like() {}

Like.prototype.isPostLiked = (sourceIds, user, callback) => {
  like
    .find({
      userId: common.castToObjectId(user._id),
      sourceId: { $in: sourceIds },
    })
    .lean()
    .exec(function (err, likes) {
      callback(err, _.keyBy(likes, "sourceId"));
    });
};

Like.prototype.addLike = (req, res, user, callback) => {
  const newLike = new like({
    sourceId: common.castToObjectId(req.body.sourceId),
    source: req.body.source,
    fullName: user.fullName,
    profilePicUrl: user.profilePicUrl,
    userId: common.getUserId(req),
    date: new Date(),
  });
  newLike.save(callback);
};

Like.prototype.getAllLikes = (req, res) => {
  const sourceId = req.body.sourceId == null ? "" : req.body.sourceId;
  like
    .find({
      sourceId: common.castToObjectId(sourceId),
      source: req.body.source,
    })
    .lean()
    .exec((err, existingLike) => {
      if (err || !existingLike) {
        return common.sendErrorResponse(res, "Error in getting Content");
      }
      existingLike = existingLike || [];

      return res.send({
        likes: existingLike,
        msg: "successfully got all likes",
        length: existingLike.length,
      });
    });
};
Like.prototype.removeLike = (req, res,callback) => {
  const id = common.castToObjectId(req.body.sourceId);
  like.deleteOne(
    { sourceId: id, userId: common.getUserId(req) },
    callback
  );
};

module.exports = Like;
