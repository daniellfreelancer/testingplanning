const express = require('express');
const talleresDeportivosPteAltoController = require('./talleresDeportivosPteAltoController');
const router = express.Router();

router.post('/crear-taller', talleresDeportivosPteAltoController.crearTallerDeportivoPteAlto);
router.get('/obtener-todos-los-talleres', talleresDeportivosPteAltoController.obtenerTodosLosTalleresDeportivosPteAlto);
router.get('/obtener-taller/:id', talleresDeportivosPteAltoController.obtenerTallerDeportivoPteAltoPorId);
router.put('/actualizar-taller/:id', talleresDeportivosPteAltoController.actualizarTallerDeportivoPteAltoPorId);
router.delete('/eliminar-taller/:id', talleresDeportivosPteAltoController.eliminarTallerDeportivoPteAltoPorId);

module.exports = router;