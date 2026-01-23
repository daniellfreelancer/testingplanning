const express = require('express');
const router = express.Router();
const seccionController = require('../controllers/seccionController');

// Rutas públicas
router.get('/publicas', seccionController.getSeccionesPublicas);
router.get('/principales', seccionController.getSeccionesPrincipales);
router.get('/slug/:slug', seccionController.getSeccionBySlug);
router.get('/:id/subsecciones', seccionController.getSubsecciones);

// Rutas admin (TODO: agregar autenticación cuando exista middleware)
router.get('/', seccionController.getAllSecciones);
router.get('/:id', seccionController.getSeccionById);
router.post('/', seccionController.createSeccion);
router.put('/:id', seccionController.updateSeccion);
router.delete('/:id', seccionController.deleteSeccion);
router.post('/reordenar', seccionController.reordenarSecciones);

// Rutas para archivos
router.post('/:id/imagen-destacada', seccionController.uploadImagenDestacada);
router.post('/:id/archivos', seccionController.uploadArchivos);
router.delete('/:id/archivos/:archivoId', seccionController.deleteArchivo);

module.exports = router;
