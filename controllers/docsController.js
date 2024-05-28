const User = require('../models/admin')
const crypto = require('crypto')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const clientAWS = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: publicKey,
        secretAccessKey: privateKey,
    },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

const docsController = {
    idFrontUpload: async (req, res) => {
        const { id } = req.params
        try {
            let user = await User.findByIdAndUpdate(id)
            if (user && req.file) {

                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: fileName,
                    Body: fileContent,
                };

                // Subir el archivo a S3
                const uploadCommand = new PutObjectCommand(uploadParams);
                await clientAWS.send(uploadCommand);
                user.idFront = fileName
                await user.save()

                res.status(200).json({
                    message: 'Archivo cargado con exito',
                    success: true,
                });

            } else {
                res.status(400).json({
                    message: 'No se pudo cargar el archivo',
                    success: false,
                });
            }
        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: 'Error al cargar el archivo',
                success: false,
            });
        }
    },
    idBackUpload: async (req, res) => {
        const { id } = req.params
        try {

            let user = await User.findByIdAndUpdate(id)

            if (user && req.file) {
                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: fileName,
                    Body: fileContent,
                };

                // Subir el archivo a S3
                const uploadCommand = new PutObjectCommand(uploadParams);
                await clientAWS.send(uploadCommand);
                user.idBack = fileName

                await user.save()

                res.status(200).json({
                    message: 'Archivo cargado con exito',
                    success: true,
                });

            } else {
                res.status(400).json({
                    message: 'No se pudo cargar el archivo',
                    success: false,
                });
            }
        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: 'Error al cargar el archivo',
                success: false,
            });

        }


    },
    backgroundUpload: async (req, res) => {
        const { id } = req.params;
        try {

            let user = await User.findByIdAndUpdate(id)

            if (user && req.file) {

                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: fileName,
                    Body: fileContent,
                };

                // Subir el archivo a S3
                const uploadCommand = new PutObjectCommand(uploadParams);
                await clientAWS.send(uploadCommand);

                user.backgroundDoc = fileName

                await user.save()
                res.status(200).json({
                    message: 'Archivo cargado con exito',
                    success: true,
                });

            } else {
                res.status(400).json({
                    message: 'No se pudo cargar el archivo',
                    success: false,
                });
            }
        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: 'Error al cargar el archivo',
                success: false,
            });

        }
    },
    otherDocsUpload: async (req, res) => {
        const { id } = req.params;
        try {

            let user = await User.findByIdAndUpdate(id)

            if (user && req.file) {

                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

                const uploadParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: fileName,
                    Body: fileContent,
                };

                // Subir el archivo a S3
                const uploadCommand = new PutObjectCommand(uploadParams);
                await clientAWS.send(uploadCommand);

                user.otherDocs = fileName

                await user.save()
                res.status(200).json({
                    message: 'Archivo cargado con exito',
                    success: true,
                });

            } else {
                res.status(400).json({
                    message: 'No se pudo cargar el archivo',
                    success: false,
                });
            }
        } catch (error) {

            console.log(error)
            res.status(500).json({
                message: 'Error al cargar el archivo',
                success: false,
            });

        }
    },
}

module.exports = docsController;