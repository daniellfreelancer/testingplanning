
const {S3Client , PutObjectCommand} = require('@aws-sdk/client-s3')
const fs = require('fs')

const AWS_BUCKET_NAME =  process.env.AWS_BUCKET_NAME
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION
const AWS_PUBLIC_KEY = process.env.AWS_PUBLIC_KEY
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY

const  clientAWS = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_PUBLIC_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  })

async function uploadFile(file){

    const upLoadFile = fs.createReadStream(file.pathFile)


    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'fileName',
        Body: upLoadFile,
      };
    const command = new PutObjectCommand(uploadParams)

    return await clientAWS.send(command)
}

module.exports = {
    uploadFile
}