const express = require("express");
const router = express.Router();

const notificacionesUcadController = require("./notificaciones-ucad.controller");

// POST /notificaciones-ucad/crear
router.post("/crear", notificacionesUcadController.crearNotificacion);

// GET /ucad-notificaciones/:id
router.get("/:id", notificacionesUcadController.obtenerNotificacionPorId);

// GET /ucad-notificaciones/target/:targetId
router.get("/target/:targetId", notificacionesUcadController.listarPorTarget);

// GET /ucad-notificaciones/creador/:creatorId
router.get("/creador/:creatorId", notificacionesUcadController.listarPorCreador);


module.exports = router;
