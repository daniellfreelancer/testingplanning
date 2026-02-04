const express = require('express');
const router = express.Router();
const complejosDeportivosPteAltoController = require('./complejosDeportivosPteAltoController');
const upload = require('../../../libs/docsStorage');
router.post('/crear-complejo-deportivo/:institucion', upload.single('imgUrl'), complejosDeportivosPteAltoController.crearComplejoDeportivoPteAlto);
router.get('/complejos-deportivos', complejosDeportivosPteAltoController.obtenerTodosLosComplejosDeportivosPteAlto);
router.get('/obtener-complejo-deportivo/:id', complejosDeportivosPteAltoController.obtenerComplejoDeportivoPteAltoPorId);
router.put('/actualizar-complejo-deportivo/:id', upload.single('imgUrl'), complejosDeportivosPteAltoController.actualizarComplejoDeportivoPteAltoPorId);
router.delete('/eliminar-complejo-deportivo/:id', complejosDeportivosPteAltoController.eliminarComplejoDeportivoPteAltoPorId);

module.exports = router;