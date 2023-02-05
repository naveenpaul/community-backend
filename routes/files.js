const express = require("express");
const router = express.Router();
const commonUtility = require("../common/commonUtility");
const files = require("../controllers/files");
const userControl = require("../controllers/user");
const community = require("../controllers/community");
const Post = require("../controllers/posts");
const communityModel = require("../models/community");
const event = require("../controllers/events");
const common = new commonUtility();
const filesController = new files();
const postController = new Post();
const userController = new userControl();
const communityController = new community();

const eventController = new event();
const async = require("async");

router.post("/file/upload", common.authorizeUser, handleFileUpload);
router.post(
  "/file/upload/post",
  common.authorizeUser,
  handleFileUploadPost
);
router.post('/file/upload/event',common.authorizeUser,handleFileUploadEvent);
router.put("/file/update/post", common.authorizeUser, handleFileUpdatePost);
router.put("/file/update/event", common.authorizeUser,handleFileUpdateEvent)
router.post("/file/list/source", common.authorizeUser, handleFileListBySource);
router.get("/file/from/s3/:fileId", common.authorizeUser, handleGetFileFromS3);
router.post("/file/by/name", common.authorizeUser, handleGetFileByUniqName);
router.get(
  "/file/delete/s3/:fileId",
  common.authorizeUser,
  handleDeleteFileFromS3
);
router.get("/file/url/:fileId", common.authorizeUser, handleFileUrl);
router.get(
  "/file/url/by/uniq/name/:uniqFileName",
  common.authorizeUser,
  handleFileUrlByFileName
);
router.get("/file/download/:uniqFileName", handleDownloadtFileByUniqName);

function handleFileUpload(req, res) {
  const files = req.files || [];
  if (files.length == 0) {
    return common.sendErrorResponse(res, "No file found");
  }
  const uploadFile = files[0];
  const uploadObj = {
    source: req.query.source,
    sourceId: common.castToObjectId(req.query.sourceId),
    type: filesController.extractTypeFromMimeType(uploadFile.mimetype),
    fileName: uploadFile.originalname,
    uniqFileName: uploadFile.originalname,
    tag: req.query.tag ? JSON.parse(req.query.tag) : {},
  };

  filesController.uploadFileCloud(uploadFile.path, uploadObj, res);
}

function handleFileUploadPost(req, res) {
  const files = req.files || [];
  const userId = common.getUserId(req);
  if (files.length == 0) {
    return common.sendErrorResponse(res, "No files found");
  }

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      req.params.communityId = req.query.cId;
      communityController.getCommunityById(
        req,
        res,
        function (errC, community) {
          req.body = req.query;
          req.body.cId = community._id;
          req.body.cName = community.name;
          postController.addPost(req, res, existingUser, (Err, post) => {
            if (Err || !post) {
              return common.sendErrorResponse(res, "Error in adding the Post");
            }
            async.each(
              files,
              function (file, callback) {
                const uploadObj = {
                  source: req.body.source,
                  sourceId: post._id,
                  type: filesController.extractTypeFromMimeType(file.mimetype),
                  fileName: file.originalname,
                  uniqFileName: file.originalname,
                  tag: req.body.tag ? JSON.parse(req.body.tag) : {},
                };

                filesController.uploadFileCloud(
                  file.path,
                  uploadObj,
                  res,
                  callback
                );
              },
              function (err, results) {
                req.params.postId = post._id;
                postController.getPostById(req, res, function (err, newPost) {
                  return res.send({
                    msg: "Successfully saved file",
                    data: newPost,
                  });
                });
              }
            );
          });
        }
      );
    }
  );
}

function handleFileUploadEvent(req, res) {
  const files = req.files || [];
  const userId = common.getUserId(req);

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      req.params.communityId = req.body.cId;
      communityController.getCommunityById(
        req,
        res,
        function (errC, community) {
          // req.body = req.query;
          // req.body.cId = community._id;
          req.body.cName = community.name;
          eventController.addEvent(req, res, existingUser, (Err, event) => {
            if (Err || !event) {
              console.log(Err)
              return common.sendErrorResponse(res, "Error in adding the Event");
            }
            async.each(
              files,
              function (file, callback) {
                const uploadObj = {
                  source: "EVENT",
                  sourceId: event._id,
                  type: filesController.extractTypeFromMimeType(file.mimetype),
                  fileName: file.originalname,
                  uniqFileName: file.originalname,
                  tag: req.body.tag ? JSON.parse(req.body.tag) : {},
                };
                filesController.uploadFileCloud(
                  file.path,
                  uploadObj,
                  res,
                  callback
                );
              },
              function (err, results) {
                req.params.eventId = event._id;
                eventController.getEventById(req, res, function (err, newEvent) {
                  return res.send({
                    msg: "Successfully saved file",
                    data: newEvent,
                  });
                });
              }
            );
          });
        }
      );
    }
  );
}

