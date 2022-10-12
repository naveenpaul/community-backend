const event = require("../models/events");
const like = require("../controllers/likes");
const comment = require("./comments");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

const likeController = new like();
const commentController = new comment();

function Event() {}

Event.prototype.addEvent = (req, res, callback) => {
    const newEvent = new event({
        createdAt: req.body.createdAt,
        updatedAt: req.body.updatedAt,
        cId: req.body.cId,
        cName: req.body.cName,
        name: req.body.name,
        description: req.body.description,
        location: {
            long: req.body.location.long,
            lat: req.body.location.lat,
        },
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
    const cId = req.body.cId == null ? "" : req.body.cId;

    event
        .find({
            cId: common.castToObjectId(cId),
        })
        .lean()
        .exec((err, existingEvent) => {
            if (err || !existingEvent) {
                return common.sendErrorResponse(res, "Error in getting Event");
            }

            existingEvent = existingEvent || [];
            existingEvent.forEach((event) => {
                event.link = "/event/" + event._id;
            });

            return res.send({
                events: existingEvent,
                msg: "Successfully got all events",
                length: existingEvent.length,
            });
        });
};

Event.prototype.updateEvent = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
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
                    location: {
                        long: req.body.location.long,
                        lat: req.body.location.lat,
                    },
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
            },
            (Err, updated) => {
                if (Err || !updated) {
                    return common.sendErrorResponse(res, "Error in upating the event");
                }

                return res.send({ msg: "Updated the Event" });
            }
        );
    });
};

Event.prototype.removeEvent = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        event.deleteOne({ _id: id }, (deleteErr, deleteEvent) => {
            if (deleteErr || !deleteEvent) {
                return common.sendErrorResponse(res, "Failed to delete the Event");
            }
            return res.send({ msg: "Succcessfully removed the event" });
        });
    });
};
Event.prototype.getAllLike = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);
    req.body.sourceId = req.body.eventId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        likeController.getAllLikes(req, res);
    });
};

Event.prototype.getAllComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);
    req.body.sourceId = req.body.eventId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        commentController.getAllComments(req, res);
    });
};

Event.prototype.addLike = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);
    req.body.sourceId = req.body.eventId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        event.updateOne(
            { _id: id },
            {
                $inc: { likesCount: 1 },
            },
            (Err, updated) => {
                if (Err || !updated) {
                    return common.sendErrorResponse(res, "error in incrementing the count");
                }
                likeController.addLike(req, res, (Err, saved) => {
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in adding the like");
                    }
                    return res.send({ msg: "Successfully added the like" });
                });
            }
        );
    });
};

Event.prototype.addComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);
    req.body.sourceId = req.body.eventId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        event.updateOne(
            { _id: id },
            {
                $inc: { commentsCount: 1 },
            },
            (Err, updated) => {
                if (Err || !updated) {
                    return common.sendErrorResponse(res, "error in incrementing the count");
                }
                commentController.addComment(req, res, (Err, saved) => {
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in adding the comment");
                    }
                    return res.send({ msg: "Successfully added the comment" });
                });
            }
        );
    });
};

Event.prototype.removeLike = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);
    req.body.sourceId = req.body.eventId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        event.updateOne(
            { _id: id },
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
                    // return res.send({ msg: "successfully removed like" });
                });
            }
        );
    });
};

// Event.prototype.updateComment=(req,res,emailId)=>{
//     const cId = common.castToObjectId(req.body.cId);
//     const id = common.castToObjectId(req.body.eventId);

//     community.findOne({ _id: cId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
//         if (communityErr || !existingcomm) {
//             return common.sendErrorResponse(res, "You don't have access to specified community");
//         }
//         commentController.removeComment(req,res);

//     });

// }

Event.prototype.removeComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);
    req.body.sourceId = req.body.eventId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        event.updateOne(
            { _id: id },
            {
                $inc: { commentsCount: -1 },
            },
            (Err, updated) => {
                if (Err || !updated) {
                    return common.sendErrorResponse(res, "error in incrementing the count");
                }
                commentController.removeComment(req, res, (Err, saved) => {
                    if (Err || !saved) {
                        return common.sendErrorResponse(res, "Error in removing the comment");
                    }
                    return res.send({ msg: "Successfully removed the comment" });
                });
            }
        );
    });
};

module.exports = Event;
