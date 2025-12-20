const NotificacionUcad = require("./notificaciones-ucad");

const notificacionesUcadController = {
  crearNotificacion: async (req, res) => {
    try {
      const { createdBy, target, motivo, prioridad, tipo, timestamp } = req.body;

      if (!createdBy || !target || !motivo || !prioridad || !tipo) {
        return res.status(400).json({
          message:
            "Los campos createdBy, target, motivo, prioridad y tipo son requeridos",
        });
      }

      const nuevaNotificacion = new NotificacionUcad({
        createdBy,
        target,
        motivo,
        prioridad: String(prioridad).trim(),
        tipo: String(tipo).trim(),
        ...(timestamp ? { timestamp } : {}),
      });

      await nuevaNotificacion.save();

      return res.status(201).json({
        message: "Notificación creada correctamente",
        notificacion: nuevaNotificacion,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error al crear notificación",
        error: error.message,
      });
    }
  },

  obtenerNotificacionPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const notificacion = await NotificacionUcad.findById(id);

      if (!notificacion) {
        return res.status(404).json({ message: "Notificación no encontrada" });
      }

      return res.status(200).json({ notificacion });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error al obtener notificación",
        error: error.message,
      });
    }
  },

  listarPorTarget: async (req, res) => {
    try {
      const { targetId } = req.params;

      const notificaciones = await NotificacionUcad.find({ target: targetId }).populate('createdBy', 'nombre apellido imgUrl').sort({ timestamp: -1 });

      return res.status(200).json({ notificaciones });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error al obtener notificaciones por target",
        error: error.message,
      });
    }
  },


  listarPorCreador: async (req, res) => {
    try {
      const { creatorId } = req.params;

      const notificaciones = await NotificacionUcad.find({ createdBy: creatorId }).populate('target', 'nombre apellido imgUrl').sort({ timestamp: -1 });

      return res.status(200).json({ notificaciones });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error al obtener notificaciones por creador",
        error: error.message,
      });
    }
  },




};

module.exports = notificacionesUcadController;
