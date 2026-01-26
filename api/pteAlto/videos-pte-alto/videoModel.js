const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    maxlength: 500
  },
  urlYoutube: {
    type: String,
    required: true,
    trim: true
  },
  youtubeId: {
    type: String,
    trim: true
  },
  miniatura: {
    type: String // URL de la miniatura de YouTube
  },
  duracion: {
    type: String // Formato: "3:45"
  },
  categoria: {
    type: String,
    enum: ['deportes', 'eventos', 'talleres', 'noticias', 'institucional', 'otros'],
    default: 'deportes'
  },
  destacado: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  },
  orden: {
    type: Number,
    default: 0
  },
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
videoSchema.index({ activo: 1, destacado: -1 });
videoSchema.index({ categoria: 1 });
videoSchema.index({ orden: 1 });
videoSchema.index({ createdAt: -1 });

// Método para extraer el ID de YouTube de la URL
videoSchema.statics.extractYoutubeId = function(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Pre-save: Extraer youtubeId y generar miniatura
videoSchema.pre('save', function(next) {
  if (this.isModified('urlYoutube')) {
    const youtubeId = this.constructor.extractYoutubeId(this.urlYoutube);
    if (youtubeId) {
      this.youtubeId = youtubeId;
      this.miniatura = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    } else {
      return next(new Error('URL de YouTube inválida'));
    }
  }
  next();
});

module.exports = mongoose.model('Video', videoSchema);