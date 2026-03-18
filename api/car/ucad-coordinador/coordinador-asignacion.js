const mongoose = require("mongoose");

const coordinadorAsignacionSchema = new mongoose.Schema({
  coordinador: {
    type: mongoose.Types.ObjectId,
    ref: 'usuariosUcad',
    required: true
  },
  profesionales: [{
    type: mongoose.Types.ObjectId,
    ref: 'usuariosUcad'
  }],
  especialidades: [{
    type: String
  }], // ['Medicina del Deporte', 'Kinesiología', 'Nutrición', etc.]
  criterioAsignacion: {
    type: String,
    enum: ['especialidad', 'manual', 'mixto'],
    default: 'manual'
  },
  asignadoPor: {
    type: mongoose.Types.ObjectId,
    ref: 'usuariosUcad'
  }, // Admin o auto-asignado por coordinador
  fechaAsignacion: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  },
  notas: {
    type: String
  }, // Notas adicionales sobre la asignación
},{
    timestamps: true,
});

// Índices para búsquedas rápidas
coordinadorAsignacionSchema.index({ coordinador: 1 });
coordinadorAsignacionSchema.index({ profesionales: 1 });
coordinadorAsignacionSchema.index({ especialidades: 1 });

const CoordinadorAsignacion = mongoose.model("coordinadorAsignacion", coordinadorAsignacionSchema);

module.exports = CoordinadorAsignacion;
