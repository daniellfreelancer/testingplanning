const express = require('express');
const router = express.Router();
const notasUsuariosController = require('./notasUsuariosController');

// Rutas para gestionar notas de usuarios
router.post('/usuario/:usuarioId', notasUsuariosController.crearNota);
router.get('/usuario/:usuarioId', notasUsuariosController.obtenerNotasUsuario);
router.delete('/:notaId', notasUsuariosController.eliminarNota);
router.put('/:notaId', notasUsuariosController.editarNota);

module.exports = router;
