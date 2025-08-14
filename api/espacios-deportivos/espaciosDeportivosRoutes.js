const express = require('express');
const router = express.Router();
const espaciosDeportivosController = require('./espaciosDeportivosController');
const upload = require('../../middleware/upload');
// Crear espacio deportivo
router.post('/crear-espacio-deportivo/:id?', upload.single('imgUrl'), espaciosDeportivosController.crearEspacioDeportivo);
// Actualizar espacio deportivo
router.put('/:id', upload.single('imgUrl'), espaciosDeportivosController.actualizarEspacioDeportivo);
// Obtener espacio deportivo por id
router.get('/:id', espaciosDeportivosController.obtenerEspacioDeportivo);
// Obtener todos los espacios deportivos
router.get('/', espaciosDeportivosController.obtenerTodosLosEspaciosDeportivos);
// Agregar/eliminar admin
router.post('/:id/admin', espaciosDeportivosController.agregarAdminAEspacioDeportivo);
router.delete('/:id/admin', espaciosDeportivosController.eliminarAdminDeEspacioDeportivo);
// Agregar/eliminar institucion
router.post('/:id/institucion', espaciosDeportivosController.agregarInstitucionAEspacioDeportivo);
router.delete('/:id/institucion', espaciosDeportivosController.eliminarInstitucionDeEspacioDeportivo);
// Agregar/eliminar centro deportivo
router.post('/:id/centro-deportivo', espaciosDeportivosController.agregarCentroDeportivoAEspacioDeportivo);
router.delete('/:id/centro-deportivo', espaciosDeportivosController.eliminarCentroDeportivoDeEspacioDeportivo);

module.exports = router; 