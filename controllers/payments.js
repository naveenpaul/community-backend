const PaymentsModel = require('../models/payments');

const commonUtility = require('../common/commonUtility');
const common = new commonUtility();
function Payments() {}

Payments.prototype.paymentAdd = (req, res, user, callback) => {
    const projectId = req.body.projectId;

    if (!common.isObjectId(projectId)) {
        return common.sendErrorResponse(res, 'Enter valid project Id');
    }

    const paymentsModelObj = {
        teamId: req.body.teamId,
        projectId: req.body.projectId,
        taskId: req.body.taskId,
        paymentTo: req.body.paymentTo,
        paymentBy: req.body.paymentBy,
        ownerEmailId: user,
        invoiceNumber: req.body.invoiceNumber,
        comment: req.body.comment,
        taskName: req.body.taskName,
    }

    paymentsModelObj.date = req.body.date ? new Date(req.body.date) : req.body.date;

    const newPayment = new PaymentsModel(paymentsModelObj);
    newPayment.save(callback) 
}

Payments.prototype.paymentUpdate = (payment, res, callback) => {
    if (!common.isObjectId(payment._id)) {
        return common.sendErrorResponse(res, 'Enter valid payment Id');
    }

    PaymentsModel.updateOne({_id: common.castToObjectId(payment._id)}, {$set: payment}, callback);
}

Payments.prototype.paymentDelete = (paymentId, callback) => {
   PaymentsModel.remove({_id: common.castToObjectId(paymentId)}, callback) 
}

Payments.prototype.paymentById = (paymentId, res, callback) => {

    if (!common.isObjectId(paymentId)) {
        return common.sendErrorResponse(res, 'Enter valid payment Id');
    }

   PaymentsModel.findOne({_id: common.castToObjectId(paymentId)}, callback) 
}

Payments.prototype.paymentByProjectId = (projectId, projection, callback) => {
    projection = projection || {};

   PaymentsModel.find({projectId: common.castToObjectId(projectId)}, projection, callback) 
}

Payments.prototype.paymentList = (req, res) => {
    const projectId = req.body.projectId;
    let projection = req.body.projection || {};

    const findQuery = {}

    if (!common.isObjectId(projectId)) {
        return common.sendErrorResponse(res, 'Enter valid projectId Id');
    }

    findQuery.projectId = common.castToObjectId(projectId);

    if (Object.keys(projection).length == 0) {
        projection = {
            paymentTo: 1,
            paymentBy: 1,
            date: 1,
            comment: 1,
            invoiceNumber: 1,
            taskName: 1
        }
    }

    PaymentsModel.find(findQuery, projection, (paymentListErr, paymentList) => {
        if (paymentListErr || !paymentList) {
            return common.sendErrorResponse(res, 'Error in getting payments list');
        }

        return res.send({
            msg: 'Succeessfully got payments list',
            paymentsList: paymentList
        })
    })
}

Payments.prototype.paymentDownload = (req, res) => {
}

module.exports = Payments;