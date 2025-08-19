const express = require('express');
const router = express.Router();
const espaciosDeportivosController = require('./espaciosDeportivosController');
const upload = require('../../libs/docsStorage');
// Crear espacio deportivo
router.post('/crear-espacio-deportivo/:id?', upload.single('imgUrl'), espaciosDeportivosController.crearEspacioDeportivo);
// Actualizar espacio deportivo
router.put('/actualizar-espacio-deportivo/:id', upload.single('imgUrl'), espaciosDeportivosController.actualizarEspacioDeportivo);
// Obtener espacio deportivo por id
router.get('/obtener-espacio-deportivo/:id', espaciosDeportivosController.obtenerEspacioDeportivo);
// Obtener todos los espacios deportivos
router.get('/', espaciosDeportivosController.obtenerTodosLosEspaciosDeportivos);
// Agregar/eliminar admin
router.post('/agregar-admin/:id/admin', espaciosDeportivosController.agregarAdminAEspacioDeportivo);
router.delete('/eliminar-admin/:id/admin', espaciosDeportivosController.eliminarAdminDeEspacioDeportivo);
// Agregar/eliminar institucion
router.post('/agregar-institucion/:id/institucion', espaciosDeportivosController.agregarInstitucionAEspacioDeportivo);
router.delete('/eliminar-institucion/:id/institucion', espaciosDeportivosController.eliminarInstitucionDeEspacioDeportivo);
// Agregar/eliminar centro deportivo
router.post('/agregar-centro-deportivo/:id/centro-deportivo', espaciosDeportivosController.agregarCentroDeportivoAEspacioDeportivo);
router.delete('/eliminar-centro-deportivo/:id/centro-deportivo', espaciosDeportivosController.eliminarCentroDeportivoDeEspacioDeportivo);

module.exports = router; 