const express = require('express');
const router = express.Router();
const historicoPteAltoController = require('./historicoPteAltoController');
const { verificarToken, verificarRol } = require('../../car/middleware/auth');

const ROLES_GESTION_PTE_ALTO = ['ADMIN', 'COORDINADOR', 'MONITOR', 'COMUNICACIONES', 'SUPERVISOR', 'AGENDAMIENTO', 'ADMIN_RECINTO', 'TERRITORIO_DEPORTIVO'];

router.post(
  '/crear-historico-pte-alto',
  verificarToken,
  verificarRol(...ROLES_GESTION_PTE_ALTO),
  historicoPteAltoController.crearHistoricoPteAlto
);
router.get(
  '/obtener-todos-historicos-pte-alto',
  verificarToken,
  verificarRol(...ROLES_GESTION_PTE_ALTO),
  historicoPteAltoController.obtenerTodosHistoricosPteAlto
);

module.exports = router;
