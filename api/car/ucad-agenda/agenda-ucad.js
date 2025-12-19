const mongoose = require("mongoose");

const agendaUCADSchema = new mongoose.Schema({
  profesional: { type: mongoose.Types.ObjectId, ref: 'usuariosUcad' },
  dias: { type: Array },
  horaInicio: { type: String },
  horaFin: { type: String },
  status: { type: Boolean, default: true },
},{
    timestamps: true,
});

const AgendaUCAD = mongoose.model("agendaUCAD", agendaUCADSchema);

module.exports = AgendaUCAD;