const mongoose = require("mongoose");

const agendaUCADSchema = new mongoose.Schema({
  profesional: { type: mongoose.Types.ObjectId, ref: 'usuariosUcad', required: true },
  dias: { type: Array, required: true }, // días habilitados por admin: ["lunes", "martes"]
  horaInicio: { type: String, required: true }, // rango mínimo establecido por admin
  horaFin: { type: String, required: true }, // rango máximo establecido por admin
  bloque: { type: Number, required: true, default: 15 }, // minutos por slot (15, 30, 45, 60)
  status: { type: Boolean, default: true }, // agenda activa/inactiva
  horariosDisponibles: { type: Array, default: [] }, // horarios específicos seleccionados por profesional
  // estructura: [{ dia: "lunes", horarios: ["09:00", "09:15", "09:30"] }]
  horariosOcupados: { type: Array, default: [] }, // horarios bloqueados por profesional
  // estructura: [{ dia: "lunes", horarios: [{ hora: "09:00", motivo: "Reunión" }] }]
  habilitadaPor: { type: mongoose.Types.ObjectId, ref: 'usuariosUcad' }, // admin que habilitó
  fechaHabilitacion: { type: Date, default: Date.now },
},{
    timestamps: true,
});

const AgendaUCAD = mongoose.model("agendaUCAD", agendaUCADSchema);

module.exports = AgendaUCAD;