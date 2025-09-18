const espacioSchema = require("./espacioFutbolModels");
const espacioController = {
    crearEspacio: async (req, res) => {
        const Espacio = req.db.model("espacioFUT", espacioSchema);

        try {
            const nuevo = new Espacio(req.body);
            await nuevo.save();

            res.status(201).json({
                message: "Espacio creado exitosamente",
                espacio: nuevo,
            });
        } catch (error) {
            if (error.name === "ValidationError" || error.name === "CastError") {
                return res.status(400).json({
                    error: "Datos inválidos",
                    message: error.message,
                });
            }
            res.status(500).json({
                error: "Error al crear el espacio",
                message: error.message,
            });
        }
    },

    editarEspacio: async (req, res) => {
        const Espacio = req.db.model("espacioFUT", espacioSchema);

        try {
            const { id } = req.params;
            const actualizado = await Espacio.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );


            if (!actualizado) {
                return res.status(404).json({ error: "No se encontró el espacio" });
            }

            res.status(200).json({
                message: "Espacio actualizado",
                espacio: actualizado,
            });
        } catch (error) {
            res.status(500).json({
                error: "Error al editar el espacio",
                message: error.message,
            });
        }
    },
};

module.exports = espacioController;