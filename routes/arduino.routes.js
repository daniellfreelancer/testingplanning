const express = require('express');
const { getArduinoData, getArduinoDevices, createDevice, getDevices, deleteDevice } = require('../controllers/devicesController');
const router = express.Router();


router.get('/get-data', getArduinoDevices)
router.post('/create', createDevice)
router.get('/get-list', getDevices)
router.delete('/delete/:id', deleteDevice)

module.exports = router