const express = require('express');
const router = express.Router();
const videoController = require('./videoController');

// Rutas públicas
router.get('/activos', videoController.getVideosActivos);
router.get('/destacados', videoController.getVideosDestacados);
router.post('/:id/vistas', videoController.incrementarVistas);

// Rutas admin (TODO: agregar autenticación cuando exista middleware)
router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.post('/', videoController.createVideo);
router.put('/:id', videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);
router.delete('/:id/permanente', videoController.deleteVideoPermanente);
router.post('/reordenar', videoController.reordenarVideos);

module.exports = router;
