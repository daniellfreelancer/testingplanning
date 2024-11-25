const Clubs = require('../models/club')
const Categories = require('../models/sportCategory')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')
const Trainers = require('../models/admin')
const Players = require('../models/student')

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
  

  const sportCategoryController = {

    createCategory : async ( req, res) => {

        const {clubId} = req.params;

        try {

            let sportCategory = new Categories(req.body)

            if ( sportCategory) {
                const club = await Clubs.findById(clubId)


                if (!club) {
                    return res.status(404).json({
                        message: 'Club no encontrado',
                        success: false
                    });
                }
                club.categories.push(sportCategory._id)

                await club.save()

                sportCategory.club =clubId;
                await sportCategory.save()
                res.status(201).json({
                    message: "Categoría deportiva creada correctamente",
                    success: true,
                    sportCategory
                });

            } else {
                res.status(400).json({
                    message: "Error al crear categoría deportiva",
                    success: false
                });
            }
            
        } catch (error) {
            console.log(error)
            res.status(400).json({
                message: error.message,
                success: false
            });
            
        }

    }

  }

  module.exports = sportCategoryController;