const express = require('express');
const router = express.Router();
const statsPteAltoController = require('./statsPteAltoController');

router.get('/main-stats', statsPteAltoController.obtenerStatsPteAlto);

module.exports = router;

