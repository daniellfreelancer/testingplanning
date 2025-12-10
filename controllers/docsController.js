const User = require('../models/admin');
const { uploadMulterFile } = require('../utils/s3Client'); 

const docsController = {
  idFrontUpload: async (req, res) => {
    const { id } = req.params;
    try {
      let user = await User.findById(id);

      if (user && req.file) {
        // subir el archivo a S3 (bucket privado)
        const key = await uploadMulterFile(
          req.file,
          `docs/${id}/id-front`
        );

        user.idFront = key;
        await user.save();

        res.status(200).json({
          message: 'Archivo cargado con exito',
          success: true,
          response: key,
        });
      } else {
        res.status(400).json({
          message: 'No se pudo cargar el archivo',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al cargar el archivo',
        success: false,
      });
    }
  },

  idBackUpload: async (req, res) => {
    const { id } = req.params;
    try {
      let user = await User.findById(id);

      if (user && req.file) {
        const key = await uploadMulterFile(
          req.file,
          `docs/${id}/id-back`
        );

        user.idBack = key;
        await user.save();

        res.status(200).json({
          message: 'Archivo cargado con exito',
          success: true,
          response: key,
        });
      } else {
        res.status(400).json({
          message: 'No se pudo cargar el archivo',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al cargar el archivo',
        success: false,
      });
    }
  },

  backgroundUpload: async (req, res) => {
    const { id } = req.params;
    try {
      let user = await User.findById(id);

      if (user && req.file) {
        const key = await uploadMulterFile(
          req.file,
          `docs/${id}/background`
        );

        user.backgroundDoc = key;
        await user.save();

        res.status(200).json({
          message: 'Archivo cargado con exito',
          success: true,
          response: key,
        });
      } else {
        res.status(400).json({
          message: 'No se pudo cargar el archivo',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al cargar el archivo',
        success: false,
      });
    }
  },

  otherDocsUpload: async (req, res) => {
    const { id } = req.params;
    try {
      let user = await User.findById(id);

      if (user && req.file) {
        const key = await uploadMulterFile(
          req.file,
          `docs/${id}/other-${Date.now()}`
        );

        user.otherDocs = key;
        await user.save();

        res.status(200).json({
          message: 'Archivo cargado con exito',
          success: true,
          response: key,
        });
      } else {
        res.status(400).json({
          message: 'No se pudo cargar el archivo',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al cargar el archivo',
        success: false,
      });
    }
  },
};

module.exports = docsController;
