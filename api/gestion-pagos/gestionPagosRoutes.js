const express = require('express');
const router = express.Router();
const gestionPagosController = require('./gestionPagosController');

// Rutas para gestionar pagos
router.post('/registrar-pago/:usuarioID', gestionPagosController.registrarPago); 
//crear suscripcion plan N
router.post('/crear-suscripcion-plan/usuario/:usuarioId/plan/:planId/variante/:varianteId/institucion/:institucionId', gestionPagosController.crearSuscripcion);
router.get('/pagos-hoy/:institucion', gestionPagosController.getPagosToday);
router.get('/pagos-usuario/:usuarioId', gestionPagosController.getPagosByUsuario);
router.get('/pagos-institucion/:institucionId', gestionPagosController.getPagosByInstitucion);
router.get('/ultimo-pago-usuario/:usuarioId', gestionPagosController.getUltimoPagoByUsuario);
router.post('/crear-renovacion/:suscripcionId', gestionPagosController.crearRenovacion);
router.post('/crear-pago/:usuarioId/institucion/:institucionId', gestionPagosController.crearPago);
router.get('/evaluacion-para-descontar/:usuarioId', gestionPagosController.obtenerUltimoPagoEvaluacionUsuarioParaDescontar);
router.put('/actualizar-pago-evaluacion-utilizado/:pagoId', gestionPagosController.actualizarPagoEvaluacionUtilizado);
router.post('/registrar-pago-accesiorios/:institucionId/usuario/:usuarioId', gestionPagosController.registrarPagoAccesiorios);
module.exports = router;