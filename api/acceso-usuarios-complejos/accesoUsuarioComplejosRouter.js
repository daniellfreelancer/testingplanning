const express = require('express');
const router = express.Router();
const accesoUsuariosComplejosController = require('./accesoUsuariosComplejosController');

router.post('/crear-acceso', accesoUsuariosComplejosController.crearAccesoUsuariosComplejos);
router.get('/obtener-accesos-por-institucion/:institucion', accesoUsuariosComplejosController.obtenerAccesosPorInstitucion);
router.get('/obtener-todos-los-accesos', accesoUsuariosComplejosController.obtenerTodosLosAccesos);

module.exports = router;