const express = require('express')
const router = express.Router()

const commonUtility = require('../common/commonUtility');
const user = require('../controllers/user')
const escalations = require('../controllers/escalations');

const common = new commonUtility()
const escalationsController = new escalations ();
const userController = new user();

router.post('/escalation/add', common.authorizeUser, handleEscalationAdd);
router.post('/escalation/update', common.authorizeUser, handleEscalationUpdate);
router.get('/escalation/delete/:escalationId', common.authorizeUser, handleEscalationDelete);
router.get('/escalation/by/id/:escalationId', common.authorizeUser, handleEscalationById);
router.post('/escalation/list', common.authorizeUser, handleEscalationList);
router.get('/escalation/download', common.authorizeUser, handleEscalationDownload);

function handleEscalationAdd(req, res) {
    const userId = common.getUserId(req) || '';

    userController.findUserByUserId(common.castToObjectId(userId), common.getUserDetailsFields(), (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        escalationsController.escalationAdd(req, res, existingUser);
    })
}

function handleEscalationUpdate(req, res) {
    escalationsController.escalationUpdate (req, res);
}

function handleEscalationDelete(req, res) {
    escalationsController.escalationDelete (req, res);
}

function handleEscalationById(req, res) {
    escalationsController.escalationById (req, res);
}

function handleEscalationList(req, res) {
    escalationsController.escalationList (req, res);
}

function handleEscalationDownload(req, res) {
    escalationsController.escalationDownload (req, res);
}

module.exports = router;