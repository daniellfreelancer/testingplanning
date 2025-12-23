const express = require("express");
const router = express.Router();
const citasUcadController = require("./citas-ucad-controller");

// Crear nueva cita
router.post("/crear-cita", citasUcadController.crearCita);

// Derivar cita a otro profesional
router.post("/derivar-cita", citasUcadController.derivarCita);

// Obtener citas de un deportista
router.get("/mis-citas/:deportistaId", citasUcadController.obtenerCitasDeportista);

// Obtener citas de un profesional
router.get("/citas-profesional/:profesionalId", citasUcadController.obtenerCitasProfesional);

// Obtener detalle de una cita
router.get("/cita/:citaId", citasUcadController.obtenerCita);

// Confirmar cita (profesional)
router.put("/confirmar-cita/:citaId", citasUcadController.confirmarCita);

// Cancelar cita
router.put("/cancelar-cita/:citaId", citasUcadController.cancelarCita);

// Completar cita (profesional)
router.put("/completar-cita/:citaId", citasUcadController.completarCita);

// Obtener horarios disponibles para agendar
router.get("/horarios-disponibles/:profesionalId/:fecha", citasUcadController.obtenerHorariosDisponibles);

// Obtener todas las citas
router.get("/todas-las-citas", citasUcadController.obtenerTodasLasCitas);
module.exports = router;

