const express = require("express");
const router = express.Router();
const validacionEmailController = require("./validacionEmailController");

router.post("/enviar-codigo", validacionEmailController.enviarCodigo);
router.post("/verificar-codigo", validacionEmailController.verificarCodigo);

module.exports = router;
