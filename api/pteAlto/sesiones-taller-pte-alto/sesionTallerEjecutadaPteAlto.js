const mongoose = require('mongoose');

const asistenciaItemSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto', required: true },
    presente: { type: Boolean, required: true },
  },
  { _id: false }
);

const geoSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    accuracy: { type: Number },
    capturadaEn: { type: Date },
  },
  { _id: false }
);

const sesionTallerEjecutadaPteAltoSchema = new mongoose.Schema(
  {
    tallerId: { type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto', required: true, index: true },
    creadoPor: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto', required: true },
    fechaHoraInicio: { type: Date, required: true },
    fechaHoraFin: { type: Date, required: true },
    asistencias: { type: [asistenciaItemSchema], default: [] },
    geo: geoSchema,
  },
  { timestamps: true }
);

const SesionTallerEjecutadaPteAlto = mongoose.model(
  'sesionTallerEjecutadaPteAlto',
  sesionTallerEjecutadaPteAltoSchema
);

module.exports = SesionTallerEjecutadaPteAlto;
