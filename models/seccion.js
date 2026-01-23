const mongoose = require('mongoose');

const archivoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  url: { type: String, required: true },
  key: { type: String, required: true },
  tipo: { type: String }, // pdf, imagen, documento, etc.
  tamaño: { type: Number }, // en bytes
  descripcion: { type: String }
}, { _id: true });

const seccionSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  ocultarTitulo: {
    type: Boolean,
    default: false
  },
  contenido: {
    type: String, // HTML del editor rich text
    default: ''
  },
  resumen: {
    type: String,
    maxlength: 500
  },
  imagenDestacada: {
    url: String,
    key: String
  },
  archivos: [archivoSchema],

  // Jerarquía
  parentSeccion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seccion',
    default: null
  },

  // Ordenamiento y visualización
  orden: {
    type: Number,
    default: 0
  },
  visibilidad: {
    type: String,
    enum: ['publica', 'privada'],
    default: 'publica'
  },
  activo: {
    type: Boolean,
    default: true
  },

  // Configuración adicional
  mostrarEnNavegacion: {
    type: Boolean,
    default: true
  },
  icono: {
    type: String,
    default: null
  },
  colorDestacado: {
    type: String,
    default: null
  },

  // Metadatos SEO
  metaDescripcion: {
    type: String,
    maxlength: 160
  },
  metaKeywords: {
    type: [String]
  },

  // Auditoría
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices
seccionSchema.index({ slug: 1 });
seccionSchema.index({ orden: 1 });
seccionSchema.index({ parentSeccion: 1 });
seccionSchema.index({ activo: 1, visibilidad: 1 });

// Generar slug automáticamente si no existe
seccionSchema.pre('save', function(next) {
  if (!this.slug && this.titulo) {
    this.slug = this.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Método para obtener ruta completa (breadcrumb)
seccionSchema.methods.getRutaCompleta = async function() {
  const ruta = [{ titulo: this.titulo, slug: this.slug }];
  let parent = this.parentSeccion;

  while (parent) {
    const seccionPadre = await this.model('Seccion').findById(parent);
    if (!seccionPadre) break;
    ruta.unshift({ titulo: seccionPadre.titulo, slug: seccionPadre.slug });
    parent = seccionPadre.parentSeccion;
  }

  return ruta;
};

// Método estático para obtener subsecciones
seccionSchema.statics.getSubsecciones = async function(seccionId) {
  return this.find({
    parentSeccion: seccionId,
    activo: true
  }).sort({ orden: 1 });
};

module.exports = mongoose.model('Seccion', seccionSchema);
