const posts = require('../models/posts');
const community = require('../models/community');
const commonUtility = require('../common/commonUtility');
const common = new commonUtility();

function Post() {}

Post.prototype.addPost = (req, res, callback) => {
    const newPost = new posts({
        createdAt: req.body.createdAt,
        updatedAt: req.body.updatedAt,
        cId: req.body.cId,
        cName: req.body.cName,
        name: req.body.name,
        type: req.body.type,
        likesCount: 0,
        commentsCount: 0,
    });
    newPost.save(callback);
};

Post.prototype.getAllPost = (req, res) => {
    const cId = req.body.cId == null ? '' : req.body.cId;

    posts
        .find({
            cId: common.castToObjectId(cId),
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
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: cId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        posts.updateOne(
            { _id: id },
            {
                $set: {
                  updatedAt:req.body.updatedAt,
                  cId: req.body.cId,
                  cName: req.body.cName,
                  name: req.body.name,
                  type: req.body.type,
                },
            }
        );
    });
};

Post.prototype.removePost = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: cId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
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
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: cId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
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
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: cId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
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
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: cId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
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
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: cId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
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
