const express = require('express')
const router = express.Router()

const commonUtility = require('../common/commonUtility');
const activityLogs = require('../controllers/activityLogs');

const common = new commonUtility()
const activityLogsController = new activityLogs();

router.post('/log/all', common.authorizeUser, handleLogAll)

function handleLogAll(req, res) {
    activityLogsController.getAllLogs(req, res);
}

module.exports = router;