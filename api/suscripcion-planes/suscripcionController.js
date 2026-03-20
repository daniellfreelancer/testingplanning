const SuscripcionPlanes = require("./suscripcionPlanes");

const populateOptions = [
    { path: 'usuario', select: 'nombre apellido email rut telefono direccion numeroDireccion comuna fecha_nacimiento contactoEmergencia createdAt fechaRegistro' },
    { path: 'planId', select: 'valor tipo nombrePlan duracion' },
    { path: 'varianteId', select: 'dia horario fechaInicio fechaFin horasDisponibles' },
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

    },
    actualizarSuscripcion: async (req, res) => {
        const { id } = req.params;
        try {
            const suscripcion = await SuscripcionPlanes.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json({
                message: "Suscripcion actualizada correctamente",
                suscripcion,
                success: true,
            });
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar la suscripcion", error: error.message });
        }


    },
    obtenerUltimaSuscripcionPorUsuario: async (req, res) => {
        const { usuarioId } = req.params;

        try {
            const suscripcion = await SuscripcionPlanes.findOne({ usuario: usuarioId }).sort({ createdAt: -1 }).populate({ path: 'planId', select: 'nombrePlan tipo valor' }).populate({ path: 'varianteId', select: 'dia horario' });
            if (!suscripcion) {
                return res.status(404).json({ message: "No se encontró ninguna suscripcion para el usuario", success: false });
            }

            const ultimaSuscripcion = {
                _id: suscripcion._id,
                plan: suscripcion.planId.nombrePlan,
                dias: suscripcion.varianteId.dia,
                horarios: suscripcion.varianteId.horario,
                valor: suscripcion.planId.valor,



            }

            res.status(200).json({
                message: "Ultima suscripcion obtenida correctamente",
                ultimaSuscripcion,
                success: true,
            });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener la ultima suscripcion del usuario", error: error.message });
        }


    },
    sumarHorasDisponibles: async (req, res) => {
        // este controlador debe recibir el _id de la suscripcion y el numero de horas a sumar al campo horasDisponibles de la suscripcion, que comienzan como null y luego debe cambiarse a el numero de horas a sumar.
        const { suscripcionId, horas } = req.params;
        try {
            // primero busco la suscripcion y la cambio a cero y despues la actualizo con el numero de horas a sumar.

            const suscripcion = await SuscripcionPlanes.findById(suscripcionId);

            // si la suscripcion tiene el campo horasDisponibles como null, la cambio a cero y despues la actualizo con el numero de horas a sumar.
            if (suscripcion.horasDisponibles === null) {
                await SuscripcionPlanes.findByIdAndUpdate(suscripcionId, { $set: { horasDisponibles: 0 } }, { new: true });
            }
            // si la suscripcion tiene el campo horasDisponibles como un numero, la actualizo con el numero de horas a sumar.
            if (suscripcion.horasDisponibles !== null) {
                await SuscripcionPlanes.findByIdAndUpdate(suscripcionId, { $inc: { horasDisponibles: horas } }, { new: true });
            }


            res.status(200).json({
                message: "Horas sumadas correctamente",
                suscripcion,
                success: true,
            });
        } catch (error) {
            res.status(500).json({ message: "Error al sumar las horas", error: error.message });
        }


    }

}

module.exports = suscripcionController;