const express = require("express");
const router = express.Router();
const accesoPteAltoController = require("./accesoPteAltoController");

router.post("/crear-acceso", accesoPteAltoController.crearAccesoPteAlto);
router.get("/obtener-accesos", accesoPteAltoController.obtenerAccesosPteAlto);

module.exports = router;