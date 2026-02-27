const express = require("express");
const router = express.Router();
const usuariosPteAltoController = require("./usuariosPteAltoController");
const upload = require('../../../libs/pteAltoDocStorage');

router.post("/crear-usuario", usuariosPteAltoController.crearUsuarioPteAlto);
router.post("/crear-usuario-externo", upload.fields([
  { name: 'certificadoDomicilio', maxCount: 1 },
  { name: 'fotoCedulaFrontal', maxCount: 1 }
]), usuariosPteAltoController.crearUsuarioExternoPteAlto);
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
router.get("/obtener-colaboradores", usuariosPteAltoController.obtenerUsuariosInternosPteAlto);
router.put("/usuarios-pte-alto/:id/certificado-domicilio",upload.single("certificadoDomicilio"),usuariosPteAltoController.actualizarCertificadoDomicilioPteAlto);
router.get("/obtener-colaboradores-pte-alto", usuariosPteAltoController.obtenerColaboradoresPteAlto);
router.put("/cambiar-contrasena-usuario-pte-alto/:id", usuariosPteAltoController.cambiarContraseñaUsuarioPteAlto);
router.put("/actualizar-colaborador-pte-alto/:idColaborador", usuariosPteAltoController.actualizarColaboradorPteAlto);
router.put("/asignar-complejos-deportivos-pte-alto/:idUsuario", usuariosPteAltoController.adminsComplejosPteAlto);
module.exports = router;