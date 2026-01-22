const express = require('express');
const router = express.Router();
const emailStudentFutbolWelcome = require('./emailStudentFutbolWelcome');

router.post('/send-welcome-email-student-futbol', emailStudentFutbolWelcome);

module.exports = router;