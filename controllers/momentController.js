const Moments = require('../models/moments');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const sharp = require('sharp');

// usamos el helper centralizado
const { s3Client, uploadMulterFile } = require('../utils/s3Client');

const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

const quizIdentifier = () => crypto.randomBytes(32).toString('hex');

// helper para obtener URL de la imagen del momento
// Si ya es una URL completa (CloudFront), la devuelve tal cual
// Si es un key antiguo, genera la URL de CloudFront
async function attachSignedMomentUrl(momentDoc) {
  if (!momentDoc || !momentDoc.momentImg) return momentDoc;

  const plain = momentDoc.toObject ? momentDoc.toObject() : momentDoc;

  try {
    // Si ya es una URL completa (contiene http:// o https://), la devolvemos tal cual
    if (plain.momentImg && (plain.momentImg.startsWith('http://') || plain.momentImg.startsWith('https://'))) {
      return plain;
    }
    
    // Si es un key antiguo, generamos la URL de CloudFront
    plain.momentImg = `${cloudfrontUrl}/${plain.momentImg}`;
  } catch (err) {
    console.error('Error generando URL para momentImg:', err);
  }
  return plain;
}

const momentscontroller = {
  addMoment: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Sin imagen cargada' });
      }

      const fileContent = req.file.buffer;
      const extension = req.file.originalname.split('.').pop();

      // Leer metadata EXIF para corrección de orientación
      const exif = await sharp(fileContent).metadata();
      console.log('Información EXIF:', exif);

      const orientation = exif ? exif.orientation : 1;

      // Dimensiones en proporción 9:16 (vertical, formato stories/momentos)
      const targetWidth = 1080;
      const targetHeight = 1920;

      let optimizedImageBuffer;

      // Si la orientación de la imagen es horizontal (Samsung), rotarla 90 grados
      if (orientation === 6 || orientation === 8) {
        optimizedImageBuffer = await sharp(fileContent)
          .rotate(90)
          .resize(targetWidth, targetHeight, {
            fit: 'cover', // Llena el área manteniendo proporción, recortando si es necesario
            position: 'center'
          })
          .toBuffer();
      } else {
        // Redimensionar a formato vertical 9:16 sin rotación
        optimizedImageBuffer = await sharp(fileContent)
          .resize(targetWidth, targetHeight, {
            fit: 'cover', // Llena el área manteniendo proporción, recortando si es necesario
            position: 'center'
          })
          .toBuffer();
      }

      // armamos un "fake file" para reutilizar uploadMulterFile
      const fakeFile = {
        originalname: req.file.originalname,
        buffer: optimizedImageBuffer,
        mimetype: req.file.mimetype,
        fieldname: req.file.fieldname || 'moment-image',
      };

      // puedes dejar que el helper genere el nombre random,
      // o pasar uno más "legible" como override:
      const key = await uploadMulterFile(
        fakeFile,
        `post-image-${quizIdentifier()}.${extension}`
      );

      // Generamos la URL de CloudFront
      const fileUrl = `${cloudfrontUrl}/${key}`;

      const { user, classroom, workshop } = req.body;

      const newMoment = new Moments({
        user,
        momentImg: fileUrl, // guardamos la URL completa de CloudFront
        classroom,
        workshop,
      });

      await newMoment.save();

      // Buscar momentos del usuario creados hace 7 días o más y eliminarlos
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const oldMoments = await Moments.find({
        user,
        createdAt: { $lte: sevenDaysAgo },
      });

      for (const oldMoment of oldMoments) {
        // Eliminar imagen de S3
        // Si es una URL completa de CloudFront, extraemos el key
        // Si es un key antiguo, lo usamos tal cual
        let key;
        if (oldMoment.momentImg && (oldMoment.momentImg.startsWith('http://') || oldMoment.momentImg.startsWith('https://'))) {
          // Extraer el key de la URL de CloudFront
          key = oldMoment.momentImg.replace(`${cloudfrontUrl}/`, '');
        } else {
          key = oldMoment.momentImg;
        }

        const deleteParams = {
          Bucket: bucketName,
          Key: key,
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));

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
      let moments = await Moments.find()
        .populate({
          path: 'user',
          select: '_id name lastName imgUrl',
        })
        .sort({ createdAt: -1 })
        .exec();

      // obtener URLs de CloudFront (o generar si es key antiguo)
      moments = await Promise.all(moments.map(m => attachSignedMomentUrl(m)));

      return res.status(200).json({ moments });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching moments' });
    }
  },

  getMomentsByType: async (req, res) => {
    try {
      const filterType = req.query.filterType;
      const filterValue = req.query.filterValue;

      let filter = {};
      if (filterType && filterValue) {
        filter[filterType] = filterValue;
      }

      let moments = await Moments.find(filter)
        .populate({
          path: 'user',
          select: '_id name lastName imgUrl',
        })
        .sort({ createdAt: -1 })
        .exec();

      moments = await Promise.all(moments.map(m => attachSignedMomentUrl(m)));

      return res.status(200).json({ moments });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching moments' });
    }
  },

  deleteMoment: async (req, res) => {
    try {
      const { momentId, userId } = req.params;

      const moment = await Moments.findById(momentId);

      if (!moment) {
        return res.status(404).json({ message: 'Moment not found' });
      }

      if (moment.user.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: 'No puedes eliminar este momento' });
      }

      // Si es una URL completa de CloudFront, extraemos el key
      // Si es un key antiguo, lo usamos tal cual
      let key;
      if (moment.momentImg && (moment.momentImg.startsWith('http://') || moment.momentImg.startsWith('https://'))) {
        // Extraer el key de la URL de CloudFront
        key = moment.momentImg.replace(`${cloudfrontUrl}/`, '');
      } else {
        key = moment.momentImg;
      }

      const deleteParams = {
        Bucket: bucketName,
        Key: key,
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));

      await Moments.findByIdAndDelete(momentId);

      return res.status(200).json({ message: 'Momento eliminado correctamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error deleting moment' });
    }
  },
};

module.exports = momentscontroller;
