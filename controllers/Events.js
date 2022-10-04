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
    const id = common.castToObjectId(req.body.EventId);

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
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.EventId);

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
    const id = common.castToObjectId(req.body.EventId);
    req.body.sourceId = id;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        likeController.getAllLike(req, res);
    });
};

Event.prototype.getAllComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.sourceId = id;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        commentController.getAllComment(req, res);
    });
};

Event.prototype.addLike = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.sourceId =req.body.EventId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }

        likeController.addLike(req, res, (Err, saved) => {
            if (Err || !saved) {
                return common.sendErrorResponse(res, "Error in adding the Event");
            }
            event.updateOne(
                { _id: id },
                {
                    $set: {
                        "likesCount": { $add:["$likesCount",1]},
                    },
                },
                (Err,updated)=>{
                    if(Err || !updated){
                        return common.sendErrorResponse(res,"error in incrementing the count")
                    }
                    return res.send({ msg: "successfully added like" });
                }
            );

            
        });
    });
};

Event.prototype.addComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.sourceId = id;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        commentController.addComment(req, res, (err, addedComment) => {
            if (err || !addedComment) {
                common.sendErrorResponse(res, "failed to add the comment");
            }
            event.updateOne(
                { _id: id },
                {
                    $set: {
                        commentsCount: { $inc: 1 },
                    },
                }
            );
            return res.send({ msg: "successfully added comment" });
        });
    });
};

Event.prototype.removeLike = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.sourceId = req.body.EventId;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        likeController.removeLike(req, res);
        event.updateOne(
            { _id: id },
            {
                $set: {
                    likesCount: { $inc: -1 },
                },
            }
        );
        return res.send({ msg: "successfully added like" });
    });
};

// Event.prototype.updateComment=(req,res,emailId)=>{
//     const cId = common.castToObjectId(req.body.cId);
//     const id = common.castToObjectId(req.body.EventId);

//     community.findOne({ _id: cId, 'staff.emailId': emailId }, (communityErr, existingcomm) => {
//         if (communityErr || !existingcomm) {
//             return common.sendErrorResponse(res, "You don't have access to specified community");
//         }
//         commentController.removeComment(req,res);

//     });

// }

Event.prototype.removeComment = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.EventId);
    req.body.sourceId = id;

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        commentController.removeComment(req, res);
        event.updateOne(
            { _id: id },
            {
                $set: {
                    commentsCount: { $inc: -1 },
                },
            }
        );
        return res.send({ msg: "remmoved Comment" });
    });
};

module.exports = Event;
