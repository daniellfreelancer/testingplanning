const mongoose = require("mongoose");

const agendaUCADSchema = new mongoose.Schema({
  profesional: { type: mongoose.Types.ObjectId, ref: 'usuariosUcad', required: true },

  // ========== CONFIGURACIÓN GLOBAL ==========
  bloque: { type: Number, required: true, default: 30 }, // minutos por slot (15, 30, 45, 60)
  status: { type: Boolean, default: true }, // agenda activa/inactiva

  // ========== PLANTILLA BASE (OPCIONAL - para copiar rápido) ==========
  plantillaBase: {
    dias: { type: Array, default: [] }, // días de referencia: ["lunes", "martes"]
    horaInicio: { type: String, default: "09:00" },
    horaFin: { type: String, default: "18:00" },
    horariosDisponibles: { type: Array, default: [] }, // [{ dia: "lunes", horarios: ["09:00", "09:30"] }]
  },

  // ========== HORARIOS POR FECHA ESPECÍFICA (SISTEMA PRINCIPAL) ==========
  horariosPorFecha: { type: Array, default: [] },
  // estructura: [{
  //   fecha: "2026-03-11", // fecha específica (formato ISO YYYY-MM-DD)
  //   horarios: ["09:00", "09:30", "10:00", "10:30", ...], // horarios disponibles
  //   bloques: [{ inicio: "09:00", fin: "18:00" }], // bloques horarios configurados
  //   ocupados: [{ hora: "14:00", motivo: "Almuerzo" }], // horarios bloqueados (DEPRECATED)
  //   slotsBloqueados: ["13:00", "13:30"], // slots bloqueados manualmente
  //   notas: "Jornada especial" // opcional
  // }]
  // NOTA: Solo se guardan fechas con horarios configurados (no vacías)

  // ========== EXCEPCIONES (BLOQUEOS COMPLETOS) ==========
  excepciones: { type: Array, default: [] },
  // estructura: [{
  //   fecha: "2026-03-15", // fecha específica (formato ISO)
  //   tipo: "bloqueo_completo" | "bloqueo_parcial" | "cambio_horario",
  //   motivo: "Enfermedad" | "Vacaciones" | "Reunión" | "Personal" | "Otro",
  //   descripcion: "Texto libre para detalles adicionales",
  //   // Para bloqueo parcial:
  //   horaInicio: "14:00",
  //   horaFin: "16:00",
  //   // Para cambio de horario:
  //   horariosDisponibles: ["08:00", "08:30", ...],
  //   horariosOcupados: [{ hora: "12:00", motivo: "Almuerzo" }],
  //   // Metadata:
  //   creadaPor: ObjectId, // coordinador que creó la excepción
  //   fechaCreacion: Date
  // }]

  habilitadaPor: { type: mongoose.Types.ObjectId, ref: 'usuariosUcad' }, // admin que habilitó
  fechaHabilitacion: { type: Date, default: Date.now },
  coordinadores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosUcad' }], // coordinadores que pueden gestionar esta agenda
  bloqueadaParaProfesional: { type: Boolean, default: false }, // si true, profesional no puede editar
  ultimaModificacionPor: { type: mongoose.Types.ObjectId, ref: 'usuariosUcad' }, // último que modificó
  ultimaModificacion: { type: Date }, // fecha de última modificación
},{
    timestamps: true,
});

// Índices para optimizar consultas
agendaUCADSchema.index({ profesional: 1 });
agendaUCADSchema.index({ profesional: 1, "horariosPorFecha.fecha": 1 });
agendaUCADSchema.index({ profesional: 1, "excepciones.fecha": 1 });

const AgendaUCAD = mongoose.model("agendaUCAD", agendaUCADSchema);

module.exports = AgendaUCAD;