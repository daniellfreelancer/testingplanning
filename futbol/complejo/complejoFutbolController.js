const complejoSchema = require("./complejoFutbolModels");

const complejoController = {
    crearComplejo: async (req, res) => {
        const Complejo = req.db.model("complejoFUT", complejoSchema);

        try {
            const nuevo = new Complejo(req.body);
            await nuevo.save();

            res.status(201).json({
                message: "Complejo creado exitosamente",
                complejo: nuevo,
            });
        } catch (error) {
            res.status(500).json({
                error: "Error al crear el complejo",
                message: error.message,
            });
        }
    },

    editarComplejo: async (req, res) => {
        const Complejo = req.db.model("complejoFUT", complejoSchema);

        try {
            const { id } = req.params;
            const actualizado = await Complejo.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!actualizado) {
                return res.status(404).json({
                    error: "No se encontró el complejo",
                });
            }

            res.status(200).json({
                message: "Complejo actualizado",
                complejo: actualizado,
            });
        } catch (error) {
            res.status(500).json({
                error: "Error al editar el complejo",
                message: error.message,
            });
        }
    },
};

module.exports = complejoController;