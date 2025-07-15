const express = require("express");
const router = express.Router();
const usuariosComplejosController = require("./usuariosComplejosController");

router.post("/crear-usuario", usuariosComplejosController.crearUsuarioComplejo); //tested
router.put("/actualizar-usuario/:id", usuariosComplejosController.actualizarUsuarioComplejo); //tested
router.get("/obtener-usuario/:id", usuariosComplejosController.obtenerUsuarioComplejo); //tested
router.delete("/eliminar-usuario/:id", usuariosComplejosController.eliminarUsuarioComplejo); //tested
router.get("/obtener-todos-los-usuarios", usuariosComplejosController.obtenerTodosLosUsuariosComplejos); //tested
router.post("/login-usuario", usuariosComplejosController.loginUsuarioComplejo); //tested
router.post("/logout-usuario/:id", usuariosComplejosController.logoutUsuarioComplejo); //tested
router.post("/forgot-password-usuario", usuariosComplejosController.forgotPasswordUsuarioComplejo); //tested

module.exports = router;