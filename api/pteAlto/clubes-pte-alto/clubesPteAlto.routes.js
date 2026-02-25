const express = require('express');
const router = express.Router();
const { uploadDocsMultiple } = require('../../../libs/docsStorage');
const clubesPteAltoController = require('./clubesPteAltoController');

const DOCUMENTOS_MAX = 10;

router.post('/crear-club-pte-alto', uploadDocsMultiple.array('documentos', DOCUMENTOS_MAX), clubesPteAltoController.crearClubPteAlto);
router.get('/obtener-todos-los-clubes-pte-alto', clubesPteAltoController.obtenerTodosLosClubesPteAlto);
router.get('/obtener-club-pte-alto-por-id/:id', clubesPteAltoController.obtenerClubPteAltoPorId);
router.put('/actualizar-club-pte-alto-por-id/:id', uploadDocsMultiple.array('documentos', DOCUMENTOS_MAX), clubesPteAltoController.actualizarClubPteAltoPorId);
router.delete('/eliminar-club-pte-alto-por-id/:id', clubesPteAltoController.eliminarClubPteAltoPorId);

module.exports = router;