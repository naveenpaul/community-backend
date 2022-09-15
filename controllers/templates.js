const TemplatesModel = require('../models/templates');

const commonUtility = require('../common/commonUtility');
const common = new commonUtility();

function Templates() {}
function Teams() {}

Templates.prototype.createNewTemplate = (req, res, liuDetails, callback) => {
    let teamId = req.body.teamId;

    if (!common.validateString(req.body.templateName)) {
        return common.sendErrorResponse(res, 'Enter valid template name');
    }

    if (teamId && !common.isObjectId(teamId)) {
        return common.sendErrorResponse(res, 'Enter valid team Id');
    }

    const newTemplate = new TemplatesModel({
        teamId: teamId,
        templateName: req.body.templateName,
        sections: req.body.sections,
        ownerEmailId: liuDetails
    })

    newTemplate.save(callback);
}

Templates.prototype.updateTeamTemplate = (req, templateId, callback) => {
    const updateObj = {
        templateName: req.body.templateName,
        sections: req.body.sections,
    }

    TemplatesModel.updateOne({_id: common.castToObjectId(templateId)}, {$set: updateObj}, callback)
}

Templates.prototype.getAllTemplates = (req, res) => {
    const teamId = req.body.teamId;
    let projection = req.body.projection || {};
    const findQuery = {};

    if (Object.keys(projection).length == 0) {
        projection =  { templateName: 1, _id:1, sections: 1 }
    }

    if (teamId) {
        if (!common.isObjectId(teamId)) {
            return common.sendErrorResponse(res, 'Enter valid team Id');
        }

        findQuery.teamId = common.castToObjectId(teamId);
    }

    TemplatesModel.find(findQuery, projection).lean().exec( (templateErr, templates) => {
        if (templateErr || !templates) {
            return common.sendErrorResponse(res, "Error in getting templates");
        }

        templates = templates || [];

        return res.send({
            templates: templates,
            msg: 'Successfully got all templates',
            length: templates.length 
        })
    })
}

Templates.prototype.deleteTemplate = (req, res) => {
    const templateId = req.params.templateId;

    if (!common.isObjectId(templateId)) {
        return common.sendErrorResponse(res, 'Enter valid templateId');
    }

    TemplatesModel.remove({_id: common.castToObjectId(templateId)}, (templateRemoveErr, removedTemplate) => {
        if (templateRemoveErr || !removedTemplate) {
            return common.sendErrorResponse(res, 'Error in removing the template');
        }

        return res.send({
            'msg': 'Template removed successfully',
        })
    })
}

Templates.prototype.getTemplateById = (res, templateId, callback) => {
    if (!common.isObjectId(templateId)) {
        return common.sendErrorResponse(res, 'Enter valid template Id');
    }

    templateId = common.castToObjectId(templateId);

    TemplatesModel.findOne({_id: templateId}, (templateErr , template) => {
        if (templateErr || !template) {
            return common.sendErrorResponse(res, "You don't have access to specified template");
        }

        callback(template); 
    })
}

module.exports = Templates;