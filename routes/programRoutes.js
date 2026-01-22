var express = require('express');
const { createProgram, addAdminToProgram, addTeacherToProgram, addWorkshopToProgram, addStudentToProgram, programById, getProgramAll, deleteProgram, updateProgram, getProgramByInstitution, getProgramByInstitutionFutbolType, getStudentsProgramByInstitution, getTeachersProgramByInstitution, createWorkshopAndAddToProgram } = require('../controllers/programController');
const upload = require('../libs/docsStorage')
var router = express.Router();


// Nuevo: crea programa asociado a una institución (por params) y puede recibir imagen (imgUrl)
router.post('/create/:institutionId', upload.single('imgUrl'), createProgram )
router.patch('/new-admin', addAdminToProgram )
router.patch('/new-teacher', addTeacherToProgram )
router.patch('/new-workshop', addWorkshopToProgram )
router.patch('/new-student', addStudentToProgram )
router.get('/find/:id', programById )
router.get('/read-by-camp', getProgramAll)
router.get('/list', getProgramAll)

router.delete('/delete-program/:id', deleteProgram)
router.put('/update-program/:id', upload.single('imgUrl'), updateProgram)
router.get('/list-by-institution/:institutionId', getProgramByInstitution)
router.get('/list-programs-for-suscribe', getProgramByInstitutionFutbolType)
router.get('/list-students-by-institution/:institutionId', getStudentsProgramByInstitution)
router.get('/list-teachers-by-institution/:institutionId', getTeachersProgramByInstitution)
router.post('/create-workshop-and-add-to-program/:programId', createWorkshopAndAddToProgram)

module.exports = router