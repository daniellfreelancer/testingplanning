// utils/s3Client.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const bucketRegion = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const publicKey = process.env.AWS_PUBLIC_KEY;
const privateKey = process.env.AWS_SECRET_KEY;

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
});

// genera un nombre de archivo
function generateObjectKey(file) {
  const extension = file.originalname.split('.').pop();
  const random = crypto.randomBytes(32).toString('hex');
  return `${file.fieldname}-${random}.${extension}`;
}

//Sube un archivo de multer (req.file) a S3 y devuelve el "key" que que se guarda en la DB.

async function uploadMulterFile(file, keyOverride) {
  if (!file) throw new Error('File is required');

  const key = keyOverride || generateObjectKey(file);

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return key;
}

// Devuelve una URL firmada para leer un objeto (bucket privado).
async function getSignedUrlForKey(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

module.exports = {
  s3Client,
  uploadMulterFile,
  getSignedUrlForKey,
};
