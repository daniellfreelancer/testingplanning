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

// Rutas públicas (podrías agregar middleware de autenticación según necesites)
router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', deleteOrganigrama);
router.delete('/:id/hard', hardDelete);

module.exports = router;
