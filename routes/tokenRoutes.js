var express = require('express');
const { enableNotification, getClassrooms, getWorkshops, disableNotification, getAllTokens, addTokenUser, addTokenTeacher, removeTokenUser, removeTokenTeacher, sendNotificationUser, getTokensForStudentPush, getTokensForTeacherPush } = require('../controllers/tokenFCMController');

var router = express.Router();

router.post('/enable-notification',enableNotification )
router.get('/get-classrooms', getClassrooms)
router.get('/get-workshops', getWorkshops)
router.delete('/disable-notification/classroom/:classroomId', disableNotification); // Deshabilitar notificaciones para una aula
router.delete('/disable-notification/workshop/:workshopId', disableNotification); // Deshabilitar notificaciones para un taller
router.get('/all-tokens', getAllTokens);
router.post('/add-token-user', addTokenUser); // Agregar token cuando inicia sesion
router.post('/add-token-teacher', addTokenTeacher);
router.delete('/remove-token-user', removeTokenUser); // Eliminar token cuando cierre sesion
router.delete('/remove-token-teacher', removeTokenTeacher);
router.post('/send-notification-user', sendNotificationUser);
router.get('/get-tokens-for-student-push/classroom/:classroomId', getTokensForStudentPush); // Obtener tokens de estudiantes para un aula específica
router.get('/get-tokens-for-student-push/workshop/:workshopId', getTokensForStudentPush); // Obtener tokens de estudiantes para un taller específico
router.get('/get-tokens-for-teacher-push/classroom/:classroomId', getTokensForTeacherPush); // Obtener tokens de teachers para un aula específica
router.get('/get-tokens-for-teacher-push/workshop/:workshopId', getTokensForTeacherPush); // Obtener tokens de teachers para un taller específico


module.exports = router