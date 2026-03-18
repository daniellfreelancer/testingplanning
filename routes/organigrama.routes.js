var express = require('express');
var router = express.Router();
const {
    create,
    getAll,
    getById,
    update,
    delete: deleteOrganigrama,
    hardDelete
} = require('../controllers/organigramaController');

// Rutas de organigrama
router.post('/crear', create);
router.get('/obtener-todos', getAll);
router.get('/obtener/:id', getById);
router.put('/actualizar/:id', update);
router.delete('/eliminar/:id', deleteOrganigrama);
router.delete('/eliminar-permanente/:id', hardDelete);

module.exports = router;
