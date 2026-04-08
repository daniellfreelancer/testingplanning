const express = require('express');
const router = express.Router();
const sesionesTallerEjecutadaPteAltoController = require('./sesionesTallerEjecutadaPteAltoController');

/** Token Bearer opcional: ver resolverCreadoPorId en el controlador al crear sesión. */
router.post('/sesiones-ejecutadas', sesionesTallerEjecutadaPteAltoController.crearSesionEjecutada);

router.get(
  '/sesiones-ejecutadas/taller/:tallerId',
  sesionesTallerEjecutadaPteAltoController.listarSesionesEjecutadasPorTaller
);

router.get('/sesiones-ejecutadas/:id', sesionesTallerEjecutadaPteAltoController.obtenerSesionEjecutadaPorId);

module.exports = router;
