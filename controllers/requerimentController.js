const Requeriments = require('../models/requeriments')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')
const upLoadFiles = require('../s3')



const requerimentController = {

    createRequeriment: async (req, res) => {

        const clientAWS = new S3Client({
            region: process.env.AWS_BUCKET_REGION_VMCLASS,
            credentials: {
                accessKeyId: process.env.AWS_PUBLIC_KEY_VMCLASS,
                secretAccessKey: process.env.AWS_SECRET_KEY_VMCLASS,
            },
        })
        const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

        try {
            const {
                requerimentType,
                description,
                imgFirstVMClass,
                imgSecondVMClass,
                imgThirdVMClass,
                reqFieldOne,
                reqFieldTwo,
                reqFieldThree,
                reqFieldFour,
                reqFieldFive,
                reqFieldSix,
                price,
                currency,
                status  
            } = req.body

            const requeriment = new Requeriments({
                requerimentType,
                description,
                imgFirstVMClass,
                imgSecondVMClass,
                imgThirdVMClass,
                reqFieldOne,
                reqFieldTwo,
                reqFieldThree,
                reqFieldFour,
                reqFieldFive,
                reqFieldSix,
                price,
                currency,
                status
            });

            if (req.files && req.files['imgFirstVMClass']) {
                const fileContent = req.files['imgFirstVMClass'][0].buffer;
                const fileName = `${req.files['imgFirstVMClass'][0].fieldname}-${quizIdentifier()}.png`;
        
                const uploadFirst = {
                  Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
                  Key: fileName,
                  Body: fileContent,
                };
        
                const uploadCommand = new PutObjectCommand(uploadFirst);
                await clientAWS.send(uploadCommand);
        
                requeriment.imgFirstVMClass = fileName;
              }
              // Verificar si se cargó la imagen del campo imgSecondVMClass
              if (req.files && req.files['imgSecondVMClass']) {
                const fileContent = req.files['imgSecondVMClass'][0].buffer;
                const fileName = `${req.files['imgSecondVMClass'][0].fieldname}-${quizIdentifier()}.png`;
        
                const uploadSecond = {
                  Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
                  Key: fileName,
                  Body: fileContent,
                };
        
                const uploadCommand = new PutObjectCommand(uploadSecond);
                await clientAWS.send(uploadCommand);
        
                requeriment.imgSecondVMClass = fileName;
              }
              if (req.files && req.files['imgThirdVMClass']) {
                const fileContent = req.files['imgThirdVMClass'][0].buffer;
                const fileName = `${req.files['imgThirdVMClass'][0].fieldname}-${quizIdentifier()}.png`;
        
                const uploadThird = {
                  Bucket: process.env.AWS_BUCKET_NAME_VMCLASS,
                  Key: fileName,
                  Body: fileContent,
                };
        
                const uploadCommand = new PutObjectCommand(uploadThird);
                await clientAWS.send(uploadCommand);
        
                requeriment.imgThirdVMClass = fileName;
              }
        
            await requeriment.save()

            res.status(200).json({
                message: 'Requerimiento creado con éxito',
                success: true,
                response: requeriment
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Error al crear el requerimiento',
                success: false,
            });
        }
    },
    updateRequeriment: async (req, res) => {

        try {

            const { id } = req.params;
            const updatedRequeriment = await Requeriments.findByIdAndUpdate(id, req.body, { new: true })
            if (!updatedRequeriment) {
                return res.status(404).json({
                    message: "Requerimiento no encontrado",
                });
            }
            res.status(200).json({
                message: "Requerimiento actualizado",
                success: true,
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false,
            })

        }

    },
    deleteRequeriment: async (req, res) => {
        try {

            const { id } = req.body;
            const deletedRequeriment = await Requeriments.findByIdAndDelete(id)
            if (!deletedRequeriment) {
                return res.status(404).json({
                    message: "Requerimiento no encontrado",
                });
            }
            res.status(200).json({
                message: "Requerimiento eliminado",
                success: true,
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false,
            })

        }

    },
    getRequerimentById: async (req, res) => {

        const { id } = req.params;
        try {
            const requeriment = await Requeriments.findById(id)
            if (!requeriment) {
                return res.status(404).json({
                    message: "Requerimiento no encontrado",
                });
            }
            res.status(200).json({
                message: 'Requerimiento',
                response: requeriment,
                success: true,
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false,
            })
        }

    },
    getAllRequeriments: async (req, res) => {

        try {
            const requeriments = await Requeriments.find().sort({
                createdAt: -1,
            })
            if (requeriments) {
                res.status(200).json({
                    message: 'Requerimientos',
                    response: requeriments,
                    success: true,
                })
            } else {
                res.status(404).json({
                    message: 'No se encontraron requerimientos',
                    success: false,
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: error.message,
                success: false,
            })

        }



    }


}

module.exports = requerimentController;