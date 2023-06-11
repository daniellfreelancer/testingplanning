const multer = require('multer');

const {S3Client , PutObjectCommand} = require('@aws-sdk/client-s3')

// Configurar el cliente de AWS S3
const s3Client = new S3Client({
  accessKeyId: process.env.AWS_PUBLIC_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

// Configurar el almacenamiento en AWS S3
const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, '');
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Verificar el tipo de archivo permitido (opcional)
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no válido. Solo se permiten archivos PDF y DOCX.'), false);
    }
  },
});

// Middleware para subir el archivo a S3 y adjuntarlo a la solicitud
const uploadToS3 = (req, res, next) => {
  if (!req.file) {
    next();
    return;
  }

  const fileContent = req.file.buffer;
  const fileName = `${req.file.fieldname}-${Date.now()}-${req.file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
  };

  s3Client.upload(params, function (err, data) {
    if (err) {
      next(err);
    } else {
      req.file.s3Key = data.Key; // Guardar la clave de S3 del archivo adjunto
      next();
    }
  });
};

module.exports = { upload, uploadToS3 };
