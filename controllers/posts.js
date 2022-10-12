const posts = require("../models/posts");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
const like = require("../controllers/likes");
const comment = require("./comments");

const likeController = new like();
const commentController = new comment();

function Post() {}


Post.prototype.addPost = (req, res, callback) => {
    const newPost = new posts({
        cId: req.body.cId,
        cName: req.body.cName,
        name: req.body.name,
        type: req.body.type,
        userId: req.body.userId,
        likesCount: 0,
        commentsCount: 0,
    });
    newPost.save(callback);
};

Post.prototype.getAllPost = (req, res) => {
    const cId = req.body.cId == null ? "" : req.body.cId;

    posts
        .find({
            cId: common.castToObjectId(cId),
        })
        .lean()
        .exec((err, existingPost) => {
            if (err || !existingPost) {
                return common.sendErrorResponse(res, "Error in getting Post");
            }

            existingPost = existingPost || [];
            existingPost.forEach((Post) => {
                Post.link = "/Post/" + Post._id;
            });

            return res.send({
                Posts: existingPost,
                msg: "Successfully got all Posts",
                length: existingPost.length,
            });
        });
};

Post.prototype.updatePost = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        posts.updateOne(
            { _id: id },
            {
                $set: {
                    updatedAt: req.body.updatedAt,
                    cId: req.body.cId,
                    cName: req.body.cName,
                    name: req.body.name,
                    type: req.body.type,
                },
            },(Err,updated)=>{
                if(Err || !updated){
                    return common.sendErrorResponse(res,"Error in updating the POst");
                }

                return res.send({msg:"Updated the post"});
            }
        );
    });
};

Post.prototype.removePost = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        posts.deleteOne({ _id: id }, (deleteErr, deletePost) => {
            if (deleteErr || !deletePost) {
                return common.sendErrorResponse(res, "Failed to delete the Post");
            }
            return res.send({ msg: "Succcessfully removed the Post" });
        });
    });
};

Post.prototype.addLike = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);
    req.body.sourceId = req.body.postId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        posts.updateOne(
            { _id: id },
            {
                $inc: { likesCount: 1 },
            },
            (Err, updated) => {
                if (Err || !updated) {
                    return common.sendErrorResponse(res, "error in incrementing the count");
                }
                likeController.addLike(req, res, (Err, saved) => {
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in adding the like");
                    }
                    return res.send({ msg: "Successfully added the like" });
                });
            }
        );
    });
};

Post.prototype.addComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);
    req.body.sourceId = req.body.postId;


    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        posts.updateOne(
            { _id: id },
            {
                $inc: { commentsCount: 1 },
            },
            (Err, updated) => {
                if (Err || !updated) {
                    return common.sendErrorResponse(res, "error in incrementing the count");
                }
                commentController.addComment(req, res, (Err, saved) => {
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in adding the comment");
                    }
                    return res.send({ msg: "Successfully added the comment" });
                });
            }
        );
    });
};

Post.prototype.removeLike = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);
    req.body.sourceId=req.body.postId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        posts.updateOne(
            { _id: id },
            {
                $inc: { likesCount: -1 },
            },
            (Err, updated) => {
                if (Err || !updated) {
                    return common.sendErrorResponse(res, "Error in updating");
                }
                likeController.removeLike(req, res, (Err, removed) => {
                    if (Err || !removed) {
                        return common.sendErrorResponse(res, "Error in removing the Like");
                    }
                    // return res.send({ msg: "successfully removed like" });
                });
            }
        );
    });
};
Post.prototype.removeComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);
    req.body.sourceId=req.body.postId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        posts.updateOne(
            { _id: id },
            {
                $inc: { commentsCount: -1 },
            },
            (Err, updated) => {
                if (Err || !updated) {
                    return common.sendErrorResponse(res, "error in incrementing the count");
                }
                commentController.removeComment(req, res, (Err, saved) => {
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in removing the comment");
                    }
                    return res.send({ msg: "Successfully removed the comment" });
                });
            }
        );
    });
};

Post.prototype.getAllComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);
    req.body.sourceId = req.body.postId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        commentController.getAllComments(req, res);
    });
};

Post.prototype.getAllLikes = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);
    req.body.sourceId = req.body.postId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        likeController.getAllLikes(req,res);
    });
};
module.exports = Post;
