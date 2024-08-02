const express = require('express');
const { createChileafStock, updateChileafStock, deleteChileafStock, getAllChileafStock, getChileafStockByHubId } = require('../controllers/chileafStockController');
const router = express.Router();


// Importar los controladores
router.post('/create', createChileafStock)
router.put('/update/:id', updateChileafStock)
router.delete('/delete/:id', deleteChileafStock)
router.get('/get-stocks', getAllChileafStock)
router.get('/get-stocks-by-hub-id/:hubId', getChileafStockByHubId)


module.exports = router