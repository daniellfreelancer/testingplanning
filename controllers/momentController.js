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

         const imageResized = await sharp(req.file.buffer).resize({
            width: 1080,
            height: 1920,
         }).toBuffer()
    
          const fileContent = imageResized;
          const extension = req.file.originalname.split('.').pop();
          const fileName = `moment-image-${quizIdentifier()}.${extension}`;
    
          const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: imageResized,
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
}


module.exports = momentscontroller
