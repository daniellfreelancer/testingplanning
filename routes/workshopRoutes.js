var express = require('express');
const { createWorkshop, addTeacherWorkshop, addTeacherSubstituteWorkshop, workshopById, addStudentToWorkshop } = require('../controllers/workshopController');
var router = express.Router();

router.post('/create', createWorkshop )
router.patch('/new-teacher', addTeacherWorkshop )
router.patch('/new-teacher-substitute', addTeacherSubstituteWorkshop  )
router.get('/find/:id', workshopById )
router.patch('/new-student', addStudentToWorkshop )


module.exports = router