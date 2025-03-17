const express = require('express');
const { sendNotificationFCM } = require('../controllers/fcmController');
var router = express.Router();

router.post('/send-notification', sendNotificationFCM )

module.exports = router;