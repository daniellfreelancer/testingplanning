const express = require('express');
const { getArduinoData, getArduinoDevices, createDevice, getDevices, deleteDevice, addDevicesToSchool, removeDevicesFromSchool, updateDevice, addDevicesToProgram, removeDevicesFromProgram } = require('../controllers/devicesController');
const router = express.Router();


router.get('/get-arduino-devices', getArduinoDevices)

router.post('/create-device', createDevice)
router.get('/get-devices', getDevices)

router.delete('/delete-device/:id', deleteDevice)
router.patch('/update-device/:deviceId', updateDevice)

router.post('/add-device-to-school', addDevicesToSchool);
router.put('/remove-device-from-school', removeDevicesFromSchool); //revisar

router.post('/add-device-to-program', addDevicesToProgram)
router.put('/remove-device-from-program', removeDevicesFromProgram)




module.exports = router