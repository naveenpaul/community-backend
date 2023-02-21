const FilesModel = require("../models/files");
const AWS = require("aws-sdk");
const fs = require("fs");

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const posts = require("../models/Posts");
const Events = require("../models/Events");

const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
const s3 = new AWS.S3();

function Files() {}

Files.prototype.uploadFileCloud = (filePath, uploadFileObj, res, callback) => {
  console.log(`uplaod: ${filePath}`);
  fs.readFile(filePath, (fileReadErr, fileData) => {
    if (fileReadErr) {
      console.log(`err:${fileReadErr}`)
      return common.sendErrorResponse(res, "Error in uploading file");
    }

    uploadFileToS3(
      uploadFileObj.uniqFileName,
      fileData,
      (s3UploadErr, uploadedFile) => {
        if (s3UploadErr) {
          removeFileFromStorage(filePath);
          return common.sendErrorResponse(res, "Error in upload file to S3");
        }

        uploadFileObj.location =
          "https://dev-oasis-project-files.s3.ap-south-1.amazonaws.com/" +
          uploadFileObj.uniqFileName;

        const newFlile = new FilesModel(uploadFileObj);

        newFlile.save((fileSaveErr, savedFile) => {
          // console.log(uploadFileObj);
          // console.log(fileSaveErr);
          if (fileSaveErr) {
            removeFileFromS3(
              uploadFileObj.uniqFileName,
              (removeFileS3Err, removedFileS3) => {}
            );

            if (callback) {
              callback(removeFileS3Err, removeFileS3Err);
            } else {
              return common.sendErrorResponse(
                res,
                "Error in saving file entry to db"
              );
            }
          }

          if (uploadFileObj.source == "POST") {
            posts
              .updateOne(
                { _id: common.castToObjectId(String(uploadFileObj.sourceId)) },
                {
                  $push: {
                    thumbnail: {
                      url: savedFile.location,
                      sourceId: savedFile._id,
                    },
                  },
                }
              )
              .exec(function (err, results) {
                removeFileFromStorage(filePath);
                if (callback) {
                  callback(null, {
                    msg: "Successfully saved file",
                    file: savedFile,
                  });
                } else {
                  return res.send({
                    msg: "Successfully saved file",
                    file: savedFile,
                  });
                }
              });
          } else if (uploadFileObj.source == "EVENT") {
            Events.updateOne(
              { _id: common.castToObjectId(String(uploadFileObj.sourceId)) },
              {
                $push: {
                  thumbnail: {
                    url: savedFile.location,
                    sourceId: savedFile._id,
                  },
                },
              }
            ).exec(function (err, results) {
              removeFileFromStorage(filePath);
              if (callback) {
                callback(null, {
                  msg: "Successfully saved file",
                  file: savedFile,
                });
              } else {
                return res.send({
                  msg: "Successfully saved file",
                  file: savedFile,
                });
              }
            });
          } else {
            return res.send({
              msg: "Successfully saved file",
              file: savedFile,
            });
          }
        });
      }
    );
  });
};

Files.prototype.extractTypeFromMimeType = (mimetype) => {
  const splitMimetypes = mimetype ? mimetype.split("/") : [];
  return splitMimetypes.length == 2 ? splitMimetypes[1] : "";
};

Files.prototype.getFileListBySource = (sourceId, projection, callback) => {
  FilesModel.find({ sourceId: sourceId }, projection, callback);
};

Files.prototype.getFileFromS3 = (fileId, res) => {
  FilesModel.findOne(
    { _id: common.castToObjectId(fileId) },
    { uniqFileName: 1 },
    (fileByIdErr, fileById) => {
      if (fileByIdErr || (fileById && !fileById.uniqFileName)) {
        return common.sendErrorResponse(res, "Error in getting file details");
      }

      getFileFromS3(fileById.uniqFileName, (fileFromS3Err, fileFromS3) => {
        if (fileFromS3Err) {
          return common.sendErrorResponse(res, "Error in getting file from S3");
        }

        return res.send(fileFromS3.Body);
      });
    }
  );
};

