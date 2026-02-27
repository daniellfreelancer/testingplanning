const express = require('express');
const router = express.Router();
const historicoPteAltoController = require('./historicoPteAltoController');

router.post('/crear-historico-pte-alto', historicoPteAltoController.crearHistoricoPteAlto);
router.get('/obtener-todos-historicos-pte-alto', historicoPteAltoController.obtenerTodosHistoricosPteAlto);

module.exports = router;
