const EspaciosDeportivos = require('./espaciosDeportivosModel');
const User = require('../usuarios-complejos/usuariosComplejos');
const Institucion = require('../institucion/institucionModel');
const CentrosDeportivos = require('../centros-deportivos/centrosDeportivosModel');

// Usamos el helper centralizado de S3
const { uploadMulterFile } = require('../../utils/s3Client');

const espaciosDeportivosController = {
    crearEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const institucionID = req.body.institucion;
            const centroDeportivoID = req.body.centroDeportivo;
            const rut = req.body.rut;

            // Validar duplicado por rut
            if (rut) {
                const espacioExistente = await EspaciosDeportivos.findOne({ rut });
                if (espacioExistente) {
                    return res.status(400).json({ message: "El rut ya está registrado" });
                }
            }

            const nuevoEspacioDeportivo = new EspaciosDeportivos({
                ...req.body,
                admins: id ? [id] : [],
            });

            // Subida de imagen a S3 usando helper centralizado
            if (req.file) {
                const key = await uploadMulterFile(req.file);
                nuevoEspacioDeportivo.imgUrl = key;
            }

            await nuevoEspacioDeportivo.save();

            if (id) {
                // Asignar el id del espacio deportivo a la propiedad espacioDeportivo del usuario
                await User.findByIdAndUpdate(
                    id,
                    { $push: { espacioDeportivo: nuevoEspacioDeportivo._id } },
                    { new: true }
                );
            }

            if (institucionID) {
                // Asignar el id del espacio deportivo a la institucion y viceversa
                await Institucion.findByIdAndUpdate(
                    institucionID,
                    { $push: { espaciosDeportivos: nuevoEspacioDeportivo._id } },
                    { new: true }
                );
                await EspaciosDeportivos.findByIdAndUpdate(
                    nuevoEspacioDeportivo._id,
                    { $set: { institucion: institucionID } },
                    { new: true }
                );
            }

            if (centroDeportivoID) {
                // Asignar el id del espacio deportivo al centro deportivo y viceversa
                await CentrosDeportivos.findByIdAndUpdate(
                    centroDeportivoID,
                    { $push: { espaciosDeportivos: nuevoEspacioDeportivo._id } },
                    { new: true }
                );
                await EspaciosDeportivos.findByIdAndUpdate(
                    nuevoEspacioDeportivo._id,
                    { $set: { centroDeportivo: centroDeportivoID } },
                    { new: true }
                );
            }

            res.status(201).json({
                message: "Espacio deportivo creado correctamente",
                nuevoEspacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al crear el espacio deportivo",
                error
            });
        }
    },

    actualizarEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const { institucion, centroDeportivo } = req.body;

            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(
                id,
                req.body,
                { new: true }
            );

            if (!espacioDeportivo) {
                return res.status(404).json({
                    message: "Espacio deportivo no encontrado"
                });
            }

            //  Subida de nueva imagen (si viene) usando helper
            if (req.file) {
                const key = await uploadMulterFile(req.file);
                espacioDeportivo.imgUrl = key;
                await espacioDeportivo.save();
            }

            // Si se actualiza el centro deportivo, agregar la relación si no existe
            if (centroDeportivo) {
                await CentrosDeportivos.findByIdAndUpdate(
                    centroDeportivo,
                    { $addToSet: { espaciosDeportivos: id } },
                    { new: true }
                );

                await EspaciosDeportivos.findByIdAndUpdate(
                    id,
                    { $set: { centroDeportivo } },
                    { new: true }
                );
            }

            res.status(200).json({
                message: "Espacio deportivo actualizado correctamente",
                espacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al actualizar el espacio deportivo",
                error
            });
        }
    },

    obtenerEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const espacioDeportivo = await EspaciosDeportivos.findById(id)
                .populate('institucion')
                .populate('centroDeportivo');

            if (!espacioDeportivo) {
                return res.status(404).json({ message: "Espacio deportivo no encontrado" });
            }

            res.status(200).json({
                message: "Espacio deportivo obtenido correctamente",
                espacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al obtener el espacio deportivo",
                error
            });
        }
    },

    obtenerTodosLosEspaciosDeportivos: async (req, res) => {
        try {
            const espaciosDeportivos = await EspaciosDeportivos.find()
                .populate('institucion')
                .populate('centroDeportivo');

            res.status(200).json({
                message: "Espacios deportivos obtenidos correctamente",
                espaciosDeportivos
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al obtener los espacios deportivos",
                error
            });
        }
    },

    agregarAdminAEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { adminId } = req.body;

            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(
                id,
                { $addToSet: { admins: adminId } },
                { new: true }
            );

            await User.findByIdAndUpdate(
                adminId,
                { $addToSet: { espacioDeportivo: id } },
                { new: true }
            );

            res.status(200).json({
                message: "Admin agregado al espacio deportivo correctamente",
                espacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al agregar admin al espacio deportivo",
                error
            });
        }
    },

    eliminarAdminDeEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { adminId } = req.body;

            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(
                id,
                { $pull: { admins: adminId } },
                { new: true }
            );

            await User.findByIdAndUpdate(
                adminId,
                { $pull: { espacioDeportivo: id } },
                { new: true }
            );

            res.status(200).json({
                message: "Admin eliminado del espacio deportivo correctamente",
                espacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al eliminar admin del espacio deportivo",
                error
            });
        }
    },

    agregarInstitucionAEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { institucionId } = req.body;

            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(
                id,
                { $addToSet: { institucion: institucionId } },
                { new: true }
            );

            await Institucion.findByIdAndUpdate(
                institucionId,
                { $addToSet: { espaciosDeportivos: id } },
                { new: true }
            );

            res.status(200).json({
                message: "Institución agregada al espacio deportivo correctamente",
                espacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al agregar institución al espacio deportivo",
                error
            });
        }
    },

    eliminarInstitucionDeEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { institucionId } = req.body;

            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(
                id,
                { $pull: { institucion: institucionId } },
                { new: true }
            );

            await Institucion.findByIdAndUpdate(
                institucionId,
                { $pull: { espaciosDeportivos: id } },
                { new: true }
            );

            res.status(200).json({
                message: "Institución eliminada del espacio deportivo correctamente",
                espacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al eliminar institución del espacio deportivo",
                error
            });
        }
    },

    agregarCentroDeportivoAEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { centroDeportivoId } = req.body;

            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(
                id,
                { $addToSet: { centroDeportivo: centroDeportivoId } },
                { new: true }
            );

            await CentrosDeportivos.findByIdAndUpdate(
                centroDeportivoId,
                { $addToSet: { espaciosDeportivos: id } },
                { new: true }
            );

            res.status(200).json({
                message: "Centro deportivo agregado al espacio deportivo correctamente",
                espacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al agregar centro deportivo al espacio deportivo",
                error
            });
        }
    },

    eliminarCentroDeportivoDeEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { centroDeportivoId } = req.body;

            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(
                id,
                { $pull: { centroDeportivo: centroDeportivoId } },
                { new: true }
            );

            await CentrosDeportivos.findByIdAndUpdate(
                centroDeportivoId,
                { $pull: { espaciosDeportivos: id } },
                { new: true }
            );

            res.status(200).json({
                message: "Centro deportivo eliminado del espacio deportivo correctamente",
                espacioDeportivo
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Error al eliminar centro deportivo del espacio deportivo",
                error
            });
        }
    },
};

module.exports = espaciosDeportivosController;
