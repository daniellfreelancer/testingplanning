var express = require('express');
var router = express.Router();
const { createClassroom, addTeacherClassroom, addTeacherSubstituteClassroom, classroomById, addStudentToClassroom, getClassRoomsAll } = require('../controllers/classroomController');



router.post('/create', createClassroom)
router.patch('/new-teacher', addTeacherClassroom)
router.patch('/new-teacher-substitute', addTeacherSubstituteClassroom)
router.get('/find/:id', classroomById)
router.patch('/new-student', addStudentToClassroom)
router.get('/read-by-camp', getClassRoomsAll)

module.exports = router