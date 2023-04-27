const express = require("express");
const router = express.Router();
const  {spawn,fork}=require("child_process")
const  path = require('path')
const commonUtility = require("../common/commonUtility");
const files = require("../controllers/files");
const video =require('../controllers/videoCompress');
const userControl = require("../controllers/user");
const community = require("../controllers/community");
const Post = require("../controllers/posts");
const notificationControl = require('../controllers/notification-service')
const matrimony=require("../controllers/matrimony_user")
const communityModel = require("../models/community");
const event = require("../controllers/events");
const common = new commonUtility();
const filesController = new files();
const postController = new Post();
const userController = new userControl();
const communityController = new community();
const notificationController= new notificationControl();
const matrimonyController=new matrimony();

const eventController = new event();
const async = require("async");

router.post("/file/upload", common.authorizeUser, handleFileUpload);
router.post(
  "/file/upload/post",
  common.authorizeUser,
  handleFileUploadPost
);
router.post("/file/upload/video",common.authorizeUser, handleFileUploadVideo);
router.post('/file/upload/event',common.authorizeUser,handleFileUploadEvent);
router.post("/file/upload/matrimony", common.authorizeUser, handleFileuploadMatrimony);
router.put("/file/update/post", common.authorizeUser, handleFileUpdatePost);
router.put("/file/update/video", common.authorizeUser, handleFileUpdateVideo);
router.put("/file/update/event", common.authorizeUser,handleFileUpdateEvent);
router.put("/file/update/matrimony", common.authorizeUser, handleFileUpdateMatrimony);
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
  var fileName ="";
  if(req)
  console.log(req.body.tag)
  const uploadFile = files[0];
  const uploadObj = {
    source: req.body.source,
    sourceId: common.castToObjectId(req.body.sourceId),
    type: filesController.extractTypeFromMimeType(uploadFile.mimetype),
    fileName: uploadFile.originalname,
    uniqFileName: uploadFile.originalname,
    tag: req.body.tag ?? '',
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
         
          var tags=req.body.tags;
          req.body=req.query;
          req.body.cId=community._id;
          req.body.cName=community.name;
          req.body.tags=tags;
          // console.log(req.body.tags);
          postController.addPost(req, res, existingUser, (Err, post) => {
            if (Err || !post) {
              return common.sendErrorResponse(res, "Error in adding the Post");
            }
            async.each(
              files,
              function (file, callback) {
                const uploadObj = {
                  source: "POST",
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

                  notificationController.sendNotification(req,newPost,'post',(err,response)=>{
                    if(err){console.log('error in sending the notification');}
                    return res.send({
                      msg: "Successfully saved file",
                      data: newPost,
                    });
                    return;
                  })
                });
              }
            );
          });
        }
      );
    }
  );
}

