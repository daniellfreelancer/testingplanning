const Clubs = require('../models/club');
const Categories = require('../models/sportCategory');
const Trainers = require('../models/admin');
const Players = require('../models/student');

//queryPopulate for club, teachers, students => name, lastName, email, imgUrl
const queryPopulateCategory = [
  {
    path: 'club',
    select: 'name',
  },
  {
    path: 'teachers',
    select: 'name lastName email imgUrl',
  },
  {
    path: 'students',
    select: 'name lastName email imgUrl',
  },
  {
    path: 'trainingPlanner',
  },
];

const sportCategoryController = {
  createCategory: async (req, res) => {
    const { clubId } = req.params;

    try {
      let sportCategory = new Categories(req.body);

      if (sportCategory) {
        const club = await Clubs.findById(clubId);

        if (!club) {
          return res.status(404).json({
            message: 'Club no encontrado',
            success: false,
          });
        }

        club.categories.push(sportCategory._id);
        await club.save();

        sportCategory.club = clubId;
        await sportCategory.save();

        res.status(201).json({
          message: 'Categoría deportiva creada correctamente',
          success: true,
          sportCategory,
        });
      } else {
        res.status(400).json({
          message: 'Error al crear categoría deportiva',
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

  getCategories: async (req, res) => {
    try {
      let categories = await Categories.find();

      if (categories) {
        res.status(200).json({
          message: 'Categorías deportivas obtenidas correctamente',
          success: true,
          categories,
        });
      } else {
        res.status(404).json({
          message: 'No hay categorías deportivas disponibles',
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

  getCategoryById: async (req, res) => {
    try {
      let { categoryId } = req.params;

      let category = await Categories.findById(categoryId).populate(
        queryPopulateCategory
      );

      if (category) {
        res.status(200).json({
          message: 'Categoría deportiva obtenida correctamente',
          success: true,
          category,
        });
      } else {
        res.status(404).json({
          message: 'Categoría deportiva no encontrada',
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

  updateCategory: async (req, res) => {
    try {
      let { categoryId } = req.params;

      let category = await Categories.findByIdAndUpdate(
        categoryId,
        req.body,
        { new: true }
      );

      if (category) {
        res.status(200).json({
          message: 'Categoría deportiva actualizada correctamente',
          success: true,
          category,
        });
      } else {
        res.status(404).json({
          message: 'Categoría deportiva no encontrada',
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

  deleteCategory: async (req, res) => {
    try {
      let { categoryId, clubId } = req.params;

      const club = await Clubs.findById(clubId);

      if (club) {
        let index = club.categories.indexOf(categoryId);

        if (index > -1) {
          club.categories.splice(index, 1);
          await club.save();
        } else {
          return res.status(404).json({
            message: 'Categoría no encontrada en el club',
            success: false,
          });
        }
      }

      let category = await Categories.findByIdAndDelete(categoryId);

      if (category) {
        res.status(200).json({
          message: 'Categoría deportiva eliminada correctamente',
          success: true,
        });
      } else {
        res.status(404).json({
          message: 'Categoría deportiva no encontrada',
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

  addTeacherToCategory: async (req, res) => {
    try {
      let { categoryId, teacherId } = req.params;

      // Buscar la categoría y el profesor en paralelo
      let [category, teacher] = await Promise.all([
        Categories.findById(categoryId),
        Trainers.findById(teacherId),
      ]);

      if (!category) {
        return res.status(404).json({
          message: 'Categoría deportiva no encontrada',
          success: false,
        });
      }

      if (!teacher) {
        return res.status(404).json({
          message: 'Entrenador no encontrado',
          success: false,
        });
      }

      // Verificar si el profesor ya está en la categoría
      if (category.teachers.includes(teacherId)) {
        return res.status(400).json({
          message: 'El entrenador ya está asignado a esta categoría',
          success: false,
        });
      }

      // Verificar si la categoría ya está en el profesor
      if (teacher.sports.includes(categoryId)) {
        return res.status(400).json({
          message: 'La categoría ya está asignada a este entrenador',
          success: false,
        });
      }

      // Agregar la relación
      category.teachers.push(teacherId);
      teacher.sports.push(categoryId);

      // Guardar ambas entidades en paralelo para mejorar rendimiento
      await Promise.all([category.save(), teacher.save()]);

      res.status(200).json({
        message: 'Entreador agregado a la categoría deportiva correctamente',
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al agregar el entrenador a la categoría',
        error: error.message,
        success: false,
      });
    }
  },

  addPlayerToCategory: async (req, res) => {
    try {
      let { categoryId, playerId } = req.params;

      // Buscar la categoría y el jugador en paralelo
      let [category, player] = await Promise.all([
        Categories.findById(categoryId),
        Players.findById(playerId),
      ]);

      if (!category) {
        return res.status(404).json({
          message: 'Categoría deportiva no encontrada',
          success: false,
        });
      }

      if (!player) {
        return res.status(404).json({
          message: 'Jugador no encontrado',
          success: false,
        });
      }

      // Verificar si el jugador ya está en la categoría
      if (category.students.includes(playerId)) {
        return res.status(400).json({
          message: 'El jugador ya está asignado a esta categoría',
          success: false,
        });
      }

      // Verificar si la categoría ya está en el jugador
      if (player.sports.includes(categoryId)) {
        return res.status(400).json({
          message: 'La categoría ya está asignada a este jugador',
          success: false,
        });
      }

      // Agregar la relación
      category.students.push(playerId);
      player.sports.push(categoryId);

      // Guardar ambas entidades en paralelo para mejorar rendimiento
      await Promise.all([category.save(), player.save()]);

      res.status(200).json({
        message: 'Jugador agregado a la categoría deportiva correctamente',
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al agregar el jugador a la categoría',
        error: error.message,
        success: false,
      });
    }
  },

  removePlayerFromCategory: async (req, res) => {
    try {
      let { categoryId, playerId } = req.params;

      // Buscar la categoría y el jugador en paralelo
      let [category, player] = await Promise.all([
        Categories.findById(categoryId),
        Players.findById(playerId),
      ]);

      if (!category) {
        return res.status(404).json({
          message: 'Categoría deportiva no encontrada',
          success: false,
        });
      }

      if (!player) {
        return res.status(404).json({
          message: 'Jugador no encontrado',
          success: false,
        });
      }

      // Verificar si el jugador ya está en la categoría
      if (!category.students.includes(playerId)) {
        return res.status(400).json({
          message: 'El jugador no está asignado a esta categoría',
          success: false,
        });
      }

      // Verificar si la categoría ya está en el jugador
      if (!player.sports.includes(categoryId)) {
        return res.status(400).json({
          message: 'La categoría no está asignada a este jugador',
          success: false,
        });
      }

      // Eliminar la relación
      category.students.pull(playerId);
      player.sports.pull(categoryId);

      // Guardar ambas entidades en paralelo para mejorar rendimiento
      await Promise.all([category.save(), player.save()]);

      res.status(200).json({
        message: 'Jugador eliminado de la categoría deportiva correctamente',
        success: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al eliminar el jugador de la categoría',
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = sportCategoryController;
