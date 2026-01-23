// controllers/mediaController.example.js
// Ejemplo de cómo usar el nuevo sistema S3 + CloudFront

const {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  invalidateCloudFrontCache,
  convertToCloudFrontUrl,
  generateThumbnails,
} = require('../utils/s3CloudFront');

/**
 * Ejemplo 1: Subir una imagen con optimización
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó imagen',
      });
    }

    // Subir imagen optimizada a S3 y obtener URL de CloudFront
    // Se guardará en: linkaws/eventos/2025/01/timestamp-random.jpg
    const result = await uploadFile(req.files.image, {
      category: 'eventos', // Categoría para organizar en carpetas
      optimize: true, // Optimizar imagen
      optimizeOptions: {
        maxWidth: 1920,
        quality: 85,
        format: 'jpeg',
      },
      cacheControl: 'max-age=31536000', // Cache 1 año
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.cloudFrontUrl, // URL de CloudFront
        key: result.key,
        size: result.size,
      },
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Ejemplo 2: Subir múltiples imágenes para una galería
 */
exports.uploadGallery = async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron imágenes',
      });
    }

    const images = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    // Subir todas las imágenes en paralelo
    // Se guardarán en: linkaws/galeria/2025/01/timestamp-random.jpg
    const results = await uploadMultipleFiles(images, {
      category: 'galeria',
      optimize: true,
      optimizeOptions: {
        maxWidth: 1920,
        quality: 80,
      },
    });

    res.status(200).json({
      success: true,
      data: results.map(r => ({
        url: r.cloudFrontUrl,
        key: r.key,
      })),
    });
  } catch (error) {
    console.error('Error subiendo galería:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Ejemplo 3: Subir imagen con thumbnails
 */
exports.uploadWithThumbnails = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó imagen',
      });
    }

    // Subir imagen original
    // Se guardará en: linkaws/noticias/2025/01/timestamp-random.jpg
    const original = await uploadFile(req.files.image, {
      category: 'noticias',
      optimize: true,
    });

    // Generar y subir thumbnails
    const thumbnails = await generateThumbnails(req.files.image, [
      { width: 150, height: 150, suffix: 'thumb' },
      { width: 400, height: 400, suffix: 'small' },
      { width: 800, height: 800, suffix: 'medium' },
    ]);

    res.status(200).json({
      success: true,
      data: {
        original: original.cloudFrontUrl,
        thumbnails: {
          thumb: thumbnails[0].cloudFrontUrl,
          small: thumbnails[1].cloudFrontUrl,
          medium: thumbnails[2].cloudFrontUrl,
        },
      },
    });
  } catch (error) {
    console.error('Error subiendo imagen con thumbnails:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Ejemplo 4: Subir documento (PDF, DOCX)
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó documento',
      });
    }

    // Se guardará en: linkaws/documentos/2025/01/timestamp-random.pdf
    const result = await uploadFile(req.files.document, {
      category: 'documentos',
      optimize: false, // No optimizar documentos
      cacheControl: 'max-age=86400', // Cache 1 día
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.cloudFrontUrl,
        key: result.key,
      },
    });
  } catch (error) {
    console.error('Error subiendo documento:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Ejemplo 5: Eliminar archivo e invalidar cache de CloudFront
 */
exports.deleteImage = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Key es requerido',
      });
    }

    // Eliminar de S3
    await deleteFile(key);

    // Invalidar cache de CloudFront (opcional pero recomendado)
    await invalidateCloudFrontCache([`/${key}`]);

    res.status(200).json({
      success: true,
      message: 'Archivo eliminado correctamente',
    });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Ejemplo 6: Actualizar imagen (eliminar antigua y subir nueva)
 */
exports.updateImage = async (req, res) => {
  try {
    const { oldKey } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó imagen nueva',
      });
    }

    // Subir nueva imagen
    const newImage = await uploadFile(req.files.image, {
      category: 'imagenes',
      optimize: true,
    });

    // Eliminar imagen antigua si existe
    if (oldKey) {
      try {
        await deleteFile(oldKey);
        await invalidateCloudFrontCache([`/${oldKey}`]);
      } catch (error) {
        console.error('Error eliminando imagen antigua:', error);
        // Continuar aunque falle la eliminación
      }
    }

    res.status(200).json({
      success: true,
      data: {
        url: newImage.cloudFrontUrl,
        key: newImage.key,
      },
    });
  } catch (error) {
    console.error('Error actualizando imagen:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Ejemplo 7: Migrar URL de S3 a CloudFront
 */
exports.migrateUrl = async (req, res) => {
  try {
    const { s3Url } = req.body;

    if (!s3Url) {
      return res.status(400).json({
        success: false,
        error: 'S3 URL es requerida',
      });
    }

    const cloudFrontUrl = convertToCloudFrontUrl(s3Url);

    res.status(200).json({
      success: true,
      data: {
        oldUrl: s3Url,
        newUrl: cloudFrontUrl,
      },
    });
  } catch (error) {
    console.error('Error migrando URL:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Ejemplo 8: Uso en modelo de Mongoose
 */
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  titulo: String,
  contenido: String,
  imagenDestacada: String, // URL de CloudFront
  imagenKey: String, // Key en S3 (para eliminar después)
  imagenes: [{
    url: String, // URL de CloudFront
    key: String, // Key en S3
    thumbnails: {
      thumb: String,
      small: String,
      medium: String,
    },
  }],
  createdAt: { type: Date, default: Date.now },
});

// Middleware pre-remove para limpiar archivos de S3
PostSchema.pre('remove', async function(next) {
  try {
    const keysToDelete = [];

    // Agregar imagen destacada
    if (this.imagenKey) {
      keysToDelete.push(this.imagenKey);
    }

    // Agregar todas las imágenes de la galería
    if (this.imagenes && this.imagenes.length > 0) {
      this.imagenes.forEach(img => {
        if (img.key) keysToDelete.push(img.key);
      });
    }

    // Eliminar todos los archivos
    if (keysToDelete.length > 0) {
      const { deleteMultipleFiles, invalidateCloudFrontCache } = require('../utils/s3CloudFront');
      await deleteMultipleFiles(keysToDelete);
      await invalidateCloudFrontCache(keysToDelete.map(k => `/${k}`));
    }

    next();
  } catch (error) {
    console.error('Error limpiando archivos de S3:', error);
    next(); // Continuar aunque falle
  }
});

// const Post = mongoose.model('Post', PostSchema);

module.exports = {
  uploadImage,
  uploadGallery,
  uploadWithThumbnails,
  uploadDocument,
  deleteImage,
  updateImage,
  migrateUrl,
};
