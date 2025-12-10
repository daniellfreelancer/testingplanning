const Planification = require('../models/planification');
const ClassRoom = require('../models/classroom');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const upLoadFiles = require('../s3')
// const crypto = require('crypto')
// const sharp = require('sharp');
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { s3Client, uploadMulterFile /*, getSignedUrlForKey*/ } = require('../utils/s3Client');

const bucketName = process.env.AWS_BUCKET_NAME;


const planificationController = {
  /**
   * Crea una planificación. Recibe JSON + file por form-data
   */
  createPlanification: async (req, res) => {
    try {
      const savedPlanification = new Planification(req.body);

      if (req.file) {
        // Subimos el archivo al bucket privado usando el helper centralizado
        // Puedes agregar un keyOverride si quieres algo más ordenado:
        // const key = await uploadMulterFile(req.file, `planifications/${Date.now()}-${req.file.originalname}`);
        const key = await uploadMulterFile(req.file);
        savedPlanification.quiz = key; // Guardar el "key" del objeto en S3
      }

      await savedPlanification.save();

      if (savedPlanification) {
        const planificationID = savedPlanification._id;

        const classroomGrade = await ClassRoom.findById(req.body.classroom);

        if (classroomGrade) {
          classroomGrade.planner.push(planificationID);
          await classroomGrade.save();

          return res.status(200).json({
            response: savedPlanification,
            id: planificationID,
            message: 'Planificación creada y agregada al aula',
          });
        }
      }

      return res.status(400).json({
        message: 'Error al crear la planificación',
        success: false,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar crear la planificación',
        success: false,
      });
    }
  },

  deletePlanification: async (req, res) => {
    const { planificationId, classroomId } = req.params;
    try {
      const planification = await Planification.findById(planificationId);
      const classroomGrade = await ClassRoom.findById(classroomId);

      if (!planification || !classroomGrade) {
        return res.status(404).json({
          message: 'Planificación o Clase no encontrada',
          success: false,
        });
      }

      // Si tiene evaluación sumativa y hay archivo en S3, lo borramos
      if (planification.evaluationType === 'Sumativa' && planification.quiz) {
        const params = {
          Bucket: bucketName,
          Key: planification.quiz,
        };

        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
      }

      // Elimina la planificación de la colección
      await Planification.deleteOne({ _id: planificationId });

      // Elimina la planificación del arreglo planner del classroom
      const index = classroomGrade.planner.indexOf(planificationId);
      if (index > -1) {
        classroomGrade.planner.splice(index, 1);
        await classroomGrade.save();
      }

      res.status(200).json({
        message: 'Planificación eliminada con éxito',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar eliminar la planificación',
        success: false,
      });
    }
  },

  getPlanificationById: async (req, res) => {
    const { id } = req.params;

    try {
      let planificationFund = await Planification.findById(id).populate('classroom');

      if (!planificationFund) {
        return res.status(404).json({
          message: 'Planificación no encontrada',
          success: false,
        });
      }

      // Opcional: si quieres devolver URL firmada del quiz:
      // if (planificationFund.quiz) {
      //   const plain = planificationFund.toObject();
      //   plain.quizUrl = await getSignedUrlForKey(plain.quiz);
      //   return res.status(200).json(plain);
      // }

      return res.status(200).json(planificationFund);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar buscar la planificación',
        success: false,
      });
    }
  },

  updatePlanification: async (req, res) => {
    const { planificationId } = req.params;

    try {
      const planification = await Planification.findByIdAndUpdate(
        planificationId,
        req.body,
        { new: true }
      );

      if (!planification) {
        return res.status(404).json({
          message: 'Planificación no encontrada',
          success: false,
        });
      }

      if (req.file) {
        // Opcional: podrías borrar el archivo anterior de S3 antes de subir uno nuevo
        // if (planification.quiz) {
        //   await s3Client.send(new DeleteObjectCommand({
        //     Bucket: bucketName,
        //     Key: planification.quiz,
        //   }));
        // }

        const key = await uploadMulterFile(req.file);
        planification.quiz = key;
      }

      await planification.save();

      res.status(200).json({
        message: 'Planificación actualizada con éxito',
        success: true,
        planification,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar actualizar la planificación',
        success: false,
      });
    }
  },

  getPlanifications: async (req, res) => {
    try {
      const planifications = await Planification.find();

      if (planifications && planifications.length > 0) {
        return res.status(201).json({
          message: 'Planificaciones encontradas',
          success: true,
          response: planifications,
        });
      }

      return res.status(400).json({
        message: 'No se encontraron planificaciones',
        success: false,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar obtener las planificaciones',
        success: false,
      });
    }
  },
};

module.exports = planificationController;
