const mongoose = require("mongoose");

const reservasSchema = new mongoose.Schema({
  usuario: { type: mongoose.Types.ObjectId, ref: 'usuario' },
  taller: { type: mongoose.Types.ObjectId, ref: 'talleres' },
  espacioDeportivo: { type: mongoose.Types.ObjectId, ref: 'espacioDeportivo' },
  status: { type: Boolean },
  dia: { type: String },
  hora: { type: String },
  mes: { type: String },
  anio: { type: String },

},{
    timestamps: true
});

const Reservas = mongoose.model("reserva", reservasSchema);

module.exports = Reservas;