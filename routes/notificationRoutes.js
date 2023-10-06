var express = require('express');
const { createNotificationForAllStudents, deleteNotificationForAllStudents, deleteNotificationFromStudent, createNotificationForTeacher, deleteNotificationFromTeacher, getNotificationUser, createNotificationForStudent } = require('../controllers/notificationController');
var router = express.Router();


router.post('/create-to-all-students', createNotificationForAllStudents)
router.post('/create-to-teacher', createNotificationForTeacher)
router.post('/create-to-student', createNotificationForStudent)
router.delete('/delete-to-all-students', deleteNotificationForAllStudents)
router.delete('/delete-from-student/student/:studentId/notification/:notificationId', deleteNotificationFromStudent)
router.delete('/delete-from-teacher/teacher/:teacherId/notification/:notificationId', deleteNotificationFromTeacher)
router.get('/get-notifications/user/:teacherId', getNotificationUser);
router.get('/get-notifications/student/:studentId', getNotificationUser);

module.exports = router