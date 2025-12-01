const express = require('express');
const router = express.Router();
const complejosDeportivosPteAltoController = require('./complejosDeportivosPteAltoController');

router.post('/crear-complejo-deportivo/:institucion', complejosDeportivosPteAltoController.crearComplejoDeportivoPteAlto);
router.get('/complejos-deportivos', complejosDeportivosPteAltoController.obtenerTodosLosComplejosDeportivosPteAlto);
router.get('/obtener-complejo-deportivo/:id', complejosDeportivosPteAltoController.obtenerComplejoDeportivoPteAltoPorId);
router.put('/actualizar-complejo-deportivo/:id', complejosDeportivosPteAltoController.actualizarComplejoDeportivoPteAltoPorId);
router.delete('/eliminar-complejo-deportivo/:id', complejosDeportivosPteAltoController.eliminarComplejoDeportivoPteAltoPorId);

module.exports = router;