function handleFileUpdatePost(req,res){
  const files = req.files || [];
  const deletedFiles= req.body.deleted || [];
  const userId = common.getUserId(req);
  console.log(files.length);

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      communityModel.findOne(
        { _id: common.castToObjectId(req.query.cId) , "staff._id": common.castToObjectId(userId) },
        (communityErr, existingcomm) => {
          if (communityErr || !existingcomm) {
            return common.sendErrorResponse(
              res,
              "You don't have access to specified community 1"
            );
          }
          //delete files
          async.each(
            deletedFiles,
            function (deletedFile,callback){
            postController.removeImage(common.castToObjectId(req.query.sourceId),common.castToObjectId(deletedFile),res,callback);
            }, function (err,){
              if( err ) {
                console.log("Error in deleting Files");
            } 
           
            //upload new files
            console.log("Deleted Files")
            async.each(
              files,
              function (file, callback) {
                const uploadObj = {
                  source: "POST",
                  sourceId: common.castToObjectId(req.query.sourceId),
                  type: filesController.extractTypeFromMimeType(file.mimetype),
                  fileName: file.originalname,
                  uniqFileName: file.originalname,
                  tag: req.body.tag ? JSON.parse(req.body.tag) : {},
                };
                console.log("file uploading...")
                filesController.uploadFileCloud(
                  file.path,
                  uploadObj,
                  res,
                callback
                );
              },
              function (err, results) {
                //update the post
                if(err)console.log("Error while uploading files");
                req.body=req.query;
                req.body.postId=req.query.sourceId;
                req.body.cId=req.query.cId;
                postController.updatePost(req,res,(err,updatedPost) =>{
                    if(err || !updatedPost){
                      return common.sendErrorResponse(res,"Error while updating post");
                    }
                    return res.send({
                      msg: "Successfully Updated Post",
                    });
                })
               
               
              }
            );
            }
          );
          
         
        }
      );   
    }
  );
}

function handleFileUpdateEvent(req,res){
  const files = req.files || [];
  const deletedFiles= req.body.deleted || [];
  const userId = common.getUserId(req);
  console.log(files.length);

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      communityModel.findOne(
        { _id: common.castToObjectId(req.query.cId) , "staff._id": common.castToObjectId(userId) },
        (communityErr, existingcomm) => {
          if (communityErr || !existingcomm) {
            return common.sendErrorResponse(
              res,
              "You don't have access to specified community 1"
            );
          }
          //delete files
          async.each(
            deletedFiles,
            function (deletedFile,callback){
            postController.removeImage(common.castToObjectId(req.query.sourceId),common.castToObjectId(deletedFile),res,callback);
            }, function (err){
              if( err ) {
                console.log("Error in deleting Files");
            } 
           console.log("deleted files")
            //upload new files
            async.each(
              files,
              function (file, callback) {
                const uploadObj = {
                  source: "EVENT",
                  sourceId: common.castToObjectId(req.query.sourceId),
                  type: filesController.extractTypeFromMimeType(file.mimetype),
                  fileName: file.originalname,
                  uniqFileName: file.originalname,
                  tag: req.body.tag ? JSON.parse(req.body.tag) : {},
                };
                console.log("file uploading...")
                filesController.uploadFileCloud(
                  file.path,
                  uploadObj,
                  res,
                callback
                );
              },
              function (err) {
                if(err)console.log("Error while uploading files");
                req.body=req.query;
                req.body.eventId=req.query.sourceId;
                req.body.cId=req.query.cId;
                eventController.updateEvent(req,res,(err,updatedPost) =>{
                    if(err || !updatedPost){
                      return common.sendErrorResponse(res,"Error while updating Event");
                    }
                    return res.send({
                      msg: "Successfully Updated Event",
                    });
                })
               
               
              }
            );
            }
          );
          
        }
      );   
    }
  );
}
function handleFileListBySource(req, res) {
  const sourceId = req.body.sourceId;
  const projection = req.body.projection || {};

  if (!common.isObjectId(sourceId)) {
    return common.sendErrorResponse(res, "Enter valid source Id");
  }

  filesController.getFileListBySource(
    sourceId,
    projection,
    (fileListErr, fileList) => {
      if (fileListErr) {
        return common.sendErrorResponse(res, "Error in getting files list");
      }

      return res.send({
        msg: "Successfully got files list",
        filesList: fileList,
      });
    }
  );
}

function handleGetFileFromS3(req, res) {
  const fileId = req.params.fileId;

  if (!common.isObjectId(fileId)) {
    return common.sendErrorResponse(res, "Enter valid file Id");
  }

  filesController.getFileFromS3(fileId, res);
}

function handleGetFileByUniqName(req, res) {
  const uniqFileName = req.body.fileName;

  if (!common.validateString(uniqFileName)) {
    return common.sendErrorResponse(res, "Enter valid file name");
  }

  filesController.getFileByUniqName(uniqFileName, res);
}

function handleDeleteFileFromS3(req, res) {
  const fileId = req.params.fileId;

  if (!common.isObjectId(fileId)) {
    return common.sendErrorResponse(res, "Enter valid file Id");
  }

  filesController.deleteFileFromCloud(fileId, res);
}

function handleFileUrl(req, res) {
  const fileId = req.params.fileId;

  if (!common.isObjectId(fileId)) {
    return common.sendErrorResponse(res, "Enter valid file Id");
  }

  filesController.getFileUlr(res, fileId, (fileUrl) => {
    return res.send({
      msg: "Successfully got file URL",
      fileUrl: fileUrl,
    });
  });
}

function handleFileUrlByFileName(req, res) {
  const uniqFileName = req.params.uniqFileName;

  if (!common.validateString(uniqFileName)) {
    return common.sendErrorResponse(res, "Enter valid file name");
  }

  filesController.getFileUrlByName(res, uniqFileName, (fileObj) => {
    return res.send({
      msg: "Successfully got file URL",
      fileUrl: fileObj.fileUrl,
      file: fileObj.file,
    });
  });
}

function handleDownloadtFileByUniqName(req, res) {
  const uniqFileName = req.params.uniqFileName;

  if (!common.validateString(uniqFileName)) {
    return common.sendErrorResponse(res, "Enter valid file name");
  }

  filesController.getFileByUniqName(uniqFileName, res);
}

module.exports = router;
