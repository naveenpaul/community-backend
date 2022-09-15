const teams = require('../models/teams');

const commonUtility = require('../common/commonUtility');
const common = new commonUtility();

function Teams() {}

Teams.prototype.createNewTeam = (req, res, liuDetails, callback) => {
    if (!common.validateString(req.body.name)) {
        return common.sendErrorResponse(res, 'Enter valid team name');
    }

    const newTeam = new teams({
        name: req.body.name,
        teamMembers: [liuDetails],
        description: req.body.description,
        templates: [],
        ownerEmailId: liuDetails
    })

    newTeam.save(callback)

}

Teams.prototype.updateTeam = (req, res, emailId) => {
    if (!common.validateString(req.body.name)) {
        return common.sendErrorResponse(res, 'Enter valid team name');
    }

    if (!common.isObjectId(req.body._id)) {
        return common.sendErrorResponse(res, 'Enter corrent team Id');
    }

    const updateObj = {
        name: req.body.name,
        description: req.body.description
    }

    teams.updateOne({_id: common.castToObjectId(req.body._id), "teamMembers.emailId": emailId}, {$set: updateObj}, (teamUpdateErr, teamUpdateResult) => {
        if (teamUpdateErr || !teamUpdateResult) {
            return common.sendErrorResponse(res, 'Error updating team');
        }

        res.send({
            msg: 'Team updated successfully'
        })
    })
}

Teams.prototype.addMember = (req, res, emailId) => {
    const teamMember = req.body.teamMember;
    const teamId = common.castToObjectId(req.body.teamId);

    if (!teamMember) {
        return common.sendErrorResponse(res, 'Please specify team member details to add');
    }

    teams.findOne({_id: teamId, "teamMembers.emailId": emailId}, (teamErr, existingTeam) => {
        if (teamErr || !existingTeam) {
            return common.sendErrorResponse(res, "You don't have access to specified team");
        }

        teams.updateOne({_id: teamId}, {$push: {teamMembers: teamMember}}, (updateErr, updatedTeam) => {
            if (updateErr || !updatedTeam) {
                return common.sendErrorResponse(res, 'Failed to update team member');
            }

            return res.send({msg: 'Successfully updated team member'});
        })

    })
}

Teams.prototype.removeMember = (req, res, emailId) => {
    const teamMemberId = req.body.teamMemberId;
    const teamId = common.castToObjectId(req.body.teamId);

    if (!common.isObjectId(teamMemberId)) {
        return common.sendErrorResponse(res, 'Please specify team member id to delete');
    }

    teams.findOne({_id: teamId, "teamMembers.emailId": emailId}, (teamErr, existingTeam) => {
        if (teamErr || !existingTeam) {
            return common.sendErrorResponse(res, "You don't have access to specified team");
        }

        teams.updateOne({_id: teamId}, {$pull: {teamMembers: {_id: common.castToObjectId(teamMemberId)}}}, (updateErr, updatedTeam) => {
            if (updateErr || !updatedTeam) {
                return common.sendErrorResponse(res, 'Failed to remove team member');
            }

            return res.send({msg: 'Successfully removed team member'});
        })

    })
}

Teams.prototype.updateMember = (req, res, emailId) => {
    const teamMember = req.body.teamMember;
    const teamId = common.castToObjectId(req.body.teamId);
    let teamMemberId = teamMember._id;

    if (!common.isObjectId(teamMember._id)) {
        return common.sendErrorResponse(res, 'Please specify team member id to delete');
    }

    teamMemberId = common.castToObjectId(teamMemberId);
    const updateObj = {
        "teamMembers.$.contractor": teamMember.contractor 
    }

    teams.findOne({_id: teamId, "teamMembers.emailId": emailId}, (teamErr, existingTeam) => {
        if (teamErr || !existingTeam) {
            return common.sendErrorResponse(res, "You don't have access to specified team");
        }

        teams.updateOne({_id: teamId, "teamMembers._id": teamMemberId}, {$set: updateObj}, (updateErr, updatedTeam) => {
            if (updateErr || !updatedTeam) {
                return common.sendErrorResponse(res, 'Failed to update team member');
            }

            return res.send({msg: 'Successfully updated team member'});
        })

    })
}

