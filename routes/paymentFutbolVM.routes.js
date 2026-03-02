const express = require('express');
const router = express.Router();
const paymentFutbolVMController = require('../controllers/paymentFutbolVMController');

router.post('/create-payment-ticket-futbol-vm', paymentFutbolVMController.createPaymentTicketFutbolVM);
router.get('/get-payment-ticket-futbol-vm-by-futbol-school/:futbolSchoolId', paymentFutbolVMController.getPaymentTicketFutbolVMByFutbolSchool);
router.get('/get-payment-ticket-futbol-vm-by-student/:studentId', paymentFutbolVMController.getPaymentTicketFutbolVMByStudent);
router.put('/update-manual-payment-ticket-futbol-vm/:paymentTicketFutbolVMId', paymentFutbolVMController.updateManualPaymentTicketFutbolVM);
router.get('/get-payment-ticket-futbol-vm-by-institution/:institutionId', paymentFutbolVMController.getPaymentTicketFutbolVMByInstitution);

module.exports = router;