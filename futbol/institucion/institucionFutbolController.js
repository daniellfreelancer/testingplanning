const institucionSchema = require("./institucionFutbolModels");

const institucionController = {
  crearInstitucion: async (req, res) => {
    // Create model using the connection from middleware
    const Institucion = req.db.model("institucionFUT", institucionSchema);

    try {
      const nuevaInstitucion = new Institucion(req.body);
      await nuevaInstitucion.save();

      res.status(201).json({
        message: "Institución creada exitosamente",
        institucion: nuevaInstitucion,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          error: "Error al crear la institución",
          message: error.message,
        });
    }
  },
  editarInstitucion: async (req, res) => {
    const Institucion = req.db.model("institucionFUT", institucionSchema);

    try {
        const { id } = req.params;
        const institucionExistente = await Institucion.findByIdAndUpdate(id, req.body, { new: true });

        if (!institucionExistente) {
            return res.status(404).json({ error: "Institución no encontrada" });
        }

        res.status(200).json({
            message: "Institución editada exitosamente",
            institucion: institucionExistente,
        });

    } catch (error) {
      res
        .status(500)
        .json({
          error: "Error al editar la institución",
          message: error.message,
        });
    }
  },
};

module.exports = institucionController;
