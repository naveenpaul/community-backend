const express = require("express");
const Router = express.Router();
const CommonUtility = require("../common/commonUtility");
const Post = require("../controllers/posts");
const userControl = require("../controllers/user");

const common = new CommonUtility();
const postController = new Post();
const userController = new userControl();

Router.post("/posts/add", common.authorizeUser, handleAddPosts);
Router.post("/posts/get/all", common.authorizeUser, handleGetPosts);
Router.get(
  "/posts/feed/page/:pageNumber",
  common.authorizeUser,
  handleGetPostsFeed
);
Router.get("/post/:postId", common.authorizeUser, handleGetPostById);
Router.post("/posts/add/like", common.authorizeUser, handleAddLikes);
Router.post("/posts/add/comment", common.authorizeUser, handleAddComments);
Router.post("/posts/remove", common.authorizeUser, handleRemovePost);
Router.post("/posts/remove/comment", common.authorizeUser, handleRemoveComment);
Router.post("/posts/remove/like", common.authorizeUser, handleRemoveLike);
Router.put("/posts/update", common.authorizeUser, handleUpdatePosts);
Router.get(
  "/posts/get/all/comments/:pageNumber",
  common.authorizeUser,
  handleGetAllComments
);
Router.post("/posts/get/all/likes", common.authorizeUser, handleGetAllLikes);
Router.post("/post/add/vote", common.authorizeUser, handleAddVote);
function handleAddPosts(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      postController.addPost(req, res, existingUser, (Err, saved) => {
        if (Err || !saved) {
          return common.sendErrorResponse(res, "Error in adding the Post");
        }
        res.send({
          // post:saved,
          msg: "Added Post Successfully",
        });
      });
    }
  );
}

function handleGetPosts(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { userId: "" },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      postController.getAllPost(req, res);
    }
  );
}

function handleGetPostsFeed(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    {},
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      postController.getPostsFeed(req, res, existingUser);
    }
  );
}

function handleGetPostById(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    {},
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }
      postController.getPostById(req, res,(err,post)=>{
        if(err || !post){
          return common.sendErrorResponse(res, "Error in getting post");
        }
        res.send({
        post: post,
        msg: "Successfully got the post",
      });
      } );
    }
  );
}

function handleUpdatePosts(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      postController.updatePost(req, res,(Err, updated) => {
        if (Err || !updated) {
          return common.sendErrorResponse(res, "Error in updating the POst");
        }

        return res.send({ msg: "Updated the post" });
      } );
    }
  );
  
}
function handleRemovePost(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      postController.removePost(req, res, existingUser.emailId);
    }
  );
}

function handleAddLikes(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      postController.addLike(req, res, existingUser);
    }
  );
}
function handleAddComments(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      postController.addComment(req, res, existingUser);
    }
  );
}

function handleRemoveLike(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      postController.removeLike(req, res);
    }
  );
  
}

function handleRemoveComment(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      postController.removeLike(req, res, existingUser.emailId);
    }
  );
}
function handleGetAllComments(req, res) {
  postController.getAllComment(req, res);
}

function handleGetAllLikes(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      postController.getAllLikes(req, res, existingUser.emailId);
    }
  );
}

function handleAddVote(req, res) {
  const userId = common.getUserId(req) || "";

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { emailId: 1 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting user details");
      }

      postController.addVote(req, res, existingUser.emailId);
    }
  );
}

module.exports = Router;
