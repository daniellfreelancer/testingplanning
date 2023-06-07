const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './storage/assets')
    },
    filename: function (req, file, cb) {
      const extension = file.originalname.split('.').pop(); // Obtener la extensión original del archivo
      cb(null, `${file.fieldname}-${Date.now()}.${extension}`) // Usar la extensión original en el nombre del archivo
    }
  })
  
const uploadDocs = multer({storage})

module.exports = uploadDocs