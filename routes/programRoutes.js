var express = require('express');
const { createProgram, addAdminToProgram, addTeacherToProgram, addWorkshopToProgram, addStudentToProgram, programById, getProgramAll, deleteProgram, updateProgram } = require('../controllers/programController');
var router = express.Router();


router.post('/create', createProgram )
router.patch('/new-admin', addAdminToProgram )
router.patch('/new-teacher', addTeacherToProgram )
router.patch('/new-workshop', addWorkshopToProgram )
router.patch('/new-student', addStudentToProgram )
router.get('/find/:id', programById )
router.get('/read-by-camp', getProgramAll)

router.delete('/delete-program/:id', deleteProgram)
router.put('/update-program/:id', updateProgram)

module.exports = router