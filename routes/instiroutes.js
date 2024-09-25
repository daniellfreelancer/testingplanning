var express = require('express');
const { createInstitution, readInstitutions, addAdminToInstitution, removeAdminFromInstitution, addTeacherToInstitution, addSchoolToInstitution, institutionById, addProgramToInstitution, updateInstitution, deleteInstitution, getStudentsByInstitution, addSubscriptions, removeSubscriptions } = require('../controllers/instiController');
var router = express.Router();


router.post('/create', createInstitution)
router.get('/all', readInstitutions)
router.patch('/newadmin', addAdminToInstitution)
router.patch('/newteacher', addTeacherToInstitution)
router.patch('/newschool', addSchoolToInstitution)
router.patch('/newprogram', addProgramToInstitution)
router.delete('/delete-admin', removeAdminFromInstitution)
router.get('/find/:id', institutionById)
router.get('/find-with-students/:id', getStudentsByInstitution)

router.put('/update/:id', updateInstitution)
router.delete('/delete-institution/:id', deleteInstitution)
router.patch('/add-subscription/:id', addSubscriptions)
router.put('/remove-subscription/:id', removeSubscriptions)



module.exports = router