const multer = require('multer')

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
      cb(null, '')
    },
    filename: function (req, file, cb) {
      const extension = file.originalname.split('.').pop(); // Obtener la extensión original del archivo
      cb(null, `${file.fieldname}-${Date.now()}.${extension}`) // Usar la extensión original en el nombre del archivo
    }
  })

const uploadDocs = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1
  }
})

module.exports = uploadDocs