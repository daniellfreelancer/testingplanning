var express = require('express');
const { addHRV, getHRVs, getHRVById, deleteHRV, getHRVsHistoryByStudentId, getHRVsHistoryByUser, getHRVsHistoryByDevice, getHRVNoDuplicates, getHRVUsersStudent } = require('../controllers/hrvController');
var router = express.Router();

//rutas
router.post('/add-register', addHRV);
router.get('/get-register', getHRVs);
router.get('/hrv-by-id/:id', getHRVById);
router.delete('/delete-hrv-register/:id', deleteHRV);
router.get('/get-hrv-student/:studentId', getHRVsHistoryByStudentId);
router.get('/get-hrv-user/:userId', getHRVsHistoryByUser);
router.get('/get-hrv-devices/:macAddress', getHRVsHistoryByDevice)
router.get('/hrv-list', getHRVNoDuplicates)
router.get('/list', getHRVUsersStudent)



module.exports = router