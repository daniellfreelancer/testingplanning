var express = require('express');
const { createReport, getReports, getReportbyId, getReportByTeacher, getReportByWorkshop, deleteReportById, getReportsByInstitution } = require('../controllers/workshopReport');
var router = express.Router();


router.post('/create', createReport);
router.get('/get-all', getReports);
router.get('/get-all-institutions/:id', getReportsByInstitution);
router.get('/get-by-id/:id', getReportbyId);
router.get('/get-by-teacher/:id', getReportByTeacher);
router.get('/get-by-workshop/:id', getReportByWorkshop);
router.delete('/delete/:id', deleteReportById);




module.exports = router;