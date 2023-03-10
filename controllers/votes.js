const votes = require("../models/Votes");
const commonUtility  = require("../common/commonUtility")
const common = new commonUtility();
const _ = require("lodash");

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
  var deletedOptions=req.body.deletedOptions?  req.body.deletedOptions.map(function (element) {
    return common.castToObjectId(element);
  })
  : [];
  votes.deleteMany(
    {sourceId:common.castToObjectId(req.body.sourceId),optionId:{ $in:deletedOptions} },
    callback
  )
}

Vote.prototype.isVoted=(sourceIds,user,callback)=>{
  votes
    .find({
      userId: common.castToObjectId(user._id),
      sourceId: { $in: sourceIds },
    })
    .lean()
    .exec(function (err, votes) {
      callback(err, _.keyBy(votes, "sourceId"));
    });
}
module.exports = Vote;