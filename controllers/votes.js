const votes = require("../models/Votes");
const commonUtility  = require("../common/commonUtility")
const common = new commonUtility();

function Vote(){}

Vote.prototype.addVote=(req,res,callback)=>{
  const newVote= new votes({
    sourceId: common.castToObjectId(req.body.sourceId),
    userId:common.getUserId(req),
    optionId:common.castToObjectId(req.body.optionId),
  });
  newVote.save(callback);
}

Vote.prototype.removeVote=(req,res,callback)=>{
  votes.deleteOne(
    {userId:common.getUserId(req),sourceId: common.castToObjectId(req.body.sourceId)},
    (deleteErr,deleteVote)=>{
      if(deleteErr || !deleteVote){
        return common.sendErrorResponse(res,"Failed to deete the vote");

      }
      callback(deleteErr,deleteVote);
    }
  )
};
//remove all votes for the deleted option when editing the post (garbage votes)
Vote.prototype.removeVotesForOption=(req,res,callback)=>{
  votes.deleteMany(
    {optionId:common.castToObjectId(req.body.sourceId)},
    callback
  )
}
module.exports = Vote;