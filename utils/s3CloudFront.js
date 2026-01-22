// utils/s3CloudFront.js
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const crypto = require('crypto');
const sharp = require('sharp');

const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const publicKey = process.env.AWS_PUBLIC_KEY;
const privateKey = process.env.AWS_SECRET_KEY;
const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN || process.env.AWS_ACCESS_CLOUD_FRONT;
const cloudFrontDistributionId = process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID;

// Cliente S3
const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
});

// Cliente CloudFront
const cloudFrontClient = new CloudFrontClient({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
});

/**
 * Genera un nombre único para el archivo con estructura de carpetas
 * Estructura: linkaws/{categoria}/{year}/{month}/{filename}
 * Ejemplo: linkaws/galeria/2025/01/1234567890-abc123.jpg
 */
function generateObjectKey(file, category = 'general') {
  // Soporte para express-fileupload y multer
  const filename = file.name || file.originalname || 'file';
  const extension = filename.split('.').pop().toLowerCase();
  const random = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Estructura de carpetas organizada
  return `linkaws/${category}/${year}/${month}/${timestamp}-${random}.${extension}`;
}

/**
 * Optimiza una imagen antes de subirla
 * @param {Buffer} buffer - Buffer de la imagen
 * @param {Object} options - Opciones de optimización
 * @returns {Promise<Buffer>} - Buffer optimizado
 */
async function optimizeImage(buffer, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'jpeg' // jpeg, webp, png
  } = options;

  try {
    let image = sharp(buffer);

    // Obtener metadata
    const metadata = await image.metadata();

    // Redimensionar si es necesario
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image = image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convertir y optimizar según formato
    switch (format) {
      case 'webp':
        image = image.webp({ quality });
        break;
      case 'png':
        image = image.png({ quality, compressionLevel: 9 });
        break;
      case 'jpeg':
      default:
        image = image.jpeg({ quality, mozjpeg: true });
        break;
    }

    return await image.toBuffer();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    return buffer; // Retornar original si falla
  }
}

/**
 * Sube un archivo a S3 y retorna la URL de CloudFront
 * @param {Object} file - Archivo de multer (req.file o req.files)
 * @param {Object} options - Opciones de subida
 * @returns {Promise<Object>} - { key, s3Url, cloudFrontUrl }
 */
