const WorkshopPlanification = require('../models/workshopPlanification');
const Workshop = require('../models/workshop');

// Usamos helper centralizado de S3
const { uploadMulterFile, s3Client } = require('../utils/s3Client');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const bucketName = process.env.AWS_BUCKET_NAME;

const workshopPlanificationController = {
  createPlanification: async (req, res) => {
    const savedPlanification = new WorkshopPlanification(req.body);

    try {
      //  Si viene archivo (quiz), lo subimos a S3 con el helper
      if (req.file) {
        const key = await uploadMulterFile(req.file);
        savedPlanification.quiz = key;
      }

      await savedPlanification.save();

      if (savedPlanification) {
        const planificationID = savedPlanification._id;

        const workshop = await Workshop.findById(req.body.workshop);

        if (workshop) {
          workshop.planner.push(planificationID);
          await workshop.save();

          return res.status(200).json({
            response: savedPlanification,
            id: planificationID,
            message: 'Planificación creada y agregada al taller',
          });
        }
      } else {
        return res.status(400).json({
          message: 'Error al crear la planificación',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar crear la planificación',
        success: false,
      });
    }
  },

  deletePlanificationWorkshop: async (req, res) => {
    const { planificationId, workshopId } = req.params;

    try {
      const planification = await WorkshopPlanification.findById(planificationId);
      const workshop = await Workshop.findById(workshopId);

      if (!planification || !workshop) {
        return res.status(404).json({
          message: 'Planificación o Taller no encontrado',
          success: false,
        });
      }

      const quizdoc = planification.quiz;

      // ⬇️ Si hay archivo asociado en S3, lo borramos
      if (quizdoc) {
        const params = {
          Bucket: bucketName,
          Key: quizdoc,
        };

        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
      }

      // Eliminar la planificación de la colección
      await WorkshopPlanification.deleteOne({ _id: planificationId });

      // Eliminar referencia en el taller
      const index = workshop.planner.indexOf(planificationId);
      if (index > -1) {
        workshop.planner.splice(index, 1);
        await workshop.save();
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
      const planificationFund = await WorkshopPlanification.findById(id).populate(
        'workshop',
      );

      if (!planificationFund) {
        return res.status(404).json({
          message: 'Planificación no encontrada',
          success: false,
        });
      }

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
      // Nota: esto devuelve el documento *antes* del update en req.body
      const planification = await WorkshopPlanification.findByIdAndUpdate(
        planificationId,
        req.body,
      );

      if (!planification) {
        return res.status(404).json({
          message: 'Planificación no encontrada',
          success: false,
        });
      }

      // ⬇️ Si viene nuevo archivo, lo subimos a S3 con el helper
      if (req.file) {
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

  getPlanificationWorkshop: async (req, res) => {
    try {
      const planifications = await WorkshopPlanification.find();

      if (planifications && planifications.length > 0) {
        res.status(201).json({
          message: 'Planificaciones obtenidas con éxito',
          success: true,
          response: planifications,
        });
      } else {
        res.status(400).json({
          message: 'No se encontraron planificaciones',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Error al intentar obtener las planificaciones',
        success: false,
      });
    }
  },
};

module.exports = workshopPlanificationController;
