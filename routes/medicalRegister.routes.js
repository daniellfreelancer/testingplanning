var express = require('express');

const { createRegister, getAllRegisters, getRegisterById, getRegisterByRut, updateRegister, deleteRegister } = require('../controllers/medicalRegisterController');
var router = express.Router();


// Ruta para crear un nuevo registro médico
router.post('/register', createRegister);

// Ruta para obtener todos los registros médicos
router.get('/registers', getAllRegisters);

// Ruta para obtener un registro médico por ID
router.get('/register/:id', getRegisterById);

// Ruta para obtener un registro médico por RUT
router.get('/register/rut/:rut', getRegisterByRut);

// Ruta para actualizar un registro médico por ID
router.put('/register/:id', updateRegister);

// Ruta para eliminar un registro médico por ID
router.delete('/register/:id', deleteRegister);

module.exports = router;