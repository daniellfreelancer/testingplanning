const express = require('express');
const router = express.Router();
const espaciosDeportivosPteAltoController = require('./espaciosDeportivosPteAltoController');
const upload = require('../../../libs/docsStorage');

router.post('/crear-espacio/:complejoDeportivo', upload.single('imgUrl'), espaciosDeportivosPteAltoController.crearEspacioDeportivoPteAlto);
router.get('/obtener-todos-los-espacios', espaciosDeportivosPteAltoController.obtenerTodosLosEspaciosDeportivosPteAlto);
router.get('/obtener-espacio/:id', espaciosDeportivosPteAltoController.obtenerEspacioDeportivoPteAltoPorId);
router.put('/actualizar-espacio/:id', espaciosDeportivosPteAltoController.actualizarEspacioDeportivoPteAltoPorId);
router.delete('/eliminar-espacio/:id', espaciosDeportivosPteAltoController.eliminarEspacioDeportivoPteAltoPorId);

module.exports = router;