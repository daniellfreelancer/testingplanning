const express = require('express');
const talleresDeportivosPteAltoController = require('./talleresDeportivosPteAltoController');
const router = express.Router();
const upload = require('../../../libs/docsStorage');

router.post('/crear-taller', upload.array('galeria', 5), talleresDeportivosPteAltoController.crearTallerDeportivoPteAlto);
router.get('/obtener-todos-los-talleres', talleresDeportivosPteAltoController.obtenerTodosLosTalleresDeportivosPteAlto);
router.get('/obtener-taller/:id', talleresDeportivosPteAltoController.obtenerTallerDeportivoPteAltoPorId);
router.put('/actualizar-taller/:id', upload.array('galeria', 5), talleresDeportivosPteAltoController.actualizarTallerDeportivoPteAltoPorId);
router.delete('/eliminar-taller/:id', talleresDeportivosPteAltoController.eliminarTallerDeportivoPteAltoPorId);

// Rutas para sesiones de talleres
router.get('/obtener-sesiones/:tallerId', talleresDeportivosPteAltoController.obtenerSesionesTaller);
router.post('/inscribir-sesion/:tallerId/:sesionId', talleresDeportivosPteAltoController.inscribirUsuarioASesion);
router.delete('/desinscribir-sesion/:tallerId/:sesionId', talleresDeportivosPteAltoController.desinscribirUsuarioDeSesion);

module.exports = router;