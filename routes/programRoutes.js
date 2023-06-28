var express = require('express');
const { createProgram, addAdminToProgram, addTeacherToProgram, addWorkshopToProgram, addStudentToProgram, programById } = require('../controllers/programController');
var router = express.Router();


router.post('/create', createProgram )
router.patch('/new-admin', addAdminToProgram )
router.patch('/new-teacher', addTeacherToProgram )
router.patch('/new-workshop', addWorkshopToProgram )
router.patch('/new-student', addStudentToProgram )
router.get('/find/:id', programById )

module.exports = router