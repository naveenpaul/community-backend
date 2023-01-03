const posts = require("../models/Posts");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
const like = require("../controllers/likes");
const comment = require("./comments");
const { requestNewAccessToken } = require("passport-oauth2-refresh");
const User = require("../models/User");
const { reject } = require("async");
const UserController = new (require("./user"))();

const likeController = new like();
const commentController = new comment();

function Post() {}

Post.prototype.addPost = (req, res, callback) => {
  let poll = req.body.poll.map(function (element) {
    return { option: element, userId: [] };
  });
  const newPost = new posts({
    cId: req.body.cId,
    cName: req.body.cName,
    name: req.body.name,
    type: req.body.type,
    text: req.body.text || "",
    poll: req.body.option,
    thumbnail: req.body.thumbnail || "",
    userId: common.getUserId(req),
    poll: poll,
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

Post.prototype.getPostsFeed = async (req, res, user) => {
  const pageNumber = parseInt(req.params.pageNumber);
  const limit = 10;
  const offset = (pageNumber - 1) * limit;
  const createdBefore = req.query.createdBefore ?? new Date().toISOString;

  try {
    const allPosts = await posts
      .find({ createdAt: { $lt: createdBefore } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    if (!allPosts) Promise.reject();

    for (const post of allPosts) {
      post.isLiked = await isPostLiked(post, user);
      post.communityLogo = (
        await community.findOne({ _id: post.cId }, { logo: 1 }).exec()
      ).logo;
      post.userName = (
        await User.findOne({ _id: post.userId }, { fullName: 1 }).exec()
      ).fullName;
    }

    res.send({
      posts: allPosts,
      msg: "Successfully got Posts",
    });
  } catch (err) {
    return common.sendErrorResponse(res, "Error in getting Posts");
  }
};

Post.prototype.getPostById = async (req, res, user) => {
  const filterQuery = {
    _id: req.params.postId,
  };
  const projection = {};
  try {
    const post = await posts.findOne(filterQuery, projection).exec();

    if (!post) Promise.reject();

    post.isLiked = await isPostLiked(post, user);
    post.userName = (
      await UserController.findUserByUserIdAsync(post.userId, {})
    ).fullName;
    post.communityLogo = 88;

    res.send({
      post: post,
      msg: "Successfully got the post",
    });
  } catch (err) {
    return common.sendErrorResponse(res, "Error in getting post");
  }
};

Post.prototype.updatePost = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
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
        },
        (Err, updated) => {
          if (Err || !updated) {
            return common.sendErrorResponse(res, "Error in updating the POst");
          }

          return res.send({ msg: "Updated the post" });
        }
      );
    }
  );
};

Post.prototype.removePost = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      posts.deleteOne({ _id: id }, (deleteErr, deletePost) => {
        if (deleteErr || !deletePost) {
          return common.sendErrorResponse(res, "Failed to delete the Post");
        }
        return res.send({ msg: "Succcessfully removed the Post" });
      });
    }
  );
};

Post.prototype.addLike = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);
  req.body.sourceId = req.body.postId;

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }
      posts.updateOne(
        { _id: id },
        {
          $inc: { likesCount: 1 },
        },
        (Err, updated) => {
          if (Err || !updated) {
            return common.sendErrorResponse(
              res,
              "error in incrementing the count"
            );
          }
          likeController.addLike(req, res, (Err, saved) => {
            if (Err || !saved) {
              return common.sendErrorResponse(res, "Error in adding the like");
            }
            return res.send({ msg: "Successfully added the like" });
          });
        }
      );
    }
  );
};

Post.prototype.addComment = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);
  req.body.sourceId = req.body.postId;

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      posts.updateOne(
        { _id: id },
        {
          $inc: { commentsCount: 1 },
        },
        (Err, updated) => {
          if (Err || !updated) {
            return common.sendErrorResponse(
              res,
              "error in incrementing the count"
            );
          }
          commentController.addComment(req, res, (Err, saved) => {
            if (Err || !saved) {
              return common.sendErrorResponse(
                res,
                "Error in adding the comment"
              );
            }
            return res.send({
              msg: "Successfully added the comment",
              comment: saved,
            });
          });
        }
      );
    }
  );
};

Post.prototype.removeLike = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);
  req.body.sourceId = req.body.postId;

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
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
              return common.sendErrorResponse(
                res,
                "Error in removing the Like"
              );
            }
            // return res.send({ msg: "successfully removed like" });
          });
        }
      );
    }
  );
};
Post.prototype.removeComment = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);
  req.body.sourceId = req.body.postId;

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      posts.updateOne(
        { _id: id },
        {
          $inc: { commentsCount: -1 },
        },
        (Err, updated) => {
          if (Err || !updated) {
            return common.sendErrorResponse(
              res,
              "error in incrementing the count"
            );
          }
          commentController.removeComment(req, res, (Err, saved) => {
            if (Err || !saved) {
              return common.sendErrorResponse(
                res,
                "Error in removing the comment"
              );
            }
            return res.send({ msg: "Successfully removed the comment" });
          });
        }
      );
    }
  );
};

Post.prototype.getAllComment = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);
  req.body.sourceId = req.body.postId;

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      commentController.getAllComments(req, res);
    }
  );
};

Post.prototype.getAllLikes = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);
  req.body.sourceId = req.body.postId;

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }

      likeController.getAllLikes(req, res);
    }
  );
};

Post.prototype.addVote = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.postId);
  req.body.sourceId = req.body.postId;
  const selectedOption = req.body.selectedOption;

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }
      //TODO: add the logic for voting!!
      posts.updateOne({ _id: id }, {}, (Err, updated) => {
        if (Err || !updated) {
          return common.sendErrorResponse(
            res,
            "error in incrementing the count"
          );
        }
        commentController.addComment(req, res, (Err, saved) => {
          if (Err || !saved) {
            return common.sendErrorResponse(res, "Error in adding the comment");
          }
          return res.send({
            msg: "Successfully added the comment",
            comment: saved,
          });
        });
      });
    }
  );
};

const isPostLiked = async (post, user) => {
  const findQuery = {
    source: "POST",
    sourceId: post._id,
    userId: user._id,
  };
  return (await likeModel.findOne(findQuery).exec()) !== null;
};

module.exports = Post;
