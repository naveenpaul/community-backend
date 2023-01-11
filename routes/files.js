const express = require("express");
const router = express.Router();
const commonUtility = require("../common/commonUtility");
const files = require("../controllers/files");
const common = new commonUtility();
const filesController = new files();

router.post("/file/upload", common.authorizeUser, handleFileUpload);
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
    return common.sendErrorResponse(res, "No file uploaded");
  }

  if (!req.body.sourceId) {
    return common.sendErrorResponse(res, "Enter valid source Id");
  }

  const uploadFile = files[0];
  const uploadObj = {
    source: req.body.source,
    sourceId: common.isObjectId(req.body.sourceId),
    type: filesController.extractTypeFromMimeType(uploadFile.mimetype),
    fileName: uploadFile.fieldname,
    uniqFileName: uploadFile.originalname,
    tag: req.body.tag ? JSON.parse(req.body.tag) : {},
  };

  filesController.uploadFileCloud(uploadFile.path, uploadObj, res);
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
