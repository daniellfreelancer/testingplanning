const mongoose = require('mongoose');

const navItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  orden: {
    type: Number,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  },
  tipo: {
    type: String,
    enum: ['predefinido', 'personalizado'],
    default: 'personalizado'
  },
  icono: {
    type: String, // Nombre del icono de lucide-react
    default: null
  },
  descripcion: {
    type: String,
    default: ''
  },
  esExterno: {
    type: Boolean,
    default: false
  },
  abrirNuevaVentana: {
    type: Boolean,
    default: false
  },
  institucionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true
});

// Índices
navItemSchema.index({ orden: 1, activo: 1 });
navItemSchema.index({ institucionId: 1, activo: 1 });

module.exports = mongoose.model('NavItem', navItemSchema);
