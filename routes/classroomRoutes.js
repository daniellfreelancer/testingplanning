var express = require('express');
var router = express.Router();
const { createClassroom, addTeacherClassroom, addTeacherSubstituteClassroom, classroomById, addStudentToClassroom, getClassRoomsAll, updateClassroom, deleteClassroom, removeStudentFromClassroom } = require('../controllers/classroomController');



router.post('/create', createClassroom)
router.patch('/new-teacher', addTeacherClassroom)
router.patch('/new-teacher-substitute', addTeacherSubstituteClassroom)
router.get('/find/:id', classroomById)
router.patch('/new-student', addStudentToClassroom)
router.get('/read-by-camp', getClassRoomsAll)
router.put('/update/:id', updateClassroom)
router.delete('/delete/:id/school/:schoolId',  deleteClassroom);
router.post('/remove-student', removeStudentFromClassroom)

module.exports = router