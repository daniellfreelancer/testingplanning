const express = require('express');
const router = express.Router();
const gestionPagosController = require('./gestionPagosController');

// Rutas para gestionar pagos
router.post('/registrar-pago/:usuarioID', gestionPagosController.registrarPago); 
router.get('/pagos-institucion/:institucion', gestionPagosController.pagosInstitucion); 
//crear suscripcion plan N
router.post('/crear-suscripcion-plan/usuario/:usuarioId/plan/:planId/variante/:varianteId/institucion/:institucionId', gestionPagosController.crearSuscripcion);
router.get('/pagos-hoy', gestionPagosController.getPagosToday);

module.exports = router;