const SportPlanification = require('../models/sportPlanification');
const SportCategory = require('../models/sportCategory');

// Nuevo: usamos el helper centralizado
const { uploadMulterFile } = require('../utils/s3Client');

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

const sportPlanificationController = {
  createSportPlanification: async (req, res) => {
    const savedPlanification = new SportPlanification(req.body);

    try {
      if (req.file) {
        // Subimos el archivo con el helper centralizado
        const key = await uploadMulterFile(req.file);
        // Generamos la URL de CloudFront
        savedPlanification.quiz = `${cloudfrontUrl}/${key}`;
      }

      await savedPlanification.save();

      if (savedPlanification) {
        const planificationID = savedPlanification._id;
        const sport = await SportCategory.findById(req.body.sport);

        if (sport) {
          sport.trainingPlanner.push(planificationID);
          await sport.save();
        }

        res.status(201).json({
          message: 'Planificacion creada exitosamente',
          success: true,
        });
      } else {
        res.status(400).json({
          message: 'Error al crear la planificacion',
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },

  updateSportPlanification: async (req, res) => {
    const { id } = req.params;
    let updatedPlanification = { ...req.body };

    try {
      // Si se sube un nuevo archivo, procesarlo
      if (req.file) {
        const key = await uploadMulterFile(req.file);
        // Generamos la URL de CloudFront
        updatedPlanification.quiz = `${cloudfrontUrl}/${key}`;
      }

      let planification = await SportPlanification.findByIdAndUpdate(
        id,
        updatedPlanification,
        { new: true }
      );

      if (!planification) {
        return res.status(404).json({
          message: 'Planificacion no encontrada',
          success: false,
        });
      }

      // Aplicar URLs de CloudFront
      planification = attachPlanificationCloudFrontUrls(planification);

      res.status(200).json({
        message: 'Planificacion actualizada exitosamente',
        success: true,
        response: planification,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },

  deleteSportPlanification: async (req, res) => {
    const { id, idSport } = req.params;

    try {
      const planification = await SportPlanification.findByIdAndDelete(id);

      if (!planification) {
        return res.status(404).json({
          message: 'Planificacion no encontrada',
          success: false,
        });
      }

      const sport = await SportCategory.findById(idSport);
      if (sport) {
        sport.trainingPlanner.pull(id);
        await sport.save();
      }

      res.status(200).json({
        message: 'Planificacion eliminada exitosamente',
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },

  getSportPlanificationById: async (req, res) => {
    const { id } = req.params;

    try {
      let planification = await SportPlanification.findById(id);

      if (!planification) {
        return res.status(404).json({
          message: 'Planificacion no encontrada',
          success: false,
        });
      }

      // Aplicar URLs de CloudFront
      planification = attachPlanificationCloudFrontUrls(planification);

      res.status(200).json(planification);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },

  getSportPlanificationBySportCategory: async (req, res) => {
    const { id } = req.params;

    try {
      let planifications = await SportPlanification.find({ sport: id });

      if (!planifications || planifications.length === 0) {
        return res.status(404).json({
          message: 'Planificaciones no encontradas',
          success: false,
        });
      }

      // Aplicar URLs de CloudFront a todas las planificaciones
      planifications = planifications.map(planification => 
        attachPlanificationCloudFrontUrls(planification)
      );

      res.status(200).json(planifications);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
        success: false,
      });
    }
  },
};

module.exports = sportPlanificationController;