function handleFileuploadMatrimony(req, res) {
  const files = req.files || [];
  req.body.source="MATRIMONYUSER";
  const userId = common.getUserId(req);
  const tags = req.body.tags;
  // if (files.length == 0) {
  //   return common.sendErrorResponse(res, "No files found");
  // }

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      matrimonyController.addUser(req, res, (Err, user) => {
            if (Err || !user) {
              console.log(Err)
              return common.sendErrorResponse(res, "Error in adding the User");
            }
            async.forEachOf(
              files,
              function (file, index,callback) {
                imageNumber= user.profilePicCount+index;
                const uploadObj = {
                  source: "MATRIMONYUSER",
                  sourceId: user._id,
                  type: filesController.extractTypeFromMimeType(file.mimetype),
                  fileName: file.originalname,
                  uniqFileName: "matrimony/"+user._id + '/'+imageNumber+".jpg" , //path.extname(file.originalname),
                  tag: index==0? "PROFILEPIC":"",
                };

                filesController.uploadFileCloud(
                  file.path,
                  uploadObj,
                  res,
                  callback
                );
              },
              function (err, results) {
                req.params.userId = user._id;
                matrimonyController.getUserById(req, res, function (err, newUser) {
                  return res.send({
                    msg: "Successfully update the Images",
                  });
                  notificationController.sendNotification(req,newPost,'post',(err,response)=>{
                    if(err)console.log('error in sending the notification');
                    
                  })
                });
              }
            );
          });
    }
  );
}
function handleFileUploadVideo(req, res) {
  const files = req.files || [];
  const userId = common.getUserId(req);
  const tags = req.body.tags;
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
          req.body.tags=JSON.parse(tags) ;
          postController.addPost(req, res, existingUser, (Err, post) => {
            if (Err || !post) {
              return common.sendErrorResponse(res, "Error in adding the Post");
            }
            
            async.each(
              files,
              function (file, callback) {
                const child = fork("controllers/videoCompress.js");
                const filePath=file.path;
                child.send({ tempFilePath: filePath ,name: file.originalname });

                //wasm ffmpeg  was not able to make it work
                // const videoPath=file.path;
                // const outputFileName = `compressed_${file.filename}`;
                // const ffmpeg = spawn('ffmpeg', 
                // ['-i', videoPath, '-vf', 'scale=-2:480', '-c:v', 
                // 'libx264', '-crf', '24', '-preset', 'medium', '-c:a', 
                // 'copy', path.join(__dirname, `uploads/${outputFileName}`)]);
                // ffmpeg.stdout.on('data', (data) => {
                //   console.log(`stdout: ${data}`);
                // });

                // ffmpeg.stderr.on('data', (data) => {
                //   console.error(`stderr: ${data}`);
                // });
              
                // ffmpeg.on('close', (code) => {
                //   console.log(`FFmpeg process exited with code ${code}`);
                //   res.download(path.join(__dirname, `uploads/${outputFileName}`));
                // });
                child.on("message", (message) => {
                  const { statusCode, text,fileName } = message;
                  if(statusCode!=200){
                    console.log(statusCode);
                    return common.sendErrorResponse(res,text);
                  }
              
                  const uploadObj = {
                    source: req.body.source,
                    sourceId: post._id,
                    type: filesController.extractTypeFromMimeType(file.mimetype),
                    fileName: fileName,
                    uniqFileName: file.originalname,
                    tag: req.body.tag ? JSON.parse(req.body.tag) : {},
                  };
  
                  filesController.uploadFileCloud(
                    `${filePath}.mp4`,
                    uploadObj,
                    res,
                    callback
                  );
                  
                });
              },
              function (err, results) {
                req.params.postId = post._id;
                postController.getPostById(req, res, function (err, newPost) {
                
                  notificationController.sendNotification(req,newPost,'post',(err,response)=>{
                    if(err){
                      console.log('error in sending the notification');
                    }
                    return res.send({
                      msg: "Successfully saved file",
                      data: newPost,
                    });
                  })
                  
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
                  if(err){
                    console.log('err in getting the event');
                  }
                  notificationController.sendNotification(req,newEvent,'event',(err,response)=>{
                    if(err){
                      console.log('error in sending the notification');
                    }
                    return res.send({
                      msg: "Successfully saved file",
                      data: newEvent,
                    });
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
  // console.log(files.length);
  // console.log(deletedFiles.length);

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
         
            //upload new files
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
                if(err){
                  // console.log("Error while uploading files");
                  return common.sendErrorResponse(res,"Error while uploading files");
                }
                async.each(
                  deletedFiles,
                  function (deletedFile,callback){
                    console.log(deletedFile);
                  postController.removeImage(common.castToObjectId(req.query.sourceId),common.castToObjectId(deletedFile),res,callback);
                  }, function (err,){
                    if( err ) {
                      // console.log("Error in deleting Files");
                      return common.sendErrorResponse(res,"Error in deleting Files");
                  } 
                  console.log("Deleted Files")
                  console.log(req.query)
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

function handleFileUpdateVideo(req,res){
  const files = req.files || [];
  const deletedFiles= req.body.deleted || [];
  const userId = common.getUserId(req);
  // console.log(files.length);
  console.log(deletedFiles.length);

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
            //upload new files
            async.each(
              files,
              function (file, callback) {
                const child = fork("controllers/videoCompress.js");
                const filePath=file.path;
                child.send({ tempFilePath: filePath ,name: file.originalname });

                child.on("message", (message) => {
                  const { statusCode, text,fileName } = message;
                  if(statusCode!=200){
                    console.log(statusCode);
                    return common.sendErrorResponse(res,text);
                  }
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
                    `${filePath}.mp4`,
                    uploadObj,
                    res,
                  callback
                  );
                  
                });

               
              },
              function (err, results) {
                //update the post
                if(err){
                  // console.log("Error while uploading files");
                  return common.sendErrorResponse(res,"Error while uploading files");
                }
                async.each(
                  deletedFiles,
                  function (deletedFile,callback){
                    console.log(deletedFile);
                  postController.removeImage(common.castToObjectId(req.query.sourceId),common.castToObjectId(deletedFile),res,callback);
                  }, function (err,){
                    if( err ) {
                      // console.log("Error in deleting Files");
                      return common.sendErrorResponse(res,"Error in deleting Files");
                  } 
                var tags=req.body.tags;
                console.log(tags);
                //we should not lost tags
                req.body=req.query;
                req.body.postId=req.query.sourceId;
                req.body.cId=req.query.cId;
                req.body.tags=JSON.parse(tags);
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
  // console.log(files.length);

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
                if(err){
                  // console.log("Error while uploading files");
                  return common.sendErrorResponse(res,"Error while uploading files");
                }
                async.each(
                  deletedFiles,
                  function (deletedFile,callback){
                  eventController.removeImage(common.castToObjectId(req.query.sourceId),common.castToObjectId(deletedFile),res,callback);
                  }, function (err){
                    if( err ) {
                      // console.log("Error in deleting Files");
                      return common.sendErrorResponse(res,"Error in deleting Files");
                  } 
                  console.log("deleted files")
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

function handleFileUpdateMatrimony(req, res) {
  const files = req.files || [];
  req.body.source="MATRIMONYUSER";
  const userId = common.getUserId(req);
  const tags = req.body.tags;
  // console.log(req.body)
  // if (files.length == 0) {
  //   return common.sendErrorResponse(res, "No files found");
  // }

  userController.findUserByUserId(
    common.castToObjectId(userId),
    { _id: 0 },
    (err, existingUser) => {
      if (err || !existingUser) {
        return common.sendErrorResponse(res, "Error getting User Details");
      }
      matrimonyController.getUserByOwnerId(req, res, (Err, user) => {
            if (Err || !user) {
              console.log(Err)
              return common.sendErrorResponse(res, "Error in adding the User");
            }
            async.forEachOf(
              files,
              function (file, index,callback) {
                let imageNumber= user.profilePicCount+index;
                if(req.body.tag=="PROFILEPIC")imageNumber=0;
                const uploadObj = {
                  source: "MATRIMONYUSER",
                  sourceId: user._id,
                  type: filesController.extractTypeFromMimeType(file.mimetype),
                  fileName: file.originalname,
                  uniqFileName: "matrimony/"+user._id + '/'+imageNumber+".jpg" , //path.extname(file.originalname),
                  tag: req.body.tag ?? {},
                };

                filesController.uploadFileCloud(
                  file.path,
                  uploadObj,
                  res,
                  callback
                );
              },
              function (err, results) {
                //delete the images
                console.log(req.body.deletedFiles)
                matrimonyController.removeImage(user._id,req.body.deletedFiles,res,(err,data)=>{
                  if(err)console.log('not able to delete the images');
                  return res.send({
                    msg: "Successfully updated the Images",
                  });
                })
                
              }
            );
          });
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
