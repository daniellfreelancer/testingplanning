const SuscripcionPlanes = require("./suscripcionPlanes");

const populateOptions = [
    { path: 'usuario', select: 'nombre apellido email rut' },
    { path: 'planId', select: 'valor tipo nombrePlan' },
    { path: 'varianteId', select: 'dia horario' },
    { path: 'pago', select: 'transaccion voucher monto fechaPago recepcion fechaFin horasDisponibles bloquesDisponibles createdAt' },
]

const suscripcionController = {
    getSuscripcionById: async (req, res) => {
        const { id } = req.params;
        const suscripcion = await SuscripcionPlanes.findById(id);
        res.status(200).json({
            message: "Suscripcion obtenida correctamente",
            suscripcion,
            success: true,
        });
    },
    getSuscripcionByUsuario: async (req, res) => {
        const { usuarioId } = req.params;

        try {
            const suscripcion = await SuscripcionPlanes.find({ usuario: usuarioId }).populate(populateOptions);
            res.status(200).json({
                message: "Suscripcion obtenida correctamente",
                suscripcion,
                success: true,
            });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener la suscripcion del usuario", error: error.message });
        }


    },

    getSuscripcionByPlan: async (req, res) => {
        const { planId } = req.params;
        try {
            const suscripcion = await SuscripcionPlanes.find({ planId: planId }).populate(populateOptions);
            res.status(200).json({
                message: "Suscripcion obtenida correctamente",
                suscripcion,
                success: true,
            });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener la suscripcion del plan", error: error.message });
        }

    },

    getSuscripcionByVariante: async (req, res) => {
        const { varianteId } = req.params;
        const suscripcion = await SuscripcionPlanes.find({ varianteId: varianteId });
        res.status(200).json({
            message: "Suscripcion obtenida correctamente",
            suscripcion,
            success: true,
        });
    },

    getSuscripcionByPago: async (req, res) => {
        const { pagoId } = req.params;
        const suscripcion = await SuscripcionPlanes.find({ pagoId: pagoId });
        res.status(200).json({
            message: "Suscripcion obtenida correctamente",
            suscripcion,
            success: true,
        });
    },
    getSuscripcionByInstitucion: async (req, res) => {
        const { institucionId } = req.params;

        try {
            const suscripciones = await SuscripcionPlanes.find({ institucion: institucionId }).populate(populateOptions);
            res.status(200).json({
                message: "Suscripciones obtenidas correctamente",
                suscripciones,
                success: true,
            });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener las suscripciones de la institución", error: error.message });
        }

    }

}

module.exports = suscripcionController;