const posts = require('../models/Posts');
const community = require('../models/Community');
const commonUtility = require('../common/commonUtility');
const common = new commonUtility();

function Post() {}

Post.prototype.addPost = (req, res, callback) => {
    const newPost = new posts({
        createdAt: req.body.createdAt,
        updatedAt: req.body.updatedAt,
        commId: req.body.commId,
        commName: req.body.commName,
        name: req.body.name,
        type: req.body.type,
        likesCount: 0,
        commentsCount: 0,
    });
    newPost.save(callback);
};

Post.prototype.getAllPost = (req, res) => {
    const commId = req.body.commId == null ? '' : req.body.commId;

    posts
        .find({
            commId: common.castToObjectId(commId),
        })
        .lean()
        .exec((err, existingPost) => {
            if (err || !existingPost) {
                return common.sendErrorResponse(res, 'Error in getting Post');
            }

            existingPost = existingPost || [];
            existingPost.forEach((Post) => {
                Post.link = '/Post/' + Post._id;
            });

            return res.send({
                Posts: existingPost,
                msg: 'Successfully got all Posts',
                length: existingPost.length,
            });
        });
};

Post.prototype.updatePost = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        posts.updateOne(
            { _id: id },
            {
                $set: {
                  updatedAt:req.body.updatedAt,
                  commId: req.body.commId,
                  commName: req.body.commName,
                  name: req.body.name,
                  type: req.body.type,
                },
            }
        );
    });
};

Post.prototype.removePost = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        posts.deleteOne({ _id: id }, (deleteErr, deletePost) => {
            if (deleteErr || !deletePost) {
                return common.sendErrorResponse(res, 'Failed to delete the Post');
            }
            return res.send({ msg: 'Succcessfully removed the Post' });
        });
    });
};

Post.prototype.addLike = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        posts.updateOne(
            { _id: id },
            {
                $set: {
                    likesCount: { $inc: 1 },
                },
            }
        );
    });
};

Post.prototype.addComment = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        posts.updateOne(
            { _id: id },
            {
                $set: {
                    commentsCount: { $inc: 1 },
                },
            }
        );
    });
};

Post.prototype.removeLike = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        posts.updateOne(
            { _id: id },
            {
                $set: {
                    likesCount: { $inc: -1 },
                },
            }
        );
    });
};
Post.prototype.removeComment = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        posts.updateOne(
            { _id: id },
            {
                $set: {
                    commentsCount: { $inc: -1 },
                },
            }
        );
    });
};

module.exports = Post;
