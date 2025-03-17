const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/carAppoiment.controller');

router.get('/available-dates/:evaluationType/date/:date', appointmentController.getAvailableDates); //✔️
router.post('/create', appointmentController.createAppointment); //✔️
router.get('/my-appointments/:athleteId', appointmentController.getMyAppointments);  //✔️
router.put('/:appointmentId', appointmentController.updateAppointment); //✔️
router.delete('/:appointmentId', appointmentController.deleteAppointment); //✔️
router.get('/category/:workshopId', appointmentController.getAppointmentsByCategory); //✔️
router.get('/evaluation-type/:evaluationType', appointmentController.getAppointmentsByEvaluationType);  //✔️
router.get('/type/:type', appointmentController.getAppointmentByType); 
router.get('/all', appointmentController.getAllAppointments); 

module.exports = router;