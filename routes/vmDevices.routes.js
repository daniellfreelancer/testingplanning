const express = require('express');
const { getAllVmDevices, getVmDevicesByHubId, vmDevicesByResume, getLastTimeHub, getLastRegister } = require('../controllers/vmDeviceController');
const router = express.Router();


// Ruta para obtener todos los registros de vmDevice
router.get('/vmdevices', getAllVmDevices);

// Ruta para obtener los registros de vmDevice por hubId
router.get('/vmdevices/:hubId', getVmDevicesByHubId);

router.get('/vmdevices-resume/:hubId/:startTimeClass/:endTimeClass', vmDevicesByResume);

router.get('/hub-time/:hubId/time/:currentTime', getLastTimeHub)

router.get('/last-20-register/:hubId', getLastRegister)

module.exports = router;