const mongoose = require("mongoose");

const citasUcadSchema = new mongoose.Schema({
  deportista: { 
    type: mongoose.Types.ObjectId, 
    ref: 'usuariosUcad',
    required: true
  },
  profesional: { 
    type: mongoose.Types.ObjectId, 
    ref: 'usuariosUcad',
    required: true
  },
  especialidad: { 
    type: String, 
    required: true,
   // enum: ['Nutrición Deportiva', 'Medicina del Deporte', 'Psicología del Deporte']
  },
  tipoCita: { 
    type: String, 
    required: true,
    enum: ['consulta', 'emergencia', 'derivacion']
  },
  fecha: { 
    type: Date, 
    required: true
  },
  duracion: { 
    type: Number, 
    default: 30, // minutos
    min: 30,
    max: 120
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'confirmada', 'completada', 'cancelada','derivada'],
    default: 'pendiente'
  },
  notas: { 
    type: String,
    maxlength: 500
  },
  motivoCancelacion: { 
    type: String,
    maxlength: 200
  },
  canceladoPor: {
    type: String,
    enum: ['deportista', 'profesional', 'admin']
  },
  derivadaPor:{
    type: mongoose.Types.ObjectId, 
    ref: 'usuariosUcad',
  },
  motivoDerivacion:{
    type: String,
  }
}, {
  timestamps: true,
});

// Índices para mejorar performance
citasUcadSchema.index({ profesional: 1, fecha: 1 });
citasUcadSchema.index({ deportista: 1, fecha: 1 });
citasUcadSchema.index({ estado: 1 });
citasUcadSchema.index({ fecha: 1, estado: 1 });

// Validación: No permitir citas en el pasado
// citasUcadSchema.pre('save', function(next) {
//   if (this.fecha && this.fecha < new Date()) {
//     return next(new Error('No se pueden crear citas en el pasado'));
//   }
//   next();
// });

const CitasUcad = mongoose.model("citasUcad", citasUcadSchema);

module.exports = CitasUcad;

