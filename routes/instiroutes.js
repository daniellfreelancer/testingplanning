var express = require('express');
const { createInstitution, readInstitutions, addAdminToInstitution, removeAdminFromInstitution, addTeacherToInstitution, addSchoolToInstitution } = require('../controllers/instiController');
var router = express.Router();


router.post('/create', createInstitution)
router.get('/all', readInstitutions)
router.patch('/newadmin', addAdminToInstitution)
router.patch('/newteacher', addTeacherToInstitution)
router.patch('/newschool', addSchoolToInstitution)
router.delete('/delete-admin', removeAdminFromInstitution)


module.exports = router