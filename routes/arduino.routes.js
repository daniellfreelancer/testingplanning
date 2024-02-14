const express = require('express');
const { getArduinoData, getArduinoDevices } = require('../controllers/devicesController');
const router = express.Router();


router.get('/get-data', getArduinoDevices)

module.exports = router