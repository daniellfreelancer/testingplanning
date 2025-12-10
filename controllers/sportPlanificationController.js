const SportPlanification = require('../models/sportPlanification');
const SportCategory = require('../models/sportCategory');

// Nuevo: usamos el helper centralizado
const { uploadMulterFile } = require('../utils/s3Client');

const sportPlanificationController = {
  createSportPlanification: async (req, res) => {
    const savedPlanification = new SportPlanification(req.body);

    try {
      if (req.file) {
        // Subimos el archivo con el helper centralizado
        const key = await uploadMulterFile(req.file);
        savedPlanification.quiz = key; // Guardar el key en el campo quiz
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
    const updatedPlanification = req.body;

    try {
      const planification = await SportPlanification.findByIdAndUpdate(
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

      res.status(200).json({
        message: 'Planificacion actualizada exitosamente',
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
      const planification = await SportPlanification.findById(id);

      if (!planification) {
        return res.status(404).json({
          message: 'Planificacion no encontrada',
          success: false,
        });
      }

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
      const planifications = await SportPlanification.find({ sport: id });

      if (!planifications || planifications.length === 0) {
        return res.status(404).json({
          message: 'Planificaciones no encontradas',
          success: false,
        });
      }

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
