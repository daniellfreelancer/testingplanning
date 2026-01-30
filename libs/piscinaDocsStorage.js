const multer = require('multer')

/**
 * Middleware de multer específico para Piscina Santiago
 * Permite subir múltiples archivos: cédula frontal, cédula reverso y firma
 */
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
      cb(null, '')
    },
    filename: function (req, file, cb) {
      const extension = file.originalname.split('.').pop(); // Obtener la extensión original del archivo
      cb(null, `${file.fieldname}-${Date.now()}.${extension}`) // Usar la extensión original en el nombre del archivo
    }
  })

const uploadPiscinaDocs = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 3 // Máximo 3 archivos: fotoCedulaFrontal, fotoCedulaReverso, firma
  }
})

module.exports = uploadPiscinaDocs