async function uploadFile(file, options = {}) {
  if (!file) throw new Error('File is required');

  const {
    category = 'general', // Categoría para organizar en carpetas (galeria, noticias, eventos, etc)
    keyOverride = null, // Key personalizado
    optimize = false, // Optimizar imágenes
    optimizeOptions = {},
    makePublic = true, // ACL público
    cacheControl = 'max-age=31536000', // 1 año de cache
  } = options;

  // Generar key con categoría
  const key = keyOverride || generateObjectKey(file, category);

  // Soporte para express-fileupload y multer
  let fileBuffer;
  let contentType = file.mimetype;

  // Prioridad: tempFilePath (express-fileupload con useTempFiles), buffer (multer), data (express-fileupload sin useTempFiles)
  if (file.tempFilePath) {
    const fs = require('fs');
    fileBuffer = fs.readFileSync(file.tempFilePath);
  } else if (file.buffer) {
    fileBuffer = file.buffer;
  } else if (file.data) {
    fileBuffer = file.data;
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('No se pudo obtener el buffer del archivo o está vacío');
  }

  // Optimizar imagen si es necesario
  if (optimize && contentType && contentType.startsWith('image/') && fileBuffer && fileBuffer.length > 0) {
    fileBuffer = await optimizeImage(fileBuffer, optimizeOptions);
    // Si se especificó formato en optimización, actualizar contentType
    if (optimizeOptions.format === 'webp') {
      contentType = 'image/webp';
    } else if (optimizeOptions.format === 'png') {
      contentType = 'image/png';
    } else if (optimizeOptions.format === 'jpeg') {
      contentType = 'image/jpeg';
    }
  }

  // Parámetros de subida
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: cacheControl,
    // Nota: No usar ACL porque el bucket tiene ACLs deshabilitados
    // En su lugar, configurar el bucket con Bucket Policy para acceso público
  };

  // Subir a S3
  await s3Client.send(new PutObjectCommand(uploadParams));

  // Construir URLs
  const s3Url = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${key}`;
  const cloudFrontUrl = cloudFrontDomain
    ? `${cloudFrontDomain.replace(/\/$/, '')}/${key}`
    : s3Url;

  return {
    key,
    s3Url,
    cloudFrontUrl,
    url: cloudFrontUrl, // URL por defecto (CloudFront)
    size: fileBuffer.length,
    contentType,
  };
}

/**
 * Sube múltiples archivos
 * @param {Array} files - Array de archivos de multer
 * @param {Object} options - Opciones de subida
 * @returns {Promise<Array>} - Array de resultados
 */
async function uploadMultipleFiles(files, options = {}) {
  if (!files || files.length === 0) {
    throw new Error('Files array is required');
  }

  const uploadPromises = files.map(file => uploadFile(file, options));
  return await Promise.all(uploadPromises);
}

/**
 * Elimina un archivo de S3
 * @param {string} key - Key del archivo en S3
 * @returns {Promise<boolean>}
 */
async function deleteFile(key) {
  if (!key) throw new Error('Key is required');

  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(deleteParams));
  return true;
}

/**
 * Elimina múltiples archivos de S3
 * @param {Array<string>} keys - Array de keys
 * @returns {Promise<Array>}
 */
async function deleteMultipleFiles(keys) {
  if (!keys || keys.length === 0) {
    throw new Error('Keys array is required');
  }

  const deletePromises = keys.map(key => deleteFile(key));
  return await Promise.all(deletePromises);
}

/**
 * Invalida el cache de CloudFront para uno o más objetos
 * @param {Array<string>|string} paths - Paths a invalidar (ej: ['/imagen.jpg', '/folder/*'])
 * @returns {Promise<Object>}
 */
async function invalidateCloudFrontCache(paths) {
  if (!cloudFrontDistributionId) {
    console.warn('CloudFront Distribution ID no configurado. Saltando invalidación.');
    return null;
  }

  // Convertir a array si es string
  const pathsArray = Array.isArray(paths) ? paths : [paths];

  // Agregar / al inicio si no lo tiene
  const formattedPaths = pathsArray.map(path =>
    path.startsWith('/') ? path : `/${path}`
  );

  const invalidationParams = {
    DistributionId: cloudFrontDistributionId,
    InvalidationBatch: {
      CallerReference: `invalidation-${Date.now()}`,
      Paths: {
        Quantity: formattedPaths.length,
        Items: formattedPaths,
      },
    },
  };

  const response = await cloudFrontClient.send(
    new CreateInvalidationCommand(invalidationParams)
  );

  return response.Invalidation;
}

/**
 * Extrae el key de S3 desde una URL completa
 * @param {string} url - URL completa (S3 o CloudFront)
 * @returns {string} - Key del archivo
 */
function extractKeyFromUrl(url) {
  if (!url) return null;

  try {
    // Si es URL de CloudFront
    if (url.includes('cloudfront.net')) {
      const parts = url.split('.cloudfront.net/');
      return parts[1] || null;
    }

    // Si es URL de S3
    if (url.includes('.s3.')) {
      const parts = url.split('.amazonaws.com/');
      return parts[1] || null;
    }

    // Si ya es solo el key
    return url;
  } catch (error) {
    console.error('Error extrayendo key de URL:', error);
    return null;
  }
}

/**
 * Convierte una URL de S3 a URL de CloudFront
 * @param {string} s3Url - URL de S3
 * @returns {string} - URL de CloudFront
 */
function convertToCloudFrontUrl(s3Url) {
  if (!s3Url || !cloudFrontDomain) return s3Url;

  const key = extractKeyFromUrl(s3Url);
  if (!key) return s3Url;

  return `${cloudFrontDomain.replace(/\/$/, '')}/${key}`;
}

/**
 * Genera thumbnails de una imagen
 * @param {Object} file - Archivo de multer
 * @param {Array} sizes - Array de tamaños [{width, height, suffix}]
 * @returns {Promise<Array>} - Array de resultados de subida
 */
async function generateThumbnails(file, sizes = []) {
  if (!file || !file.mimetype.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const defaultSizes = [
    { width: 150, height: 150, suffix: 'thumb' },
    { width: 400, height: 400, suffix: 'small' },
    { width: 800, height: 800, suffix: 'medium' },
  ];

  const thumbnailSizes = sizes.length > 0 ? sizes : defaultSizes;
  const filename = file.name || file.originalname || 'image.jpg';
  const baseName = filename.split('.')[0];
  const extension = filename.split('.').pop();
  const fileBuffer = file.data || file.buffer;

  const thumbnailPromises = thumbnailSizes.map(async (size) => {
    const resizedBuffer = await sharp(fileBuffer)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    const thumbnailFile = {
      buffer: resizedBuffer,
      originalname: `${baseName}-${size.suffix}.${extension}`,
      mimetype: 'image/jpeg',
    };

    return uploadFile(thumbnailFile, {
      category: 'thumbnails',
      optimize: false, // Ya está optimizado
    });
  });

  return await Promise.all(thumbnailPromises);
}

module.exports = {
  s3Client,
  cloudFrontClient,
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  invalidateCloudFrontCache,
  extractKeyFromUrl,
  convertToCloudFrontUrl,
  generateThumbnails,
  optimizeImage,
};
