const Moments = require('../models/moments');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const sharp = require('sharp');

// usamos el helper centralizado
const { s3Client, uploadMulterFile, getSignedUrlForKey } = require('../utils/s3Client');

const bucketName = process.env.AWS_BUCKET_NAME;

const quizIdentifier = () => crypto.randomBytes(32).toString('hex');

async function attachSignedMomentUrl(momentDoc) {
  if (!momentDoc || !momentDoc.momentImg) return momentDoc;

  const plain = momentDoc.toObject ? momentDoc.toObject() : momentDoc;
  plain.momentImg = await getSignedUrlForKey(plain.momentImg);
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

      let optimizedImageBuffer;

      // Si la orientación de la imagen es horizontal, rotarla 90 grados
      if (orientation === 6 || orientation === 8) {
        optimizedImageBuffer = await sharp(fileContent)
          .rotate(90)
          .resize(1350, 1720)
          .toBuffer();
      } else {
        optimizedImageBuffer = await sharp(fileContent)
          .resize(1350, 1720)
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

      const { user, classroom, workshop } = req.body;

      const newMoment = new Moments({
        user,
        momentImg: key, // guardamos el key de S3
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
        const deleteParams = {
          Bucket: bucketName,
          Key: oldMoment.momentImg,
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

      // firmar las URLs para bucket privado
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

      const deleteParams = {
        Bucket: bucketName,
        Key: moment.momentImg,
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