Teams.prototype.deleteTeam = (req, res, emailId) => {
    const teamId = common.castToObjectId(req.body.teamId);

    teams.findOne({_id: teamId, "teamMembers.emailId": emailId}, (teamErr, existingTeam) => {
        if (teamErr || !existingTeam) {
            return common.sendErrorResponse(res, "You don't have access to specified team");
        }

        teams.deleteOne({_id: teamId}, (updateErr, updatedTeam) => {
            if (updateErr || !updatedTeam) {
                return common.sendErrorResponse(res, 'Failed to delete team');
            }

            return res.send({msg: 'Successfully deleted team'});
        })

    })
}

Teams.prototype.getAllTeams = (req, res, emailId) => {
    const projection = req.body.projection || {};

    if (Object.keys(projection).length == 0) {
        projection =  { name: 1, _id:1 }
    }

    teams.find({"teamMembers.emailId": emailId}, projection).lean().exec( (teamErr, existingTeams) => {
        if (teamErr || !existingTeams) {
            return common.sendErrorResponse(res, "Error in getting teams");
        }

        existingTeams = existingTeams || [];

        existingTeams.forEach(team => {
           team.link = '/team/' + team._id;
        });

        return res.send({
            teams: existingTeams,
            msg: 'Successfully got all teams',
            length: existingTeams.length 
        })
    })

}

Teams.prototype.getTeamById = (req, res, emailId, callback) => {
    let teamId = req.body.teamId;

    if (!common.isObjectId(teamId)) {
        return common.sendErrorResponse(res, 'Enter valid team Id');
    }

    const projection = req.body.projection || {
        name: 1,
        description: 1
    }

    teamId = common.castToObjectId(teamId);

    teams.findOne({_id: teamId, "teamMembers.emailId": emailId}, projection, (teamErr, existingTeam) => {
        if (teamErr || !existingTeam) {
            return common.sendErrorResponse(res, "You don't have access to specified team");
        }

        callback(existingTeam); 
    })
}

Teams.prototype.updateTeamTemplate = (req, res, emailId) => {
    const template = req.body.template;
    let teamId = req.body.teamId;

    if (!common.validateString(teamId)) {
        return common.sendErrorResponse(res, 'Please specify team Id');
    }

    if (template && template.sections && template.sections.length < 1) {
        return common.sendErrorResponse(res, 'Please specify atleast one section in template');
    }

    teamId = common.castToObjectId(teamId);

    teams.findOne({_id: teamId, "teamMembers.emailId": emailId}, (teamErr, existingTeam) => {
        if (teamErr || !existingTeam) {
            return common.sendErrorResponse(res, "You don't have access to specified team");
        }

        if (template._id) {
            teams.updateOne({_id: teamId}, {$pull: {"templates": { "_id": common.castToObjectId(template._id)}}}, (templatePullErr, templatePullResult) => {
                if (templatePullErr || !templatePullResult) {
                    return common.sendErrorResponse(res, 'Error in updating template');
                }

                teams.updateOne({_id: teamId}, {$push: {templates: template}}, (templateUpdateErr, templateUpdateResult) => {
                    if (templateUpdateErr || !templateUpdateResult) {
                        return common.sendErrorResponse(res, 'Error in updating template');
                    }

                    res.send({
                        msg: 'Updated template successfully',
                        updatedTemplate: templateUpdateResult
                    })
                })
            })
        } else {
            teams.updateOne({_id: teamId}, {$push: {templates: template}}, (templateUpdateErr, templateUpdateResult) => {
                if (templateUpdateErr || !templateUpdateResult) {
                    return common.sendErrorResponse(res, 'Error in updating template');
                }

                res.send({
                    msg: 'Updated template successfully',
                    updatedTemplate: templateUpdateResult
                })
            })
        }
    })
}

Teams.prototype.getAllTeamMembers = (teamId, callback) => {
  teamId = common.castToObjectId(teamId);

  teams
    .findOne({ _id: teamId }, { teamMembers: 1 })
    .lean()
    .exec((teamMembersErr, teamMembers) => {
        if (teamMembersErr || !teamMembers) {
            callback([])
        } else {
            callback(teamMembers.teamMembers)
        }
    });
};

Teams.prototype.isContractor = (userId, teamId, callback) => {
  teamId = common.castToObjectId(teamId);

  teams.findOne({ _id: teamId }, { teamMembers: 1 }).lean().exec((teamsErr, teamMembers) => {
    let matchFound = false;

    if (teamsErr || !teamMembers) {
      matchFound = false;
    } else {
      teamMembers = teamMembers.teamMembers || [];
      teamMembers.forEach(member => {
        if (member._id.toString() == userId && member.contractor == true) {
          matchFound = true;
        }
      });
    }

    callback(matchFound);
  });
};

module.exports = Teams;