Files.prototype.getFilesByQuery = (query, projection, callback) => {
  FilesModel.find(query, projection, (filesErr, files) => {
    if (filesErr || !files) {
      callback([]);
    } else {
      callback(files);
    }
  });
};

Files.prototype.getFileByUniqName = (uniqFileName, res) => {
  getFileFromS3(uniqFileName, (fileFromS3Err, fileFromS3) => {
    if (fileFromS3Err) {
      return common.sendErrorResponse(res, "Error in getting file from S3");
    }
    return res.send(fileFromS3.Body);
  });
};

Files.prototype.deleteFileFromCloud = (fileId, res,callback) => {
  fileId = common.castToObjectId(fileId);
  console.log(fileId);
  FilesModel.findOne(
    { _id: fileId },
    (fileByIdErr, fileById) => {
      if (fileByIdErr || (fileById && !fileById.fileName)) {
        console.log(fileByIdErr);
        console.log(fileById);
        return common.sendErrorResponse(res, "Error in getting file details");
      }
      console.log(fileById.fileName);
      removeFileFromS3(fileById.fileName, (fileFromS3Err, fileFromS3) => {
        if (fileFromS3Err) {
          console.log(fileFromS3Err)
          return common.sendErrorResponse(
            res,
            "Error in deleting file from S3"
          );
        }

        FilesModel.remove({ _id: fileId }, (fileRemoveErr, removedFile) => {
          if (fileRemoveErr) {
            return common.sendErrorResponse(
              res,
              "Error in removing file details"
            );
          }
          if(callback){
            callback({msg:"deleted file"});
          }
          else{
            return res.send({
            msg: "Successfully deleted file from S3",
          });}
        });
      });
    }
  );
};

Files.prototype.getFileUlr = (res, fileId, callback) => {
  fileId = common.castToObjectId(fileId);

  FilesModel.findOne(
    { _id: fileId },
    { uniqFileName: 1 },
    (fileByIdErr, fileById) => {
      if (fileByIdErr || !fileById || !fileById.uniqFileName) {
        return common.sendErrorResponse(res, "Error in getting file details");
      }

      getSignedUrl(fileById.uniqFileName, (ulrError, fileUrl) => {
        fileUrl = fileUrl || "";
        if (ulrError) {
          console.log("Error in getting the file URL");
        }

        callback(fileUrl);
      });
    }
  );
};

Files.prototype.getFileUrlByName = (res, uniqFileName, callback) => {
  FilesModel.findOne(
    { uniqFileName: uniqFileName },
    { type: 1, fileName: 1, uniqFileName: 1 },
    (fileByIdErr, fileById) => {
      if (fileByIdErr || !fileById || !fileById.uniqFileName) {
        return common.sendErrorResponse(res, "Error in getting file details");
      }

      getSignedUrl(uniqFileName, (ulrError, fileUrl) => {
        fileUrl = fileUrl || "";
        if (ulrError) {
          console.log("Error in getting the file URL");
        }

        callback({
          fileUrl: fileUrl,
          file: fileById || {},
        });
      });
    }
  );
};

const removeFileFromStorage = (filePath) => {
  fs.unlink(filePath, (unlinkErr) => {});
};

const uploadFileToS3 = (uniqFileName, fileData, callback) => {
  const s3Params = {
    Bucket: process.env.S3_PROJECT_FILES_BUCKET_NAME,
    Key: uniqFileName,
    Body: fileData,
  };

  s3.putObject(s3Params, callback);
};

const removeFileFromS3 = (uniqFileName, callback) => {
  const s3Params = {
    Bucket: process.env.S3_PROJECT_FILES_BUCKET_NAME,
    Key: uniqFileName,
  };

  s3.deleteObject(s3Params, callback);
};

const getFileFromS3 = (uniqFileName, callback) => {
  const s3Params = {
    Bucket: process.env.S3_PROJECT_FILES_BUCKET_NAME,
    Key: uniqFileName,
  };

  s3.getObject(s3Params, callback);
};

const getSignedUrl = (uniqFileName, callback) => {
  const s3Params = {
    Bucket: process.env.S3_PROJECT_FILES_BUCKET_NAME,
    Key: uniqFileName,
  };

  s3.getSignedUrl("getObject", s3Params, callback);
};

module.exports = Files;
