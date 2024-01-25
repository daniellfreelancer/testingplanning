var express = require('express');
const { createWorkshop, addTeacherWorkshop, addTeacherSubstituteWorkshop, workshopById, addStudentToWorkshop, getWorkshopAll, updateWorkshop } = require('../controllers/workshopController');
var router = express.Router();

router.post('/create', createWorkshop )
router.patch('/new-teacher', addTeacherWorkshop )
router.patch('/new-teacher-substitute', addTeacherSubstituteWorkshop  )
router.get('/find/:id', workshopById )
router.patch('/new-student', addStudentToWorkshop )
router.get('/read-by-camp', getWorkshopAll)
router.put('/update-workshop/:id', updateWorkshop)


module.exports = router