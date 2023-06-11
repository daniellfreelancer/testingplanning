const multer = require('multer')

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, './storage/assets')
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.png`)
  }
})

const upload = multer({ storage })

module.exports = upload