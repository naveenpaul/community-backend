const event = require('../models/Events');
const like = require('../controllers/like');
const comment = require('../controllers/comment');
const community = require('../models/Community');
const commonUtility = require('../common/commonUtility');
const common = new commonUtility();

const likeController = new like();
const commentController = new comment();

function Event() {}

Event.prototype.addEvent = (req, res, callback) => {
    const newEvent = new Event({
        createdAt: req.body.createdAt,
        updatedAt: req.body.updatedAt,
        commId: req.body.commId,
        commName: req.body.commName,
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
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
    const commId = req.body.commId == null ? '' : req.body.commId;

    event
        .find({
            commId: common.castToObjectId(commId),
        })
        .lean()
        .exec((err, existingEvent) => {
            if (err || !existingEvent) {
                return common.sendErrorResponse(res, 'Error in getting Event');
            }

            existingEvent = existingEvent || [];
            existingEvent.forEach((event) => {
                event.link = '/event/' + event._id;
            });

            return res.send({
                events: existingEvent,
                msg: 'Successfully got all events',
                length: existingEvent.length,
            });
        });
};

Event.prototype.updateEvent = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.EventId);

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        event.updateOne(
            { _id: id },
            {
                $set: {
                    updatedAt: req.body.updatedAt,
                    name: req.body.name,
                    description: req.body.description,
                    location: req.body.location,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    address: {
                        name: req.body.address,
                        city: req.body.city,
                        pincode: req.body.pincode,
                        state: req.body.state,
                        country: req.body.country,
                    },
                    type: req.body.type,
                },
            }
        );
    });
};

Event.prototype.removeEvent = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.EventId);

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        event.deleteOne({ _id: id }, (deleteErr, deleteEvent) => {
            if (deleteErr || !deleteEvent) {
                return common.sendErrorResponse(res, 'Failed to delete the Event');
            }
            return res.send({ msg: 'Succcessfully removed the event' });
        });
    });
};
Event.prototype.getAllLike = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.contentId = id;

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

      likeController.getAllLike(req,res);
        
    });
};

Event.prototype.getAllComment=(req,res,emailId)=>{
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.contentId = id;

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

      commentController.getAllComment(req,res);
        
    });
}


Event.prototype.addLike = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.contentId = id;

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        likeController.addLike(req, res, (Err, saved) => {
            if (Err || !saved) {
                return common.sendErrorResponse(res, 'Error in adding the Event');
            }
        });
        event.updateOne(
            { _id: id },
            {
                $set: {
                    likesCount: { $inc: 1 },
                },
            }
        );
    });
};

Event.prototype.addComment = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.contentId = id;

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        commentController.addComment(req,res,(err,addedComment)=>{
            if(err|| !addedComment){
                common.sendErrorResponse(res,"failed to add the comment");
            }
        });
        event.updateOne(
            { _id: id },
            {
                $set: {
                    commentsCount: { $inc: 1 },
                },
            }
        );
    });
};

Event.prototype.removeLike = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.contentId = id;

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        likeController.removeLike(req,res);
        event.updateOne(
            { _id: id },
            {
                $set: {
                    likesCount: { $inc: -1 },
                },
            }
        );
    });
};

// Event.prototype.updateComment=(req,res,emailId)=>{
//     const commId = common.castToObjectId(req.body.commId);
//     const id = common.castToObjectId(req.body.EventId);

//     community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
//         if (communityErr || !existingcomm) {
//             return common.sendErrorResponse(res, "You don't have access to specified community");
//         }
//         commentController.removeComment(req,res);
    
//     });

// }

Event.prototype.removeComment = (req, res, emailId) => {
    const commId = common.castToObjectId(req.body.commId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.contentId = id;

    community.findOne({ _id: commId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        commentController.removeComment(req,res);
        event.updateOne(
            { _id: id },
            {
                $set: {
                    commentsCount: { $inc: -1 },
                },
            }
        );
    });
};

module.exports = Event;
