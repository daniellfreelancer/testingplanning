const express = require("express");
const router = express.Router();
const usuariosUcadController = require("./usuarios-ucad-controller");
const upload = require('../../../libs/docsStorage');

// Registrar deportista (con posibilidad de subir imagen)
router.post("/registrar-deportista", upload.single('imgUrl'), usuariosUcadController.registrarDeportista);

// Registrar colaborador/profesional/deportista (admin crea usuarios, con posibilidad de subir imagen)
router.post("/registrar-colaborador", upload.single('imgUrl'), usuariosUcadController.registrarColaborador);

// Login de usuario UCAD
router.post("/login-usuario", usuariosUcadController.loginUsuarioUCAD);

// Logout de usuario UCAD
router.post("/logout-usuario", usuariosUcadController.logoutUsuarioUCAD);

// Editar usuario UCAD (con posibilidad de subir nueva imagen)
router.put("/editar-usuario/:_id", upload.single('imgUrl'), usuariosUcadController.editarUsuarioUCAD);

// Eliminar usuario UCAD
router.delete("/eliminar-usuario/:_id", usuariosUcadController.eliminarUsuarioUCAD);

// Recuperar contraseña
router.post("/recuperar-password", usuariosUcadController.recuperarPasswordUCAD);

// Obtener profesionales
router.get("/obtener-profesionales", usuariosUcadController.obtenerProfesionales);

// Obtener deportistas
router.get("/obtener-deportistas", usuariosUcadController.obtenerDeportistas);

// Obtener colaboradores
router.get("/obtener-colaboradores", usuariosUcadController.obtenerColaboradores);

// Enviar email de cita con código QR
router.post("/citas/enviar-email-qr", usuariosUcadController.enviarEmailCitaQR);

// Obtener usuario UCAD
router.get("/obtener-usuario/:_id", usuariosUcadController.obtenerUsuarioUCAD);


module.exports = router;