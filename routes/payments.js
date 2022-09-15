const express = require('express')
const router = express.Router()

const commonUtility = require('../common/commonUtility');
const user = require('../controllers/user')
const payments = require('../controllers/payments');
const activityLogs = require('../controllers/activityLogs');


const common = new commonUtility()
const paymentsController = new payments();
const userController = new user();
const activityLogsController = new activityLogs();

router.post('/payment/add', common.authorizeUser, handlePaymentAdd);
router.post('/payment/update', common.authorizeUser, handlePaymentUpdate);
router.get('/payment/delete/:paymentId', common.authorizeUser, handlePaymentDelete);
router.get('/payment/by/id/:paymentId', common.authorizeUser, handlePaymentById);
router.post('/payment/by/projectId', common.authorizeUser, handlePaymentByProjectId);
router.post('/payment/list', common.authorizeUser, handlePaymentList);
router.get('/payment/download', common.authorizeUser, handlePaymentDownload);

function handlePaymentAdd(req, res) {
    const userId = common.getUserId(req) || '';

    userController.findUserByUserId(common.castToObjectId(userId), common.getUserDetailsFields(), (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        paymentsController.paymentAdd(req, res, existingUser, (paymentErr, savedPayment) => {
            if (paymentErr || !savedPayment) {
                return common.sendErrorResponse(res, 'Error in creating new payment');
            }

            res.send({
                msg: 'Payment created successfully',
                payment: savedPayment
            })
            
            activityLogsController.insertLogs({}, savedPayment._id, 'payment', 'create', existingUser);
        });
    })
}

function handlePaymentUpdate(req, res) {
    const userId = common.getUserId(req) || '';
    const payment = req.body.payment;

    userController.findUserByUserId(common.castToObjectId(userId), {emailId:1, firstName: 1, lastName: 1, mobileNumber: 1, profilePicUrl: 1}, (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        paymentsController.paymentUpdate(payment, res, (updatePaymentErr, updatedPayment) => {
            if (updatePaymentErr || !updatedPayment) {
                return common.sendErrorResponse(res, 'Error in updating payment');
            }
            
            res.send({
                msg: 'Updated payment successfully',
                payment: updatedPayment
            })
        });
    })
}

function handlePaymentDelete(req, res) {
    const userId = common.getUserId(req) || '';
    const paymentId = req.params.paymentId;

    if (!common.isObjectId(paymentId)) {
        return common.sendErrorResponse(res, 'Enter valid payment Id');
    }

    userController.findUserByUserId(common.castToObjectId(userId), common.getUserDetailsFields(), (err, existingUser) => {
        if (err || !existingUser) {
            return common.sendErrorResponse(res, 'Error getting user details');
        }

        paymentsController.paymentDelete(paymentId, (paymentRemoveErr, removedPayment) => {
            if (paymentRemoveErr || !removedPayment) {
                return common.sendErrorResponse(res, 'Error in deleting payment');
            }

            res.send({
                msg: 'Deleted payment successfully',
                payment: removedPayment
            })

            activityLogsController.insertLogs({}, paymentId, 'payment', 'delete', existingUser);
        });
    })
}

function handlePaymentById(req, res) {
    const paymentId = req.params.paymentId;

    paymentsController.paymentById(paymentId, res, (paymentByIdErr, paymentById) => {
        if (paymentByIdErr || !paymentById) {
            return common.sendErrorResponse(res, 'Error in getting payment');
        }

        res.send({
            msg: 'Got payment successfully',
            payment: paymentById
        })
   });
}

function handlePaymentByProjectId(req, res) {
    const projectId = req.body.projectId;

    if (!common.isObjectId(projectId)) {
        return common.sendErrorResponse(res, 'Enter valid projectId Id');
    }

    paymentsController.paymentByProjectId(projectId, req.body.projection, (paymentErr, payments) => {
        if (paymentErr || !payments) {
            return common.sendErrorResponse(res, 'Error in getting payments');
        }

        res.send({
            msg: 'Got payment successfully',
            payments: payments
        })
   });
}

function handlePaymentList(req, res) {
    paymentsController.paymentList(req, res);
}

function handlePaymentDownload(req, res) {
    paymentsController.paymentDownload(req, res);
}

module.exports = router;