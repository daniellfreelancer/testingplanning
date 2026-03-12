const express = require('express');
const router = express.Router();
const profesoresPiscinaStgoController = require('./profesoresPiscinaStgoController');

router.post('/crear-profesor', profesoresPiscinaStgoController.crearProfesor);
router.get('/obtener-profesores', profesoresPiscinaStgoController.obtenerProfesores);
router.get('/obtener-profesor/:id', profesoresPiscinaStgoController.obtenerProfesor);
router.put('/actualizar-profesor/:id', profesoresPiscinaStgoController.actualizarProfesor);
router.delete('/eliminar-profesor/:id', profesoresPiscinaStgoController.eliminarProfesor);

module.exports = router;