const express = require('express');
const router = express.Router();
const eventosPteAltoController = require('./eventosPteAltoController');
const upload = require('../../../libs/docsStorage');
const eventosVariantesPteAltoController = require('../eventos-variantes-pte-alto/eventosVariantesPteAltoController');

router.post('/crear-evento', upload.single('imgUrl'), eventosPteAltoController.crearEventoPteAlto);
router.put('/editar-evento/:id', upload.single('imgUrl'), eventosPteAltoController.editarEventoPteAlto);
router.delete('/eliminar-evento/:id', eventosPteAltoController.eliminarEventoPteAlto);
router.get('/obtener-detalle/:id', eventosPteAltoController.obtenerEventoPteAltoporId);
router.get('/obtener-todos-los-eventos', eventosPteAltoController.obtenerTodosLosEventosPteAlto);
router.post('/inscripcion/:varianteId/evento/:eventoId', eventosVariantesPteAltoController.inscripcionUsuarioAVariante);



module.exports = router;