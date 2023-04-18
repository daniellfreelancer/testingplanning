var express = require('express');
var router = express.Router();
const { createClassroom, addTeacherClassroom, addTeacherSubstituteClassroom, classroomById } = require('../controllers/classroomController');



router.post('/create', createClassroom)
router.patch('/new-teacher', addTeacherClassroom)
router.patch('/new-teacher-substitute', addTeacherSubstituteClassroom)
router.get('/find/:id', classroomById)

module.exports = router