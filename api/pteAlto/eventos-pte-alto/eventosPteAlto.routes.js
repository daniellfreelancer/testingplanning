const express = require('express');
const router = express.Router();
const eventosPteAltoController = require('./eventosPteAltoController');
const fileUpload = require('express-fileupload');
const eventosVariantesPteAltoController = require('../eventos-variantes-pte-alto/eventosVariantesPteAltoController');

// Configurar express-fileupload (igual que noticias)
const fileUploadMiddleware = fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  abortOnLimit: true
});

// Crear evento con express-fileupload
router.post('/crear-evento', fileUploadMiddleware, eventosPteAltoController.crearEventoPteAlto);
router.put('/editar-evento/:id', fileUploadMiddleware, eventosPteAltoController.editarEventoPteAlto);
router.delete('/eliminar-evento/:id', eventosPteAltoController.eliminarEventoPteAlto);
router.get('/obtener-detalle/:id', eventosPteAltoController.obtenerEventoPteAltoporId);
router.get('/obtener-todos-los-eventos', eventosPteAltoController.obtenerTodosLosEventosPteAlto);
router.get('/obtener-eventos-destacados', eventosPteAltoController.obtenerEventosDestacados);
router.post('/inscripcion/:varianteId/evento/:eventoId', eventosVariantesPteAltoController.inscripcionUsuarioAVariante);



module.exports = router;