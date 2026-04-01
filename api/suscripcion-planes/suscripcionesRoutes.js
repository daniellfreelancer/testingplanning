const express = require('express');
const router = express.Router();
const suscripcionController = require('./suscripcionController');
const suscripcionAuxController = require('./suscripcionAuxController');

router.get('/fecha-inicio-marzo-2026', suscripcionAuxController.getSuscripcionesFechaInicioMarzo2026);
router.get('/migradas-fechas-abril-2026', suscripcionAuxController.getSuscripcionesMigradasAbril2026);
router.get('/migracion-fechas-abril-2026/dry-run', suscripcionAuxController.dryRunMigracionFechasAbril2026);
router.post('/migracion-fechas-abril-2026/ejecutar', suscripcionAuxController.ejecutarMigracionFechasAbril2026);
router.get('/:id', suscripcionController.getSuscripcionById);
router.get('/usuario/:usuarioId', suscripcionController.getSuscripcionByUsuario);
router.get('/plan/:planId', suscripcionController.getSuscripcionByPlan);
router.get('/variante/:varianteId', suscripcionController.getSuscripcionByVariante);
router.get('/pago/:pagoId', suscripcionController.getSuscripcionByPago);
router.get('/institucion/:institucionId', suscripcionController.getSuscripcionByInstitucion);
router.put('/update-suscripcion/:id', suscripcionController.actualizarSuscripcion);
router.get('/ultima-suscripcion-usuario/:usuarioId', suscripcionController.obtenerUltimaSuscripcionPorUsuario);
router.put('/sumar-horas-disponibles/:suscripcionId/horas/:horas', suscripcionController.sumarHorasDisponibles);

module.exports = router;