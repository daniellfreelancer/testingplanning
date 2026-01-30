const express = require('express');
const router = express.Router();
const clubesPteAltoController = require('./clubesPteAltoController');

router.post('/crear-club-pte-alto', clubesPteAltoController.crearClubPteAlto);
router.get('/obtener-todos-los-clubes-pte-alto', clubesPteAltoController.obtenerTodosLosClubesPteAlto);
router.get('/obtener-club-pte-alto-por-id/:id', clubesPteAltoController.obtenerClubPteAltoPorId);
router.put('/actualizar-club-pte-alto-por-id/:id', clubesPteAltoController.actualizarClubPteAltoPorId);
router.delete('/eliminar-club-pte-alto-por-id/:id', clubesPteAltoController.eliminarClubPteAltoPorId);

module.exports = router;