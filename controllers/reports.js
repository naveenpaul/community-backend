const reports = require("../models/Reports")
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

function Report() {}

Report.prototype.addReport=(req,res,user,callback)=>{
  const newReport = new reports({
    sourceType: req.body.sourceType, 
    sourceId: common.castToObjectId(req.body.sourceId),
    userId:common.getUserId(req),
    message: req.body.message
  });

  newReport.save(callback);
}
Report.prototype.deleteReport=(req,res,user,callback)=>{
  reports.deleteOne(
    {_id:req.sourceId,userId: common.getUserId(req)},
    (deleteErr,deletedReport)=>{
      if (deleteErr || !deletedReport) {
        return common.sendErrorResponse(res, "Failed to delete the report");
      }
      return res.send({ msg: "Succcessfully removed the report" });
    }
  )
}

module.exports = Report;