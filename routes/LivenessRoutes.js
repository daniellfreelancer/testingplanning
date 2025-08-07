const express = require("express");
const router = express.Router();
const livenessController = require("../controllers/LivenessController");

// Inicia sesión de liveness
router.post('/liveness-session', livenessController.iniciarSesion);
router.get('/liveness-result', livenessController.obtenerResultado);

module.exports = router;