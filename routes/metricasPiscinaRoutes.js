var express = require('express');
var router = express.Router();
const { getmetricacomuna, beneficioAplicado, rangoEtario, nacionalidad } = require('../controllers/metricasPiscinaController');

router.get('/comuna', getmetricacomuna);
router.get('/beneficio-aplicado', beneficioAplicado);
router.get('/rango-etario', rangoEtario);
router.get('/nacionalidad', nacionalidad);

module.exports = router;
