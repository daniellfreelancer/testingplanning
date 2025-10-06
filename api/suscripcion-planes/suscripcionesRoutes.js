const express = require('express');
const router = express.Router();
const suscripcionController = require('./suscripcionController');

router.get('/:id', suscripcionController.getSuscripcionById);
router.get('/usuario/:usuarioId', suscripcionController.getSuscripcionByUsuario);
router.get('/plan/:planId', suscripcionController.getSuscripcionByPlan);
router.get('/variante/:varianteId', suscripcionController.getSuscripcionByVariante);
router.get('/pago/:pagoId', suscripcionController.getSuscripcionByPago);
router.get('/institucion/:institucionId', suscripcionController.getSuscripcionByInstitucion);

module.exports = router;