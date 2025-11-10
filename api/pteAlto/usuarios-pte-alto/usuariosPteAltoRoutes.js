const express = require("express");
const router = express.Router();
const usuariosPteAltoController = require("./usuariosPteAltoController");

router.post("/crear-usuario", usuariosPteAltoController.crearUsuarioPteAlto);
router.put("/actualizar-usuario/:id", usuariosPteAltoController.actualizarUsuarioPteAlto);
router.delete("/eliminar-usuario/:id", usuariosPteAltoController.eliminarUsuarioPteAlto);
router.get("/obtener-usuario/:id", usuariosPteAltoController.obtenerUsuarioPteAlto);
router.post("/login-usuario", usuariosPteAltoController.loginUsuarioPteAlto);
router.post("/logout-usuario/:id", usuariosPteAltoController.logoutUsuarioPteAlto);

module.exports = router;