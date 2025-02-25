var express = require('express');
const { addHRV, getHRVs, getHRVById, deleteHRV, getHRVsHistoryByStudentId, getHRVsHistoryByUser, getHRVsHistoryByDevice, getHRVNoDuplicates, getHRVUsersStudent, getTodayHRVResults, getLastSevenrRDataByUser, getHrvListUser, getHrvListComplete, getHrvStats, getHrvListByInstitution, getHrvListByUserFilter, getHRVInsti, getHRVtodayUser, getHRVLastSevenUser, getHRVtodayUserMaster, updateHRVData, getHRVTeacher, getHRVlast7DaysUserMasterVM, getHRVLast30daysUserMasterVM } = require('../controllers/hrvController');
var router = express.Router();

//rutas
router.post('/add-register', addHRV);
router.get('/get-register', getHRVs);
//router.get('/get-register-list', getHrvListComplete);
router.get('/get-register-list', getHrvStats);
router.get('/hrv-by-id/:id', getHRVById);
router.delete('/delete-hrv-register/:id', deleteHRV);
router.get('/get-hrv-student/:studentId', getHRVsHistoryByStudentId);
router.get('/get-hrv-user/:userId', getHRVsHistoryByUser);
router.get('/get-hrv-devices/:macAddress', getHRVsHistoryByDevice)
router.get('/hrv-list', getHRVNoDuplicates)
router.get('/list', getHRVUsersStudent)
router.get('/list/today/:userType/:userId/:date', getTodayHRVResults);
router.get('/list/today/:userType/:studentId/:date', getTodayHRVResults);
router.get('/list/last-seven-hrv/:id/:userType', getLastSevenrRDataByUser);
router.get('/hrv-by-institution/:institutionId', getHrvListByInstitution);
router.get('/hrv-user-detail/user/:userType/user-id/:id/institution/:institucionId', getHrvListByUserFilter)
router.get('/hrv-institution/:institutionId', getHRVInsti);
router.get('/hrv-institution-teacher/:institutionId', getHRVTeacher);
router.get("/hrv-today-user/:userType/:id/:institucionId", getHRVtodayUser);
router.get("/hrv-today-master/:userType/:id", getHRVtodayUserMaster);
router.get("/hrv-last-seven-days-user/:userType/:id/:institucionId", getHRVLastSevenUser);
router.get("/hrv-last-seven-days-vm/:userType/:id", getHRVlast7DaysUserMasterVM);
router.get("/hrv-last-thirty-days-vm/:userType/:id", getHRVLast30daysUserMasterVM);

router.get("/hrv-last-thirty-days-user/:userType/:id/:institucionId", getHRVLastSevenUser);
router.put('/update/:id', updateHRVData)




module.exports = router