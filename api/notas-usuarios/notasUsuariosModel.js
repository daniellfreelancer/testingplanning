const mongoose = require("mongoose");

const notasUsuariosSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Types.ObjectId,
    ref: 'usuariosComplejos',
    required: true
  },
  texto: {
    type: String,
    required: true,
    maxlength: 500
  },
  creadoPor: {
    type: mongoose.Types.ObjectId,
    ref: 'usuariosComplejos',
    required: true
  },
  nombreCreador: {
    type: String,
    required: true
  },
  institucion: {
    type: mongoose.Types.ObjectId,
    ref: 'institucion'
  }
}, {
  timestamps: true
});

// Índice para optimizar búsquedas por usuario
notasUsuariosSchema.index({ usuario: 1, createdAt: -1 });

const NotasUsuarios = mongoose.model("notasUsuarios", notasUsuariosSchema);

module.exports = NotasUsuarios;
