var express = require('express');
const { createSchool, addAdminToSchool, removeAdminFromSchool, addClassroomToSchool, addTeacherToSchool, addStudentToSchool, schoolById, getSchoolAll, deleteSchool, updateSchool, addWorkshopToSchool } = require('../controllers/schoolController');
var router = express.Router();


router.post('/create', createSchool)
router.patch('/new-admin', addAdminToSchool)
router.patch('/new-teacher', addTeacherToSchool)
router.patch('/new-classroom', addClassroomToSchool)
router.patch('/new-workshop', addWorkshopToSchool)
router.patch('/new-student', addStudentToSchool)
router.delete('/delete-admin', removeAdminFromSchool)
router.get('/find/:id', schoolById)
router.get('/read-by-camp', getSchoolAll)
router.get('/list', getSchoolAll)
router.delete('/delete-school/:id', deleteSchool)
router.put('/update-school/:id', updateSchool)


module.exports = router