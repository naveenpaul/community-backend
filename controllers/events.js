const Events = require("../models/events");
const like = require("./likes");
const comment = require("./comments");
const community = require("../models/community");
const commonUtility = require("../common/commonUtility");
const common = new commonUtility();

const likeController = new like();
const commentController = new comment();

function Event() { }

Event.prototype.addEvent = (req, res, callback) => {
    const newEvent = new Events({
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

    Events
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
                Events.link = "/event/" + Events._id;
            });

            return res.send({
                events: existingEvent,
                msg: "Successfully got all events",
                length: existingEvent.length,
            });
        });
};

Event.prototype.getEventsFeed = async (req, res, user) => {
    const pageNumber = req.params.pageNumber;

    const offset = pageNumber >= 0 ? pageNumber * nPerPage : 0;
    const limit = req.query.limit ?? 10;
    const createdBefore = req.query.createdBefore ?? new Date(Date.now()).toISOString;

    try {
        const allEvents = await Events
            .find({ createdAt: { $lt: createdBefore } })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();

        if (!allEvents) Promise.reject();

        res.send({
            events: allEvents,
            msg: "Successfully got Events"
        });

    } catch (err) {
        return common.sendErrorResponse(res, "Error in getting Events");
    }
}

Event.prototype.getEventById = async (req, res, user) => {
    const filterQuery = {
        _id: req.params.postId,
    };
    const projection = {};
    try {
        const existingEvent = await Events.findOne(filterQuery, projection).exeec();

        if (!existingEvent) Promise.reject();

        res.send({
            event: existingEvent,
            msg: "Successfully got the event",
        });
    } catch (err) {
        return common.sendErrorResponse(res, "Error in getting event");
    }
}

Event.prototype.updateEvent = (req, res, emailId) => {
    const cId = common.castToObjectId(req.body.cId);
    const id = common.castToObjectId(req.body.eventId);

    community.findOne({ _id: cId, "staff.emailId": emailId }, (communityErr, existingcomm) => {
        if (communityErr || !existingcomm) {
            return common.sendErrorResponse(res, "You don't have access to specified community");
        }
        Events.updateOne(
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

        Events.deleteOne({ _id: id }, (deleteErr, deleteEvent) => {
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

        Events.updateOne(
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

        Events.updateOne(
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

        Events.updateOne(
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
        Events.updateOne(
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
