const mongoose = require('mongoose');
const ProfesoresPiscinaStgo = require('./profesoresPiscinaStgo');

const profesoresPiscinaStgoController = {
  crearProfesor: async (req, res) => {
    try {
      const { nombre, apellido, email, telefono, rut } = req.body;

      if (!nombre || !apellido || !email || !rut) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: nombre, apellido, email, rut',
        });
      }

      const rutLimpio = String(rut).trim().toUpperCase().replace(/\./g, '').replace(/-/g, '');
      const existente = await ProfesoresPiscinaStgo.findOne({ rut: rutLimpio });
      if (existente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un profesor con este RUT',
        });
      }

      const nuevoProfesor = new ProfesoresPiscinaStgo({
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        email: String(email).trim().toLowerCase(),
        telefono: telefono ? String(telefono).trim() : undefined,
        rut: rutLimpio,
      });

      await nuevoProfesor.save();

      res.status(201).json({
        success: true,
        message: 'Profesor creado correctamente',
        profesor: nuevoProfesor,
      });
    } catch (error) {
      console.error('Error al crear profesor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear profesor',
        error: error.message,
      });
    }
  },

  obtenerProfesores: async (req, res) => {
    try {
      const profesores = await ProfesoresPiscinaStgo.find()
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({
        success: true,
        profesores,
        total: profesores.length,
      });
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener profesores',
        error: error.message,
      });
    }
  },

  obtenerProfesor: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de profesor no válido',
        });
      }

      const profesor = await ProfesoresPiscinaStgo.findById(id).lean();
      if (!profesor) {
        return res.status(404).json({
          success: false,
          message: 'Profesor no encontrado',
        });
      }

      res.status(200).json({
        success: true,
        profesor,
      });
    } catch (error) {
      console.error('Error al obtener profesor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener profesor',
        error: error.message,
      });
    }
  },

  actualizarProfesor: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de profesor no válido',
        });
      }

      const datosActualizar = {};
      const { nombre, apellido, email, telefono, rut, status } = req.body;

      if (nombre !== undefined) datosActualizar.nombre = String(nombre).trim();
      if (apellido !== undefined) datosActualizar.apellido = String(apellido).trim();
      if (email !== undefined) datosActualizar.email = String(email).trim().toLowerCase();
      if (telefono !== undefined) datosActualizar.telefono = String(telefono).trim();
      if (rut !== undefined) datosActualizar.rut = String(rut).trim().toUpperCase().replace(/\./g, '').replace(/-/g, '');
      if (status !== undefined) datosActualizar.status = status;

      if (datosActualizar.rut) {
        const existente = await ProfesoresPiscinaStgo.findOne({
          rut: datosActualizar.rut,
          _id: { $ne: id },
        });
        if (existente) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe otro profesor con este RUT',
          });
        }
      }

      const profesorActualizado = await ProfesoresPiscinaStgo.findByIdAndUpdate(
        id,
        datosActualizar,
        { new: true, runValidators: true }
      ).lean();

      if (!profesorActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Profesor no encontrado',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profesor actualizado correctamente',
        profesor: profesorActualizado,
      });
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar profesor',
        error: error.message,
      });
    }
  },

  eliminarProfesor: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de profesor no válido',
        });
      }

      const profesorEliminado = await ProfesoresPiscinaStgo.findByIdAndDelete(id).lean();
      if (!profesorEliminado) {
        return res.status(404).json({
          success: false,
          message: 'Profesor no encontrado',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profesor eliminado correctamente',
        profesor: profesorEliminado,
      });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar profesor',
        error: error.message,
      });
    }
  },
};

module.exports = profesoresPiscinaStgoController;