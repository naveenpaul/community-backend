const express = require('express')
const router = express.Router()

const commonUtility = require('../common/commonUtility');
const user = require('../controllers/user')
const templates = require('../controllers/templates');
const activityLog = require('../controllers/activityLogs');

const common = new commonUtility()
const templatesController = new templates();
const userController = new user();
const activityLogController = new activityLog();

router.post('/template/create', common.authorizeUser, handleCreateTemplate);
router.post('/template/all', common.authorizeUser, handleTemplateAll);
router.post('/template/update', common.authorizeUser, handleUpdateTemplate);
router.get('/template/get/:templateId', common.authorizeUser, handleRemoveMember);
router.get('/template/delete/:templateId', common.authorizeUser, handleDeleteTemplate);

function handleCreateTemplate(req, res, next) {
    const userId = common.getUserId(req) || '';

    userController.findUserByUserId(common.castToObjectId(userId), common.getUserDetailsFields(), (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        templatesController.createNewTemplate(req, res, existingUser, (templateErr, savedTemplate) => {
            if (templateErr || !savedTemplate) {
                return common.sendErrorResponse(res, 'Error in saving template details');
            }

            res.send({
                'msg': 'Template saved successfully',
                template: savedTemplate
            });

            activityLogController.insertLogs({}, savedTemplate._id, 'template', 'create', existingUser)
        });
    });
}

function handleTemplateAll(req, res) {
    templatesController.getAllTemplates(req, res);
}

function handleAddMember(req, res, next) {
    const userId = common.getUserId(req) || '';

    userController.findUserByUserId(common.castToObjectId(userId), {emailId:1}, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        teamsController.addMember(req, res, existingUser.emailId);
    });
}

function handleRemoveMember(req, res, next) {
    const userId = common.getUserId(req) || '';

    userController.findUserByUserId(common.castToObjectId(userId), {emailId:1}, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        teamsController.removeMember(req, res, existingUser.emailId);
    });
}

function handleGetAllTeams(req, res, next) {
    const userId = common.getUserId(req) || '';

    userController.findUserByUserId(common.castToObjectId(userId), {emailId:1}, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        teamsController.getAllTeams(req, res, existingUser.emailId);
    });

}

function handleGetTeamById(req, res, next) {
    const userId = common.getUserId(req) || '';

    userController.findUserByUserId(common.castToObjectId(userId), {emailId:1}, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        teamsController.getTeamById(res, existingUser.emailId, req.params['teamId'], (exisingTeam) => {
            res.send({
                team: existingTeam
            })
        });
    });
}

function handleUpdateTemplate(req, res, next) {
    const templateId = req.body.templateId;

    if (!common.isObjectId(templateId)) {
        return common.sendErrorResponse(res, 'Enter valid template Id');
    }

    templatesController.updateTeamTemplate(req, templateId, (updateErr, updateResult) => {
        if (updateErr || !updateResult) {
            return common.sendErrorResponse(res, 'Error in updating the template');
        }

        res.send({
            msg: 'Successfully updated the template'
        })
    });
}

function handleDeleteTemplate(req, res, next) {
    templatesController.deleteTemplate(req, res);
}

module.exports = router;