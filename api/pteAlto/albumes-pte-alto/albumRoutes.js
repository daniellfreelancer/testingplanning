const express = require('express');
const router = express.Router();
const albumController = require('./albumController');

// Rutas públicas
router.get('/publicos', albumController.getAlbumesPublicos);
router.get('/slug/:slug', albumController.getAlbumBySlug);

// Rutas admin (TODO: agregar autenticación cuando exista middleware)
router.get('/', albumController.getAllAlbumes);
router.get('/:id', albumController.getAlbumById);
router.post('/', albumController.createAlbum);
router.put('/:id', albumController.updateAlbum);
router.delete('/:id', albumController.deleteAlbum);
router.delete('/:id/permanente', albumController.deleteAlbumPermanente);
router.post('/reordenar', albumController.reordenarAlbumes);

// Rutas para imágenes
router.post('/:id/imagenes', albumController.uploadImagenes);
router.delete('/:id/imagenes/:imagenId', albumController.deleteImagen);
router.put('/:id/imagenes/:imagenId', albumController.updateImagen);
router.post('/:id/imagenes/reordenar', albumController.reordenarImagenes);
router.post('/:id/imagenes/:imagenId/portada', albumController.setImagenPortada);

module.exports = router;
