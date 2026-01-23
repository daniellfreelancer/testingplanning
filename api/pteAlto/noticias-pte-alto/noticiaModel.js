const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  resumen: {
    type: String,
    trim: true
  },
  contenido: {
    type: String, // Cuerpo de la noticia (HTML)
    required: true
  },
  imagenPrincipal: {
    url: String, // URL de CloudFront
    key: String  // Key en S3 para eliminar
  },
  imagenes: [{
    url: String,
    key: String,
    descripcion: String
  }],
  categoria: {
    type: String,
    enum: ['deportes', 'eventos', 'institucional', 'logros', 'comunidad', 'otro'],
    default: 'otro'
  },
  estado: {
    type: String,
    enum: ['borrador', 'publicada', 'archivada'],
    default: 'borrador'
  },
  destacada: {
    type: Boolean,
    default: false
  },
  publicada: {
    type: Boolean,
    default: false
  },
  fechaPublicacion: {
    type: Date,
    default: Date.now
  },
  urlExterna: {
    type: String,
    trim: true
  },
  redirigirExterna: {
    type: Boolean,
    default: false
  },
  notificarUsuarios: {
    type: Boolean,
    default: false
  },
  vistas: {
    type: Number,
    default: 0
  },
  orden: {
    type: Number,
    default: 0
  },
  institucionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  metaTags: {
    description: String,
    keywords: [String],
    ogImage: String
  }
}, {
  timestamps: true
});

// Índices
noticiaSchema.index({ slug: 1 });
noticiaSchema.index({ institucionId: 1, estado: 1 });
noticiaSchema.index({ destacada: 1, fechaPublicacion: -1 });
noticiaSchema.index({ createdAt: -1 });

// Método para generar slug único
noticiaSchema.statics.generateUniqueSlug = async function(titulo, noticiaId = null) {
  const baseSlug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .trim();

  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const query = { slug };
    if (noticiaId) {
      query._id = { $ne: noticiaId };
    }

    const found = await this.findOne(query);

    if (!found) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
};

// Método para incrementar vistas
noticiaSchema.methods.incrementViews = function() {
  this.vistas += 1;
  return this.save();
};

// Virtual para URL completa
noticiaSchema.virtual('urlCompleta').get(function() {
  return `/noticias/${this.slug}`;
});

// Middleware pre-remove para limpiar archivos de S3
noticiaSchema.pre('remove', async function(next) {
  try {
    const { deleteMultipleFiles, invalidateCloudFrontCache } = require('../utils/s3CloudFront');
    const keysToDelete = [];

    // Agregar imagen principal
    if (this.imagenPrincipal?.key) {
      keysToDelete.push(this.imagenPrincipal.key);
    }

    // Agregar imágenes adicionales
    if (this.imagenes && this.imagenes.length > 0) {
      this.imagenes.forEach(img => {
        if (img.key) keysToDelete.push(img.key);
      });
    }

    // Eliminar archivos de S3 y CloudFront
    if (keysToDelete.length > 0) {
      await deleteMultipleFiles(keysToDelete);
      await invalidateCloudFrontCache(keysToDelete.map(k => `/${k}`));
    }

    next();
  } catch (error) {
    console.error('Error limpiando archivos de S3:', error);
    next(); // Continuar aunque falle
  }
});

module.exports = mongoose.model('Noticia', noticiaSchema);
