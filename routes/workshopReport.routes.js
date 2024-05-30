var express = require('express');
const { createReport, getReports, getReportbyId, getReportByTeacher, getReportByWorkshop, deleteReportById, getReportsByInstitution, getReportByClass } = require('../controllers/workshopReport');
var router = express.Router();


router.post('/create', createReport);
router.get('/get-all', getReports);
router.get('/get-all-institutions/:id', getReportsByInstitution);
router.get('/get-by-id/:id', getReportbyId);
router.get('/get-by-teacher/:id', getReportByTeacher);
router.get('/get-by-workshop/:id', getReportByWorkshop);
router.get('/get-by-class/:id', getReportByClass)
router.delete('/delete/:id', deleteReportById);




module.exports = router;