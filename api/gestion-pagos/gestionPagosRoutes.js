const express = require('express');
const router = express.Router();
const gestionPagosController = require('./gestionPagosController');

// Rutas para gestionar pagos
router.post('/registrar-pago/:usuarioID', gestionPagosController.registrarPago); 
router.get('/pagos-institucion/:institucion', gestionPagosController.pagosInstitucion); 

module.exports = router;