const express = require("express");
const router = express.Router();
const usuariosPteAltoController = require("./usuariosPteAltoController");
const upload = require('../../../libs/docsStorage');

router.post("/crear-usuario", usuariosPteAltoController.crearUsuarioPteAlto);
router.post("/crear-usuario-externo", upload.single('certificadoDomicilio'), usuariosPteAltoController.crearUsuarioExternoPteAlto);
router.post("/asignar-admin-pte-alto", usuariosPteAltoController.asignarAdminPteAlto);
router.put("/actualizar-usuario/:id", usuariosPteAltoController.actualizarUsuarioPteAlto);
router.delete("/eliminar-usuario/:id", usuariosPteAltoController.eliminarUsuarioPteAlto);
router.get("/obtener-usuario/:id", usuariosPteAltoController.obtenerUsuarioPteAlto);
router.post("/login-usuario", usuariosPteAltoController.loginUsuarioPteAlto);
router.post("/logout-usuario/:id", usuariosPteAltoController.logoutUsuarioPteAlto);
router.get("/obtener-todos-los-usuarios", usuariosPteAltoController.obtenerTodosLosUsuariosPteAlto);
router.put("/validar-usuario/:id", usuariosPteAltoController.validarUsuarioPteAlto);
router.put("/asignar-admin-pte-alto/:id", usuariosPteAltoController.asignarAdminPteAlto);
router.post("/crear-usuario-form-pte-alto", upload.single('certificadoDomicilio'), usuariosPteAltoController.crearUsuarioFormPteAlto);
module.exports = router;