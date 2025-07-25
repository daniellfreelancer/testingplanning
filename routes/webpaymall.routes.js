const express = require('express');
const router = express.Router();
const controller = require('../controllers/payments/webpaymall.controller');

router.post('/init', controller.initTransaction);
router.post('/commit', controller.commitTransaction);
router.post('/status', controller.getStatus);
router.post('/refund', controller.refundTransaction);

module.exports = router;
