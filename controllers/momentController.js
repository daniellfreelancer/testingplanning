const Moments = require('../models/moments')
const { S3Client, PutObjectCommand, PutObjectRetentionCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')
const sharp = require('sharp');

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

const momentscontroller = {
    addMoment: async (req, res) => {
        
        try {
          if (!req.file) {
            return res.status(400).json({ message: 'Sin imagen cargada' });
          }

         const optimizedImage = await sharp(req.file.buffer).toBuffer();
          const extension = req.file.originalname.split('.').pop();
          const fileName = `moment-image-${quizIdentifier()}.${extension}`;
    
          const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: optimizedImage,
          };
    
          // Subir la imagen a S3
          const uploadCommand = new PutObjectCommand(uploadParams);
          await clientAWS.send(uploadCommand);
    
          const {user} = req.body; // Asegúrate de que el cliente proporcione el ID de usuario
    
          const newMoment = new Moments({
            user: user,
            momentImg: fileName,
          });
    
          // Guardar el momento en la base de datos
          await newMoment.save();
    
           // Buscar momentos del usuario creados hace 7 días o más y eliminarlos
           const sevenDaysAgo = new Date();
           sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

           const oldMoments = await Moments.find({
               user: user,
               createdAt: { $lte: sevenDaysAgo },
           });

           for (const oldMoment of oldMoments) {
               // Eliminar imagen de S3
               const deleteParams = {
                   Bucket: bucketName,
                   Key: oldMoment.momentImg,
               };

               await clientAWS.send(new DeleteObjectCommand(deleteParams));

               // Eliminar el momento de la base de datos
               await Moments.findByIdAndDelete(oldMoment._id);
           }
    
          return res.status(201).json({ message: 'Moment added successfully' });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error adding moment' });
        }
      },
    getAllMoments: async (req, res) => {
        try {
          // Utilizamos el método `find` para obtener todos los momentos
          const moments = await Moments.find()
            .populate({
              path: 'user',
              select: '_id name lastName imgUrl', // Seleccionamos los campos que deseamos mostrar del usuario
            })
            .sort({ createdAt: -1 }) // Ordenamos por fecha de creación de mayor a menor
            .exec();
    
          // Respondemos con los momentos y los datos del usuario
          return res.status(200).json({ moments });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error fetching moments' });
        }
      },
      deleteMoment: async (req, res) => {
        try {
            const { momentId, userId } = req.params;

            // Buscar el momento por su _id
            const moment = await Moments.findById(momentId);

            if (!moment) {
                return res.status(404).json({ message: 'Moment not found' });
            }

            // Verificar si el usuario que realiza la solicitud es el creador del momento
            if (moment.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'No puedes eliminar este momento' });
            }

            // Eliminar el momento
            await Moments.findByIdAndDelete(momentId);

            return res.status(200).json({ message: 'Momento eliminado correctamente' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error deleting moment' });
        }
    }
}


module.exports = momentscontroller
