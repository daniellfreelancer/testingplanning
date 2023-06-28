var express = require('express');
const { createInstitution, readInstitutions, addAdminToInstitution, removeAdminFromInstitution, addTeacherToInstitution, addSchoolToInstitution, institutionById, addProgramToInstitution } = require('../controllers/instiController');
var router = express.Router();


router.post('/create', createInstitution)
router.get('/all', readInstitutions)
router.patch('/newadmin', addAdminToInstitution)
router.patch('/newteacher', addTeacherToInstitution)
router.patch('/newschool', addSchoolToInstitution)
router.patch('/newprogram', addProgramToInstitution)
router.delete('/delete-admin', removeAdminFromInstitution)
router.get('/find/:id', institutionById)


module.exports = router