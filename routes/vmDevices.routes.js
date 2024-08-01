const express = require('express');
const { getAllVmDevices, getVmDevicesByHubId, vmDevicesByResume } = require('../controllers/vmDeviceController');
const router = express.Router();


// Ruta para obtener todos los registros de vmDevice
router.get('/vmdevices', getAllVmDevices);

// Ruta para obtener los registros de vmDevice por hubId
router.get('/vmdevices/:hubId', getVmDevicesByHubId);

router.get('/vmdevices-resume/:hubId/:startTimeClass/:endTimeClass', vmDevicesByResume);


module.exports = router;