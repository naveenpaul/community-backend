const Events = require("../models/Events");
const like = require("./likes");
const comment = require("./comments");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();
const _ = require("lodash");
const { event } = require("jquery");

const likeController = new like();
const commentController = new comment();

function Event() {}

Event.prototype.addEvent = (req, res, existingUser, callback) => {
  const newEvent = new Events({
    createdAt: new Date(),
    updatedAt: new Date(),
    cId: req.body.cId,
    cName: req.body.cName,
    name: req.body.name,
    description: req.body.description,
    location: {
      long: req.body.location.long,
      lat: req.body.location.lat,
    },
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    address: {
      name: req.body.address,
      city: req.body.city,
      pincode: req.body.pincode,
      state: req.body.state,
      country: req.body.country,
    },
    type: req.body.type,
    likesCount: 0,
    commentsCount: 0,
  });
  newEvent.save(callback);
};

Event.prototype.getAllEvent = (req, res) => {
  const cId = req.body.cId == null ? "" : req.body.cId;

  Events.find({
    cId: common.castToObjectId(cId),
  })
    .lean()
    .exec((err, existingEvent) => {
      if (err || !existingEvent) {
        return common.sendErrorResponse(res, "Error in getting Event");
      }

      existingEvent = existingEvent || [];
      existingEvent.forEach((event) => {
        Events.link = "/event/" + Events._id;
      });

      return res.send({
        events: existingEvent,
        msg: "Successfully got all events",
        length: existingEvent.length,
      });
    });
};

Event.prototype.getEventsFeed = (req, res, user) => {
  let pageNumber = parseInt(req.params.pageNumber);
  if (pageNumber == 0) {
    pageNumber = 1;
  }
  const limit = 10;
  const offset = (pageNumber - 1) * limit;
  const filter =
  req.query.cId && req.query.cId.length> 5
      ? { createdAt: { $lt: new Date() }, cId: common.castToObjectId(req.query.cId) }
      : { createdAt: { $lt: new Date() } };
  Events.find(filter)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean()
    .exec(function (err, allEvents) {
      likeController.isPostLiked(
        _.map(allEvents, "_id"),
        user,
        function (err, likesMap) {
          allEvents.forEach((post) => {
            post.isLiked = likesMap[post._id] ? true : false;
            post.userName = user.fullName;
          });
          res.send({
            events: allEvents,
            msg: "Successfully got Events",
          });
        }
      );
    });
};

Event.prototype.getEventById = async (req, res, callback) => {
  const filterQuery = {
    _id: common.castToObjectId(req.params.eventId),
  };
  const projection = {};
  try {
    const existingEvent = await Events.findOne(filterQuery, projection).exec();

    if (!existingEvent) Promise.reject();

    if(!callback)
    {
    res.send({
      event: existingEvent,
      msg: "Successfully got the event",
    });
  }
   else { callback(null,existingEvent);}

  } catch (err) {
    console.log(err.toString());
    return common.sendErrorResponse(res, "Error in getting event");
  }
};

Event.prototype.updateEvent = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.eventId);
  console.log(cId);

  community.findOne(
    { _id: cId, "staff._id": common.getUserId(req) },
    (communityErr, existingcomm) => {
      if (communityErr || !existingcomm) {
        return common.sendErrorResponse(
          res,
          "You don't have access to specified community"
        );
      }
      Events.updateOne(
        { _id: id },
        {
          $set: {
            updatedAt: Date.now(),
            name: req.body.name,
            description: req.body.description,
            // location: {
            //   long: req.body.location.long,
            //   lat: req.body.location.lat,
            // },
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            type: req.body.type,
            address: {
              name: req.body.address,
              city: req.body.city,
              pincode: req.body.pincode,
              state: req.body.state,
              country: req.body.country,
            },
          },
        },
        (Err, updated) => {
          if (Err || !updated) {
            return common.sendErrorResponse(res, "Error in upating the event");
          }

          return res.send({ msg: "Updated the Event" });
        }
      );
    }
  );
};

Event.prototype.removeEvent = (req, res, emailId) => {
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
      //needs to add the logic for the deletiion of content such as images when we solve s3 issue
      Events.deleteOne({ _id: id }, (deleteErr, deleteEvent) => {
        if (deleteErr || !deleteEvent) {
          return common.sendErrorResponse(res, "Failed to delete the Event");
        }
        likeController.removeAllLikesOfSource(req, (Err, removed) => {
          if (Err || !removed) {
            return common.sendErrorResponse(res, "not able to remove the likes");
            }
        commentController.removeAllCommentsOfSource(req, (Err, removed) => {
          if (Err || !removed) {
            return common.sendErrorResponse(res, "Not able to remove comments");
            }
        return res.send({ msg: "Succcessfully removed the Post" });
      });
    }
  );
      });
    }
  );
};
Event.prototype.getAllLike = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.eventId);
  req.body.sourceId = req.body.eventId;

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

Event.prototype.getAllComment = (req, res, emailId) => {
  const cId = common.castToObjectId(req.body.cId);
  const id = common.castToObjectId(req.body.eventId);
  req.body.sourceId = req.body.eventId;

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

Event.prototype.addLike = (req, res, user) => {
  req.body.source = "EVENT";
      Events.updateOne(
        { _id:  common.castToObjectId(req.body.sourceId)},
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
          likeController.addLike(req, res, user,(Err, saved) => {
            if (Err || !saved) {
              return common.sendErrorResponse(res, "Error in adding the like");
            }
            return res.send({ msg: "Successfully added the like" });
          });
        }
      );
  
};

Event.prototype.addComment = (req, res, user) => {
  req.body.source = "EVENT";
  Events.updateOne(
    { _id: common.castToObjectId(req.body.sourceId) },
    {
      $inc: { commentsCount : 1 },
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

Event.prototype.removeLike = (req, res) => {
  Events.updateOne(
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
        return res.send({ msg: "Successfully rwemoved  the like" });
      });
    }
  );
};

Event.prototype.removeComment = (req, res, emailId) => {
      Events.updateOne(
        { _id: common.castToObjectId(req.body.sourceId), },
        {
          $inc: { commentsCount: -1 },
        },
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
  
};
Event.prototype.removeImage = (eventId,fileId, res, callback) =>{
Events.updateOne(
   {_id:eventId},
   {
     $pull:{ thumbnail:{sourceId:fileId}}
   }
  ).exec(callback);
}

module.exports = Event;
