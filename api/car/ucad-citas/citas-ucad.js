const mongoose = require("mongoose");

const citasUcadSchema = new mongoose.Schema({
  deportista: {
    type: mongoose.Types.ObjectId,
    ref: 'usuariosUcad',
    required: false // no requerido para citas internas
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
  },
  inicioAtencion:{
    type: Date,
  },
  finAtencion:{
    type: Date,
  },
  tiempoAtencion:{
    type: Number,
  },
  // Sobre cupo: permite agendar en un horario ya ocupado por otra cita
  sobreCupo: {
    type: Boolean,
    default: false,
  },
  motivoSobreCupo: {
    type: String,
    maxlength: 500,
  },
  // Atención múltiple (mesa de trabajo)
  atencionMultiple: {
    type: Boolean,
    default: false,
  },
  cantidadAtendidos: {
    type: Number,
    min: 1,
    max: 10,
  },
  // Citas internas (para bloqueos de reunión, almuerzo, etc.)
  esCitaInterna: {
    type: Boolean,
    default: false,
  },
  motivoBloqueo: {
    type: String,
    enum: ['Reunión', 'Almuerzo', 'Personal', 'Otro'],
  },
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

