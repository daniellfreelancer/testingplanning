const express = require('express');
const router = express.Router();
const supervisionPteAltoController = require('./supervisionPteAltoController');

router.post('/crear-supervision-complejo', supervisionPteAltoController.crearSupervisionComplejoPteAlto);
router.get('/obtener-supervision-complejo/:idComplejoDeportivo', supervisionPteAltoController.obtenerSupervisionComplejoPteAlto);
router.post('/crear-supervision-espacio', supervisionPteAltoController.crearSupervisionEspacioPteAlto);
router.get('/obtener-supervision-espacio/:idEspacioDeportivo', supervisionPteAltoController.obtenerSupervisionEspacioPteAlto);
router.post('/crear-supervision-sede', supervisionPteAltoController.crearSupervisionSedePteAlto);
router.get('/obtener-supervision-sede/:idSede', supervisionPteAltoController.obtenerSupervisionSedePteAlto);
router.post('/crear-supervision-taller', supervisionPteAltoController.crearSupervisionTallerPteAlto);
router.get('/obtener-supervision-taller/:idTaller', supervisionPteAltoController.obtenerSupervisionTallerPteAlto);

module.exports = router;