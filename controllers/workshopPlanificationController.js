const WorkshopPlanification = require('../models/workshopPlanification');
const Workshop = require('../models/workshop');

// Usamos helper centralizado de S3
const { uploadMulterFile, s3Client } = require('../utils/s3Client');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const bucketName = process.env.AWS_BUCKET_NAME;
const cloudfrontUrl = process.env.AWS_ACCESS_CLOUD_FRONT;

// helper para obtener URL de CloudFront
// Si ya es una URL completa (CloudFront), la devuelve tal cual
// Si es un key antiguo, genera la URL de CloudFront
function attachCloudFrontUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${cloudfrontUrl}/${url}`;
}

// helper para aplicar URLs de CloudFront a una planificación
function attachPlanificationCloudFrontUrls(planificationDoc) {
  if (!planificationDoc) return planificationDoc;

  const plain = planificationDoc.toObject ? planificationDoc.toObject() : planificationDoc;

  try {
    // Aplicar URL a quiz
    if (plain.quiz) {
      plain.quiz = attachCloudFrontUrl(plain.quiz);
    }
  } catch (err) {
    console.error('Error generando URLs para planificación:', err);
  }

  return plain;
}

const workshopPlanificationController = {
  createPlanification: async (req, res) => {
    const savedPlanification = new WorkshopPlanification(req.body);

    try {
      //  Si viene archivo (quiz), lo subimos a S3 con el helper
      if (req.file) {
        const key = await uploadMulterFile(req.file);
        // Generamos la URL de CloudFront
        savedPlanification.quiz = `${cloudfrontUrl}/${key}`;
      }

      await savedPlanification.save();

      if (savedPlanification) {
        const planificationID = savedPlanification._id;

        const workshop = await Workshop.findById(req.body.workshop);

        if (workshop) {
          workshop.planner.push(planificationID);
          await workshop.save();

          // Aplicar URLs de CloudFront
          const planificationWithUrls = attachPlanificationCloudFrontUrls(savedPlanification);

          return res.status(200).json({
            response: planificationWithUrls,
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
        // Si es una URL completa de CloudFront, extraemos el key
        // Si es un key antiguo, lo usamos tal cual
        let key;
        if (quizdoc.startsWith('http://') || quizdoc.startsWith('https://')) {
          // Extraer el key de la URL de CloudFront
          key = quizdoc.replace(`${cloudfrontUrl}/`, '');
        } else {
          key = quizdoc;
        }

        const params = {
          Bucket: bucketName,
          Key: key,
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
      let planificationFund = await WorkshopPlanification.findById(id).populate(
        'workshop',
      );

      if (!planificationFund) {
        return res.status(404).json({
          message: 'Planificación no encontrada',
          success: false,
        });
      }

      // Aplicar URLs de CloudFront
      planificationFund = attachPlanificationCloudFrontUrls(planificationFund);

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
        // Generamos la URL de CloudFront
        planification.quiz = `${cloudfrontUrl}/${key}`;
      }

      await planification.save();

      // Aplicar URLs de CloudFront
      const planificationWithUrls = attachPlanificationCloudFrontUrls(planification);

      res.status(200).json({
        message: 'Planificación actualizada con éxito',
        success: true,
        planification: planificationWithUrls,
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
      let planifications = await WorkshopPlanification.find();

      if (planifications && planifications.length > 0) {
        // Aplicar URLs de CloudFront a todas las planificaciones
        planifications = planifications.map(planification => 
          attachPlanificationCloudFrontUrls(planification)
        );

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
