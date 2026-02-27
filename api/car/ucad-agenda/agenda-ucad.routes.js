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

// === NUEVOS ENDPOINTS ===

// Admin habilita agenda para un profesional (primera vez)
router.post("/habilitar-agenda", agendaUcadController.habilitarAgenda);

// Obtener agenda habilitada con slots disponibles
router.get("/agenda-habilitada/:profesionalId", agendaUcadController.obtenerAgendaHabilitada);

// Profesional actualiza sus horarios disponibles
router.put("/actualizar-horarios/:agendaId", agendaUcadController.actualizarHorariosDisponibles);

// Profesional actualiza sus horarios ocupados
router.put("/actualizar-horarios-ocupados/:agendaId", agendaUcadController.actualizarHorariosOcupados);

// Marcar hora como ocupada (crea cita interna) - DEPRECATED
router.post("/marcar-hora-ocupada/:agendaId", agendaUcadController.marcarHoraOcupada);

// Sincronizar agendas con usuarios (temporal)
router.get("/sincronizar-agendas", agendaUcadController.sincronizarAgendas);

module.exports = router;

