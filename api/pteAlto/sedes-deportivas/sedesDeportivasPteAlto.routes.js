const express = require('express');
const router = express.Router();
const sedesDeportivasPteAltoController = require('./sedesDeportivasPteAltoController');
const upload = require('../../../libs/docsStorage');

router.post('/crear-sede-deportiva', upload.single('imgUrl'), sedesDeportivasPteAltoController.crearSedeDeportivaPteAlto);
router.get('/obtener-sedes-deportivas', sedesDeportivasPteAltoController.obtenerTodasLasSedesDeportivasPteAlto);
router.get('/obtener-sede-deportiva/:id', sedesDeportivasPteAltoController.obtenerSedeDeportivaPteAltoPorId);
router.put('/actualizar-sede-deportiva/:id', sedesDeportivasPteAltoController.actualizarSedeDeportivaPteAltoPorId);
router.delete('/eliminar-sede-deportiva/:id', sedesDeportivasPteAltoController.eliminarSedeDeportivaPteAltoPorId);

module.exports = router;