const express = require('express');
const talleresDeportivosPteAltoController = require('./talleresDeportivosPteAltoController');
const router = express.Router();
const upload = require('../../../libs/docsStorage');

router.post('/crear-taller', upload.array('galeria', 5), talleresDeportivosPteAltoController.crearTallerDeportivoPteAlto);
router.get('/obtener-todos-los-talleres', talleresDeportivosPteAltoController.obtenerTodosLosTalleresDeportivosPteAlto);
router.get('/obtener-taller/:id', talleresDeportivosPteAltoController.obtenerTallerDeportivoPteAltoPorId);
router.put('/actualizar-taller/:id', talleresDeportivosPteAltoController.actualizarTallerDeportivoPteAltoPorId);
router.delete('/eliminar-taller/:id', talleresDeportivosPteAltoController.eliminarTallerDeportivoPteAltoPorId);

module.exports = router;