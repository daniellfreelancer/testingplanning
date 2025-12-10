const Requeriments = require('../models/requeriments');
const {
  uploadMulterFileVmclass,
} = require('../utils/s3ClientVMclass'); // nuevo helper

const requerimentController = {
  createRequeriment: async (req, res) => {
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
        status,
      } = req.body;

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
        status,
      });

      // imgFirstVMClass
      if (req.files && req.files['imgFirstVMClass']?.[0]) {
        const file = req.files['imgFirstVMClass'][0];
        const key = await uploadMulterFileVmclass(file);
        requeriment.imgFirstVMClass = key;
      }

      // imgSecondVMClass
      if (req.files && req.files['imgSecondVMClass']?.[0]) {
        const file = req.files['imgSecondVMClass'][0];
        const key = await uploadMulterFileVmclass(file);
        requeriment.imgSecondVMClass = key;
      }

      // imgThirdVMClass
      if (req.files && req.files['imgThirdVMClass']?.[0]) {
        const file = req.files['imgThirdVMClass'][0];
        const key = await uploadMulterFileVmclass(file);
        requeriment.imgThirdVMClass = key;
      }

      await requeriment.save();

      res.status(200).json({
        message: 'Requerimiento creado con éxito',
        success: true,
        response: requeriment,
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
      const updatedRequeriment =
        await Requeriments.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        );

      if (!updatedRequeriment) {
        return res.status(404).json({
          message: 'Requerimiento no encontrado',
        });
      }

      res.status(200).json({
        message: 'Requerimiento actualizado',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  deleteRequeriment: async (req, res) => {
    try {
      const { id } = req.body;
      const deletedRequeriment =
        await Requeriments.findByIdAndDelete(id);

      if (!deletedRequeriment) {
        return res.status(404).json({
          message: 'Requerimiento no encontrado',
        });
      }

      res.status(200).json({
        message: 'Requerimiento eliminado',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  getRequerimentById: async (req, res) => {
    const { id } = req.params;
    try {
      const requeriment = await Requeriments.findById(id);
      if (!requeriment) {
        return res.status(404).json({
          message: 'Requerimiento no encontrado',
        });
      }
      res.status(200).json({
        message: 'Requerimiento',
        response: requeriment,
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  getAllRequeriments: async (req, res) => {
    try {
      const requeriments = await Requeriments.find().sort({
        createdAt: -1,
      });

      if (requeriments && requeriments.length > 0) {
        res.status(200).json({
          message: 'Requerimientos',
          response: requeriments,
          success: true,
        });
      } else {
        res.status(404).json({
          message: 'No se encontraron requerimientos',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
};

module.exports = requerimentController;
