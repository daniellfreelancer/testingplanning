const express = require('express');
const router = express.Router();
const controller = require('../controllers/encuestaGymController');

// Crear encuesta
router.post('/crearEncuesta', controller.crearEncuesta);

// Obtener encuestas
router.post('/obtenerEncuesta', controller.obtenerEncuesta);
router.post('/obtenerEncuestaPorInstitucion', controller.obtenerEncuestaPorInstitucion);
router.post('/obtenerEncuestaPorComplejo', controller.obtenerEncuestaPorComplejo);
router.post('/obtenerEncuestaPorCreador', controller.obtenerEncuestaPorCreador);
router.post('/obtenerEncuestaPorUsuario', controller.obtenerEncuestaPorUsuario);
router.post('/obtenerEncuestaPorIdInterno', controller.obtenerEncuestaPorIdInterno);

// Eliminar encuesta
router.post('/eliminarEncuesta', controller.eliminarEncuesta); // cambiado de DELETE a POST

// Responder encuesta
router.post('/responderEncuesta', controller.responderEncuesta);

module.exports = router;
