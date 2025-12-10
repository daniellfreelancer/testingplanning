// utils/s3ClientVmclass.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const bucketRegion = process.env.AWS_BUCKET_REGION_VMCLASS;
const bucketName = process.env.AWS_BUCKET_NAME_VMCLASS;
const publicKey = process.env.AWS_PUBLIC_KEY_VMCLASS;
const privateKey = process.env.AWS_SECRET_KEY_VMCLASS;

const s3ClientVmclass = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
});

// genera un nombre único de archivo
function generateObjectKey(file) {
  const extension = file.originalname.split('.').pop();
  const random = crypto.randomBytes(32).toString('hex');
  return `${file.fieldname}-${random}.${extension}`;
}

// Sube un archivo (multer) a S3 VMCLASS y devuelve el key
async function uploadMulterFileVmclass(file, keyOverride) {
  if (!file) throw new Error('File is required');

  const key = keyOverride || generateObjectKey(file);

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3ClientVmclass.send(new PutObjectCommand(uploadParams));
  return key;
}

// Devuelve una URL firmada para leer un objeto
async function getSignedUrlForKeyVmclass(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const url = await getSignedUrl(s3ClientVmclass, command, { expiresIn });
  return url;
}

module.exports = {
  s3ClientVmclass,
  uploadMulterFileVmclass,
  getSignedUrlForKeyVmclass,
};
