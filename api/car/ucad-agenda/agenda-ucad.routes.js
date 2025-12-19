const express = require("express");
const router = express.Router();
const agendaUcadController = require("./agenda-ucad-controller");

// Crear agenda para un profesional
router.post("/crear-agenda", agendaUcadController.crearAgenda);

// Actualizar agenda existente
router.put("/actualizar-agenda/:id", agendaUcadController.actualizarAgenda);

// Obtener agenda de un profesional
router.get("/agenda-profesional/:profesionalId", agendaUcadController.obtenerAgendaProfesional);

// Obtener disponibilidad de horarios en una fecha específica
router.get("/disponibilidad/:profesionalId/:fecha", agendaUcadController.obtenerDisponibilidad);

module.exports = router;

