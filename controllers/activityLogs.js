const chalk = require('chalk');
const moment = require('moment');
const ActivityLogsModel = require('../models/activityLogs');

const error = chalk.bold.red;
const success = chalk.green;

const commonUtility = require('../common/commonUtility');
const { LookoutEquipment } = require('aws-sdk');
const common = new commonUtility();
function ActivityLogs() {}

ActivityLogs.prototype.getAllLogs = (req, res) => {
    const sourceId = req.body.sourceId;
    let projection = req.body.projection || {};

    if (!common.isObjectId(sourceId)) {
        return common.sendErrorResponse(res, 'Enter valid sourde Id');
    }

    const findQuery = {
        sourceId: common.castToObjectId(sourceId) 
    };

    if (Object.keys(projection).length == 0) {
        projection = {
            action: 1,
            date: 1,
            ownerEmailId: 1,
            propertyChanged: 1
        }
    }

    if (req.body.source) {
        findQuery.source = common.castToObjectId(req.body.source);
    }

    ActivityLogsModel.find(findQuery, projection, (logsErr, logsList) => {
        const activityLogs = [];
        if (logsErr || !logsList) {
            return common.sendErrorResponse(res, 'Error in getting activity logs');
        }

        logsList.forEach(log => {
            const fullName = log.ownerEmailId.firstName + ' ' + log.ownerEmailId.lastName;

            activityLogs.push({
                profilePicUrl: log.ownerEmailId.profilePicUrl,
                fullName: fullName,
                date: moment(log.date).format('DD MMM YYYY'),
                comment: log.action == 'create' ? `${fullName} create task` : `${fullName} updated ${log.propertyChanged}`
            })
        })

        res.send({
            msg: 'Successfully got activity logs',
            activityLogs: activityLogs
        })
    })

}

ActivityLogs.prototype.insertLogs = (updateObj, sourceId, source, action, user) => {
    const activityLogs = getLogObjects(updateObj, sourceId, source, action, user);
    
    if (activityLogs.length > 0) {
        ActivityLogsModel.insertMany(activityLogs, (activityLogsErr, activityLogResponse) => {
            if (activityLogsErr || !activityLogResponse) {
                console.log(error('Error in saving activity logs'));
            }

            console.log(success('Successfully stored activity logs'));
        })
    }
}

const getLogObjects = (updateObj, sourceId, source, action, user) => {
    const activityLogs = [];
    updateObj = updateObj || {};

    delete updateObj._id;

    if (action == 'update') {
        Object.keys(updateObj).forEach((key) => {
            activityLogs.push({
                sourceId: common.castToObjectId(sourceId),
                source: source,
                action: action,
                date: new Date(),
                ownerEmailId: user,
                propertyChanged: key
            })
        })
    } else {
        activityLogs.push({
            sourceId: common.castToObjectId(sourceId),
            source: source,
            action: action,
            date: updateObj.date || new Date(),
            ownerEmailId: user,
        })
    }

    return activityLogs;
}
module.exports = ActivityLogs;