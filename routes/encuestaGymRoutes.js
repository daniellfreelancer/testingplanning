const express = require('express');
const router = express.Router();
const controller = require('../controllers/encuestaGymController');

// Crear encuesta
router.post('/crearEncuesta', controller.crearEncuesta);
router.post('/encuestas/masivo', controller.crearEncuestasMasivas);

// Obtener encuestas
router.post('/obtenerEncuesta', controller.obtenerEncuesta);
router.post('/obtenerEncuestaPorInstitucion', controller.obtenerEncuestaPorInstitucion);
router.post('/obtenerEncuestaPorComplejo', controller.obtenerEncuestaPorComplejo);
router.post('/obtenerEncuestaPorCreador', controller.obtenerEncuestaPorCreador);
router.post('/obtenerEncuestaPorUsuario', controller.obtenerEncuestaPorUsuario);
router.post('/obtenerEncuestaPorIdInterno', controller.obtenerEncuestaPorIdInterno);
router.post('/obtenerEncuestaPorEvaluado', controller.obtenerEncuestaPorEvaluado);

// Editar encuesta
router.post('/editarEncuesta', controller.editarEncuesta);

// Eliminar encuesta
router.post('/eliminarEncuesta', controller.eliminarEncuesta);

// Responder encuesta
router.post('/responderEncuesta', controller.responderEncuesta);

module.exports = router;
