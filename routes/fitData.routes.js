var express = require('express');
const { registerFitData } = require('../controllers/fitDataController');
var router = express.Router();

router.post('/register', registerFitData )

module.exports = router;