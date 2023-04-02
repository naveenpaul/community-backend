const posts = require("../models/Posts");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
const like = require("../controllers/likes");
const communityControl = require("./community");
const comment = require("./comments");
const vote = require("./votes");
const User = require("../models/User");
const { reject } = require("async");
const UserController = new (require("./user"))();
const _ = require("lodash");
const { Mongoose, default: mongoose } = require("mongoose");
const Votes = require("../models/Votes");

const communityController = new communityControl();
const likeController = new like();
const commentController = new comment();
const voteController = new vote();

function Post() {}

Post.prototype.addPost = (req, res, user, callback) => {
    let poll = req.body.poll
        ? req.body.poll.map(function (element) {
        return { option: element, optionId: mongoose.Types.ObjectId(),votesCount:0 };
          })
        : [];
    const newPost = new posts({
        cId: req.body.cId,
        cName: req.body.cName,
        name: req.body.name,
        type: req.body.type,
        text: req.body.text || "",
        thumbnail: [],
        userId: common.getUserId(req),
        poll: poll,
        likesCount: 0,
        commentsCount: 0,
        userProfile: user,
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

Post.prototype.getPostsFeed = (req, res, user) => {
    let pageNumber = parseInt(req.params.pageNumber);
    const limit = 10;
    const offset = (pageNumber - 1) * limit;

    posts
        .find({ createdAt: { $lt: new Date() } })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(function (err, allPosts) {
      likeController.isPostLiked(
        _.map(allPosts, "_id"),
        user,
        function (err, likesMap) {
                allPosts.forEach((post) => {
                    post.isLiked = likesMap[post._id] ? true : false;
                    post.userName = user.fullName;
                });

          voteController.isVoted( _.map(allPosts, "_id"),user, function (err, votesMap){
                    allPosts.forEach((post) => {
              post.selectedOption = votesMap[post._id] ? votesMap[post._id].optionId : null;
                    });
                communityController.getCommunityLogo(_.map(allPosts, "cId"), function (err, communityMap) {
                    allPosts.forEach((post) => {
                      // console.log(communityMap[post.cId].logo);
                      post.communityLogo =communityMap[post.cId].logo;
                      });
                  
                    res.send({
                        posts: allPosts,
                        msg: "Successfully got Posts",
                    });
                  });
                });
            });
        });
};

Post.prototype.getPostById = async (req, res, callback) => {
    const filterQuery = {
        _id: common.castToObjectId(req.params.postId),
    };
    const projection = {};
    try {
        const post = await posts.findOne(filterQuery, projection).exec();

        if (!post) Promise.reject();

        post.isLiked = false;
        post.userName = "";
        post.communityLogo = 88;

        if (callback) {
            callback(null, post);
        } else {
            res.send({
                post: post,
                msg: "Successfully got the post",
            });
        }
    } catch (err) {
        return common.sendErrorResponse(res, "Error in getting post");
    }
};

Post.prototype.updatePost = (req, res, callback) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.postId);
  req.body.sourceId=req.body.postId;
    console.log(id);
  var deletedOptions=req.body.deletedOptions ?  req.body.deletedOptions.map(function (element) {
    return common.castToObjectId( element);
          })
        : [];
    let newoptions = req.body.newOptions
  //need  to change when adding votes is working
  ? req.body.newOptions.map(function (element) {
    return { option: element, optionId: mongoose.Types.ObjectId(),votesCount:0 };
          })
        : [];
    community.findOne(
        { _id: cId, "staff._id": common.getUserId(req) },
        (communityErr, existingcomm) => {
            if (communityErr || !existingcomm) {
                return common.sendErrorResponse(
                    res,
                    "You don't have access to specified community"
                );
            }
      var newValues={
                updatedAt: Date.now(),
                cId: req.body.cId,
                name: req.body.name,
                text: req.body.text || "",
                
      }
      posts.updateOne(
                    { _id: id },
                    {
                        $set: {
                            ...newValues,
           
                        },
                        //add new options
          $addToSet:{ poll: { $each: newoptions}},
          
        }).exec((err,updated)=>{
        if(err || !updated){
                        console.log(err);
          return common.sendErrorResponse(res,"error in updating post collection");
                    }
        voteController.removeVotesForOption(req,res, (err,updated)=>{
          if(err || !updated){
            common.sendErrorResponse(res,"not able to update the previous option");

                        }
          posts.updateOne(
                                { _id: id },
                                {
                                    //remove deleted options
              $pull:{ poll: { optionId:{$in: deletedOptions}} },
                                }
          ).exec(
            callback(err,updated)
                            )
                    });
         
        }
        );
        }
    );
};
Post.prototype.removeImage = (postId,fileId, res, callback) =>{

   posts.updateOne(
    {_id:postId},
            {
      $pull:{ thumbnail:{sourceId:fileId}}
            }
   ).exec(callback);
}
Post.prototype.removePost = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.sourceId);

  community.findOne(
    { _id: cId, "staff.emailId": emailId },
    (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
        }
        //still cannot delete the images and videos as there is problem with deleting videos in S3
        posts.deleteOne({ _id: id }, (deleteErr, deletePost) => {
            if (deleteErr || !deletePost) {
                return common.sendErrorResponse(res, "Failed to delete the Post");
            }
            likeController.removeAllLikesOfSource(req, (Err, removed) => {
                if (Err || !removed) {
            return common.sendErrorResponse(res, "Post removed but not the likes from the db");
                }
                commentController.removeAllCommentsOfSource(req, (Err, removed) => {
                    if (Err || !removed) {
            return common.sendErrorResponse(res, "Post removed but not the likes from the db");
                    }
                    return res.send({ msg: "Succcessfully removed the Post" });
                });
    }
  );
})

})}

