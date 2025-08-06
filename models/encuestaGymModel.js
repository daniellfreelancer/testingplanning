const mongoose = require('mongoose');

const preguntaSchema = {
  titulo: String,
  valoracion: Number
};

const encuestaSchema = new mongoose.Schema({
  idInterno: String,
  institucion: { type: mongoose.Schema.Types.ObjectId, ref: 'Institucion' },
  complejos: { type: mongoose.Schema.Types.ObjectId, ref: 'Complejo' },
  creadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'UsuarioComplejo' },
  respondidaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'UsuarioComplejo' },
  respondida: { type: Boolean, default: false },
  pregunta1: { type: preguntaSchema, required: false },
  pregunta2: { type: preguntaSchema, required: false },
  pregunta3: { type: preguntaSchema, required: false },
  pregunta4: { type: preguntaSchema, required: false },
  pregunta5: { type: preguntaSchema, required: false },
  pregunta6: { type: preguntaSchema, required: false },
  pregunta7: { type: preguntaSchema, required: false },
  pregunta8: { type: preguntaSchema, required: false },
  pregunta9: { type: preguntaSchema, required: false },
  pregunta10: { type: preguntaSchema, required: false },
}, { timestamps: true });

module.exports = mongoose.model('EncuestaGym', encuestaSchema);
