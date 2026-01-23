const mongoose = require('mongoose');

const imagenSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  nombre: {
    type: String
  },
  descripcion: {
    type: String
  },
  orden: {
    type: Number,
    default: 0
  },
  tamaño: {
    type: Number // bytes
  },
  ancho: {
    type: Number // pixels
  },
  alto: {
    type: Number // pixels
  }
}, {
  timestamps: true,
  _id: true
});

const albumSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    sparse: true // Permite valores null/undefined hasta que se genere
  },
  descripcion: {
    type: String,
    maxlength: 1000
  },
  publico: {
    type: Boolean,
    default: true
  },
  imagenes: [imagenSchema],

  // Imagen de portada (la primera por defecto)
  imagenPortada: {
    type: String // URL de la imagen de portada
  },

  // Organización
  orden: {
    type: Number,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  },

  // Metadatos
  fechaEvento: {
    type: Date
  },
  ubicacion: {
    type: String
  },
  etiquetas: [{
    type: String,
    trim: true
  }],

  // Estadísticas
  vistas: {
    type: Number,
    default: 0
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
albumSchema.index({ slug: 1 });
albumSchema.index({ publico: 1, activo: 1 });
albumSchema.index({ orden: 1 });
albumSchema.index({ createdAt: -1 });

// Generar slug automáticamente antes de validar
albumSchema.pre('validate', function(next) {
  if (!this.slug && this.nombre) {
    this.slug = this.nombre
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

// Actualizar imagen de portada automáticamente
albumSchema.pre('save', function(next) {
  if (this.imagenes && this.imagenes.length > 0 && !this.imagenPortada) {
    this.imagenPortada = this.imagenes[0].url;
  }
  next();
});

// Virtual para contar imágenes
albumSchema.virtual('totalImagenes').get(function() {
  return this.imagenes ? this.imagenes.length : 0;
});

// Método para obtener carpeta en S3
albumSchema.methods.getCarpetaS3 = function() {
  return `albumes/${this.slug}`;
};

// Método estático para generar slug único
albumSchema.statics.generateUniqueSlug = async function(nombre) {
  const baseSlug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;

  // Buscar si el slug ya existe
  while (await this.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

module.exports = mongoose.model('Album', albumSchema);
