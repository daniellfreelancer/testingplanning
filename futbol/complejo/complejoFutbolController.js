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

    obtenerTodos: async (req, res) => {
        const Complejo = req.db.model("complejoFUT", complejoSchema);

        try {
            const complejos = await Complejo.find();
            res.status(200).json(complejos);
        } catch (error) {
            res.status(500).json({
                error: "Error al obtener los complejos",
                message: error.message,
            });
        }
    },

    obtenerPorId: async (req, res) => {
        const Complejo = req.db.model("complejoFUT", complejoSchema);

        try {
            const { id } = req.params;
            const complejo = await Complejo.findById(id);

            if (!complejo) {
                return res.status(404).json({
                    error: "No se encontró el complejo",
                });
            }

            res.status(200).json(complejo);
        } catch (error) {
            res.status(500).json({
                error: "Error al obtener el complejo",
                message: error.message,
            });
        }
    },

    obtenerPorEspacio: async (req, res) => {
        const Complejo = req.db.model("complejoFUT", complejoSchema);
        try {
            const { espacioId } = req.params;
            const complejos = await Complejo.find({ id_espacio: espacioId });
            res.status(200).json(complejos);
        } catch (error) {
            res.status(500).json({ error: "Error al buscar por espacio", message: error.message });
        }
    },

    obtenerPorDeporte: async (req, res) => {
        const Complejo = req.db.model("complejoFUT", complejoSchema);
        try {
            const { deporte } = req.params;
            const complejos = await Complejo.find({ deporte: { $regex: `^${deporte}$`, $options: "i" } });
            res.status(200).json(complejos);
        } catch (error) {
            res.status(500).json({ error: "Error al buscar por deporte", message: error.message });
        }
    },

    obtenerPorComuna: async (req, res) => {
        const Complejo = req.db.model("complejoFUT", complejoSchema);
        try {
            const { comuna } = req.params;
            const complejos = await Complejo.find({
                comuna: { $regex: `^${comuna}$`, $options: "i" },
            });
            res.status(200).json(complejos);
        } catch (error) {
            res.status(500).json({ error: "Error al buscar por comuna", message: error.message });
        }
    },

    obtenerPorZonaComuna: async (req, res) => {
        const Complejo = req.db.model("complejoFUT", complejoSchema);
        try {
            const { zona } = req.params; // zona_comuna
            const complejos = await Complejo.find({
                zona_comuna: { $regex: `^${zona}$`, $options: "i" },
            });
            res.status(200).json(complejos);
        } catch (error) {
            res.status(500).json({ error: "Error al buscar por zona_comuna", message: error.message });
        }
    },
};

module.exports = complejoController;