Post.prototype.addLike = (req, res, user) => {
    const id = common.castToObjectId(req.body.sourceId);
  req.body.source="POST";
    posts.updateOne(
        { _id: id },
        {
            $inc: { likesCount: 1 },
        },
        (Err, updated) => {
            if (Err || !updated) {
                return common.sendErrorResponse(res, "error in incrementing the count");
            }
            likeController.addLike(req, res, user, (Err, saved) => {
                if (Err || !saved) {
                    return common.sendErrorResponse(res, "Error in adding the like");
                }
                return res.send({ msg: "Successfully added the like" });
            });
        }
    );
};

Post.prototype.addComment = (req, res, user) => {
    req.body.source = "POST";
    posts.updateOne(
        { _id: common.castToObjectId(req.body.sourceId) },
        {
            $inc: { commentsCount: 1 },
        },
        (Err, updated) => {
            if (Err || !updated) {
                return common.sendErrorResponse(res, "error in incrementing the count");
            }
            commentController.addComment(req, res, user, (Err, saved) => {
                if (Err || !saved) {
                    return common.sendErrorResponse(res, "Error in adding the comment");
                }
                return res.send({
                    msg: "Successfully added the comment",
                    comment: saved,
                });
            });
        }
    );
};

Post.prototype.removeLike = (req, res) => {
    posts.updateOne(
        { _id: common.castToObjectId(req.body.sourceId) },
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
                return res.send({
                    msg: "removed Like",
                });
            });
        }
    );
};
Post.prototype.removeComment = (req, res, emailId) => {
    const id = common.castToObjectId(req.body.sourceId);
      posts.updateOne(
            { _id: id },
            {
                $inc: { commentsCount: -1 },
        }).exec(
        (Err, updated) => {
            if (Err || !updated) {
            return common.sendErrorResponse(
              res,
              "error in decrementing the count"
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

Post.prototype.getAllComment = (req, res) => {
    commentController.getAllComments(req, res);
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
    // const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.sourceId);
  const optionId =common.castToObjectId(req.body.optionId) ;

    // community.findOne(
    //   { _id: cId, "staff.emailId": emailId },
    //   (communityErr, existingcomm) => {
    //     if (communityErr || !existingcomm) {
    //       return common.sendErrorResponse(
    //         res,
    //         "You don't have access to specified community"
    //       );
    //     }
    //TODO: add the logic for voting!!
      posts.updateOne({ _id: id,"poll.optionId":optionId }, {
        $inc: { "poll.$.votesCount": 1}
      }).exec((Err, updated) => {
            if (Err || !updated) {
          return common.sendErrorResponse(
            res,
            "error in incrementing the count"
          );
            }
            console.log(updated);
        voteController.addVote(req,res,(Err,saved)=>{
          if(Err || !saved){
            common.sendErrorResponse(res,"error in adding the vote");

                }
          return res.send({msg: "Added vote succussfully"});
        })
            });
    }
// );
// };

Post.prototype.removeVote = (req, res, emailId) => {
    // const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.sourceId);
  const optionId =common.castToObjectId(req.body.optionId) ;

    // community.findOne(
    //   { _id: cId, "staff.emailId": emailId },
    //   (communityErr, existingcomm) => {
    //     if (communityErr || !existingcomm) {
    //       return common.sendErrorResponse(
    //         res,
    //         "You don't have access to specified community"
    //       );
    //     }
    //TODO: add the logic for voting!!
      posts.updateOne({ _id: id,"poll.optionId":optionId }, {
        $inc: { "poll.$.votesCount": -1}
      }, (Err, updated) => {
            if (Err || !updated) {
          return common.sendErrorResponse(
            res,
            "error in incrementing the count"
          );
            }
        voteController.removeVote(req,res,(Err,saved)=>{
          if(Err || !saved){
            common.sendErrorResponse(res,"error in removing the vote");

                }
          return res.send({msg: "removed vote succussfully"});
        })
            });
        }
//   );
// };

Post.prototype.updateVote = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.sourceId);
  const optionId =common.castToObjectId(req.body.optionId) ;
  const deletedOption =common.castToObjectId(req.body.deletedOption) ;

    // community.findOne(
    //   { _id: cId, "staff.emailId": emailId },
    //   (communityErr, existingcomm) => {
    //     if (communityErr || !existingcomm) {
    //       return common.sendErrorResponse(
    //         res,
    //         "You don't have access to specified community"
    //       );
    //     }
    //TODO: add the logic for voting!!
      posts.updateOne({ _id: id,"poll.optionId":deletedOption }, {
        $inc: { "poll.$.votesCount": -1}
      }, (Err, updated) => {
            if (Err || !updated) {
          return common.sendErrorResponse(
            res,
            "error in incrementing the count"
          );
            }
        voteController.removeVote(req,res,(Err,saved)=>{
          if(Err || !saved){
            common.sendErrorResponse(res,"error in removing the vote");

                }
          posts.updateOne({ _id: id,"poll.optionId":optionId }, {
            $inc: { "poll.$.votesCount": 1}
          }, (Err, updated) => {
                        if (Err || !updated) {
              return common.sendErrorResponse(
                res,
                "error in incrementing the count"
              );
                        }
            voteController.addVote(req,res,(Err,saved)=>{
              if(Err || !saved){
                common.sendErrorResponse(res,"error in adding the vote");
    
                            }
              return res.send({msg: "updated vote succussfully"});
            })
                        });
        })
            });
        }
//   );
// };
module.exports = Post;
