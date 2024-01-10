var express = require('express');
const { registerFitData, getFitData, updateFitData } = require('../controllers/fitDataController');
var router = express.Router();

router.post('/register', registerFitData )
router.get('/get-data', getFitData)
router.post('/update', updateFitData);  // Nueva ruta para actualizar los datos


module.exports = router;