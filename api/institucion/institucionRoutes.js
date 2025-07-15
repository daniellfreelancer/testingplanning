const express = require('express');
const router = express.Router();
const institucionController = require('./institucionController');

router.post('/crear-institucion/:id', institucionController.crearInstitucion); //tested
router.put('/actualizar-institucion/:id', institucionController.actualizarInstitucion); //tested
router.get('/obtener-institucion/:id', institucionController.obtenerInstitucion); //tested
router.get('/obtener-todas-las-instituciones', institucionController.obtenerTodasLasInstituciones); //tested
router.post('/agregar-admin-a-institucion/:id', institucionController.agregarAdminAInstitucion);
router.post('/eliminar-admin-de-institucion/:id', institucionController.eliminarAdminDeInstitucion);
router.delete('/eliminar-institucion/:id', institucionController.eliminarInstitucion);

module.exports = router;