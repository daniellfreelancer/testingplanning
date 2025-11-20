const NotasUsuarios = require("./notasUsuariosModel");
const Usuarios = require("../usuarios-complejos/usuariosComplejos");

const notasUsuariosController = {
  // Crear una nueva nota para un usuario
  crearNota: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      const { texto, creadoPor, nombreCreador, institucion } = req.body;

      // Validar que el usuario existe
      const usuario = await Usuarios.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

      // Contar notas existentes del usuario
      const notasCount = await NotasUsuarios.countDocuments({ usuario: usuarioId });

      // Limitar a 3 notas máximo
      if (notasCount >= 3) {
        // Eliminar la nota más antigua
        const notaMasAntigua = await NotasUsuarios.findOne({ usuario: usuarioId })
          .sort({ createdAt: 1 })
          .limit(1);

        if (notaMasAntigua) {
          await NotasUsuarios.findByIdAndDelete(notaMasAntigua._id);
        }
      }

      // Crear la nueva nota
      const nuevaNota = new NotasUsuarios({
        usuario: usuarioId,
        texto,
        creadoPor,
        nombreCreador,
        institucion: institucion || null
      });

      const notaGuardada = await nuevaNota.save();

      res.status(201).json({
        success: true,
        message: "Nota creada exitosamente",
        nota: notaGuardada
      });

    } catch (error) {
      console.error("Error al crear nota:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear la nota",
        error: error.message
      });
    }
  },

  // Obtener todas las notas de un usuario (máximo 3, ordenadas por fecha)
  obtenerNotasUsuario: async (req, res) => {
    try {
      const { usuarioId } = req.params;

      const notas = await NotasUsuarios.find({ usuario: usuarioId })
        .sort({ createdAt: -1 }) // Más recientes primero
        .limit(3)
        .populate('creadoPor', 'nombre apellido')
        .populate('institucion', 'nombre');

      res.status(200).json({
        success: true,
        notas
      });

    } catch (error) {
      console.error("Error al obtener notas:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener las notas",
        error: error.message
      });
    }
  },

  // Eliminar una nota específica
  eliminarNota: async (req, res) => {
    try {
      const { notaId } = req.params;

      const notaEliminada = await NotasUsuarios.findByIdAndDelete(notaId);

      if (!notaEliminada) {
        return res.status(404).json({
          success: false,
          message: "Nota no encontrada"
        });
      }

      res.status(200).json({
        success: true,
        message: "Nota eliminada exitosamente"
      });

    } catch (error) {
      console.error("Error al eliminar nota:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar la nota",
        error: error.message
      });
    }
  },

  // Editar una nota existente
  editarNota: async (req, res) => {
    try {
      const { notaId } = req.params;
      const { texto } = req.body;

      if (!texto || texto.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "El texto de la nota no puede estar vacío"
        });
      }

      const notaActualizada = await NotasUsuarios.findByIdAndUpdate(
        notaId,
        { texto },
        { new: true, runValidators: true }
      );

      if (!notaActualizada) {
        return res.status(404).json({
          success: false,
          message: "Nota no encontrada"
        });
      }

      res.status(200).json({
        success: true,
        message: "Nota actualizada exitosamente",
        nota: notaActualizada
      });

    } catch (error) {
      console.error("Error al editar nota:", error);
      res.status(500).json({
        success: false,
        message: "Error al editar la nota",
        error: error.message
      });
    }
  }
};

module.exports = notasUsuariosController;
