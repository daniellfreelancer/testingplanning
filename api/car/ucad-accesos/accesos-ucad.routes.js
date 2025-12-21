const express = require("express");
const router = express.Router();

const AccesosUcadController = require("./accesos-ucad-controller");

router.post("/crear-acceso", AccesosUcadController.crearAccesoUcad);

// por institución
router.get("/obtener-accesos-por-institucion/:institucion", AccesosUcadController.obtenerAccesosPorInstitucion);
router.get("/obtener-accesos-por-institucion/:institucion/:periodo", AccesosUcadController.obtenerAccesosPorInstitucion);

// por usuario (quién accedió)
router.get("/obtener-accesos-por-usuario/:usuarioId", AccesosUcadController.obtenerAccesosPorUsuario);
router.get("/obtener-accesos-por-usuario/:usuarioId/:periodo", AccesosUcadController.obtenerAccesosPorUsuario);

// por autorizador (quién autorizó)
router.get("/obtener-accesos-por-autorizador/:autorizadorId", AccesosUcadController.obtenerAccesosPorAutorizador);
router.get("/obtener-accesos-por-autorizador/:autorizadorId/:periodo", AccesosUcadController.obtenerAccesosPorAutorizador);

// todos
router.get("/obtener-todos-los-accesos", AccesosUcadController.obtenerTodosLosAccesos);

module.exports = router;
