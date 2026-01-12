const mongoose = require("mongoose");

const agendaUcadNSchema = new mongoose.Schema({
  profesional: { type: mongoose.Types.ObjectId, ref: 'usuariosUcad' },
  dias: { type: Array },
  horaInicio: { type: String },
  horaFin: { type: String },
  status: { type: Boolean, default: true },
},{
    timestamps: true,
});

const AgendaUCADN = mongoose.model("agendaUCADN", agendaUcadNSchema);

module.exports = AgendaUCADN;