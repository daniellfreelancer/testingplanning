var express = require('express');
var router = express.Router();
const { createClassroom, addTeacherClassroom, addTeacherSubstituteClassroom } = require('../controllers/classroomController');



router.post('/create', createClassroom)
router.patch('/new-teacher', addTeacherClassroom)
router.patch('/new-teacher-substitute', addTeacherSubstituteClassroom)

module.exports = router