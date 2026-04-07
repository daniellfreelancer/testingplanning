const express = require("express");
const router = express.Router();
const citasUcadController = require("./citas-ucad-controller");

// Crear nueva cita
router.post("/crear-cita", citasUcadController.crearCita);

// Crear cita sobre cupo (omite validación de horario ocupado, requiere motivoSobreCupo)
router.post("/crear-cita-sobre-cupo", citasUcadController.crearCitaSobreCupo);

// Obtener citas sobre cupo (admin) — Query: ?profesional=id&fecha=YYYY-MM-DD&estado=pendiente
router.get("/sobre-cupos", citasUcadController.obtenerSobreCupos);

// Derivar cita a otro profesional
router.post("/derivar-cita", citasUcadController.derivarCita);

// Obtener todas las citas (admin)
router.get("/todas-las-citas", citasUcadController.obtenerTodasLasCitas);

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

// Obtener derivaciones recibidas (pendientes sin fecha)
router.get("/derivaciones-recibidas/:profesionalId", citasUcadController.obtenerDerivacionesRecibidas);

// Asignar fecha/hora a una derivación pendiente
router.put("/asignar-horario-derivacion/:citaId", citasUcadController.asignarHorarioDerivacion);

// ===== NUEVO FLUJO: Derivaciones por área =====

// Crear derivación por área (sin profesional específico)
router.post("/crear-derivacion-area", citasUcadController.crearDerivacionPorArea);

// Listar derivaciones pendientes del área (coordinador)
router.get("/derivaciones-pendientes/:areaEspecialidad", citasUcadController.obtenerDerivacionesPendientesArea);

// Validar derivación (coordinador acepta que corresponde)
router.put("/validar-derivacion/:id", citasUcadController.validarDerivacion);

// Rechazar derivación (coordinador indica que no corresponde)
router.put("/rechazar-derivacion/:id", citasUcadController.rechazarDerivacion);

// Redirigir derivación a otra especialidad (coordinador)
router.put("/redirigir-derivacion/:id", citasUcadController.redirigirDerivacion);

// Asignar profesional y horario a derivación (coordinador)
router.put("/asignar-derivacion/:id", citasUcadController.asignarDerivacion);

module.exports = router;

