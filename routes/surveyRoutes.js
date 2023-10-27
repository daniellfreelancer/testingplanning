var express = require('express');
const { updateSurveyStudent, getSurveyByClassroom, getSurveyByVmClass, getSurveyByStudentPending, getSurveyByStudentDone } = require('../controllers/surveyController');
var router = express.Router();

// Ruta para obtener encuestas por aula
router.get('/classroom/:classroomId', getSurveyByClassroom);

// Ruta para obtener encuestas por VMClass
router.get('/vmclass/:vmClassId', getSurveyByVmClass);

// Ruta para obtener encuestas pendientes por estudiante
router.get('/student/pending/:studentId', getSurveyByStudentPending);

// Ruta para obtener encuestas completadas por estudiante
router.get('/student/done/:studentId', getSurveyByStudentDone);

// Ruta para actualizar la encuesta de un estudiante
router.put('/student/update/:surveyId', updateSurveyStudent);

module.exports = router;