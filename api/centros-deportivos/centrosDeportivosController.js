const CentrosDeportivos = require('./centrosDeportivosModel');
const User = require('../usuarios-complejos/usuariosComplejos');
const Institucion = require('../institucion/institucionModel');

const centrosDeportivosController = {
    crearCentroDeportivo: async (req, res) => {
        try {
            const { id } = req.params;

            //validar rut del centro deportivo
            const rut = req.body.rut;
            const institucionID = req.body.institucion;

            const centroDeportivo = await CentrosDeportivos.findOne({ rut });
            if (centroDeportivo) {
                return res.status(400).json({ message: "El rut ya está registrado" });
            }

            const nuevocentroDeportivo = new CentrosDeportivos({
                ...req.body,
                admins: id ? [id] : [],
            });
            await nuevocentroDeportivo.save();
            if (id) {
                //asignar el id del centro deportivo a la propiedad admins del usuario
                const user = await User.findByIdAndUpdate(id, { $push: { centroDeportivo: nuevocentroDeportivo._id } }, { new: true });
            }

            if (institucionID) {
                //asignar el id de la institucion al centro deportivo
                const institucion = await Institucion.findByIdAndUpdate(institucionID, { $push: { centrosDeportivos: nuevocentroDeportivo._id } }, { new: true });
                //asignar el id del centro deportivo a la propiedad centrosDeportivos de la institucion
                const centroDeportivoUpdated = await CentrosDeportivos.findByIdAndUpdate(nuevocentroDeportivo._id, { $push: { institucion: institucionID } }, { new: true });
            }

            res.status(201).json({ message: "Centro deportivo creado correctamente", nuevocentroDeportivo });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear el centro deportivo", error });
        }
    },
    actualizarCentroDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const centroDeportivo = await CentrosDeportivos.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json({ message: "Centro deportivo actualizado correctamente", centroDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar el centro deportivo", error });
        }
    },
    obtenerCentroDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const centroDeportivo = await CentrosDeportivos.findById(id);
            res.status(200).json({ message: "Centro deportivo obtenido correctamente", centroDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener el centro deportivo", error });
        }
    },
    obtenerTodosLosCentrosDeportivos: async (req, res) => {
        try {
            const centrosDeportivos = await CentrosDeportivos.find();
            res.status(200).json({ message: "Centros deportivos obtenidos correctamente", centrosDeportivos });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener los centros deportivos", error });
        }
    },
    agregarAdminACentroDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const centroDeportivo = await CentrosDeportivos.findByIdAndUpdate(id, { $push: { admins: req.body.adminId } }, { new: true });

            //asignar el id del centro deportivo a la propiedad admins del usuario
            const user = await User.findByIdAndUpdate(req.body.adminId, { $push: { centroDeportivo: centroDeportivo._id } }, { new: true });

            res.status(200).json({ message: "Admin agregado al centro deportivo correctamente", centroDeportivo });
        } catch (error) {
            console.log(error);
        }
    },
    eliminarAdminDeCentroDeportivo: async (req, res) => {

        try {
            const { id } = req.params;
            const centroDeportivo = await CentrosDeportivos.findByIdAndUpdate(id, { $pull: { admins: req.body.adminId } }, { new: true });

            //eliminar el id del centro deportivo de la propiedad admins del usuario
            const user = await User.findByIdAndUpdate(req.body.adminId, { $pull: { centroDeportivo: centroDeportivo._id } }, { new: true });

            res.status(200).json({ message: "Admin eliminado del centro deportivo correctamente", centroDeportivo });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar el admin del centro deportivo", error });
        }

    },
    agregarInstitucionACentroDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const centroDeportivo = await CentrosDeportivos.findByIdAndUpdate(id, { $push: { institucion: req.body.institucionId } }, { new: true });
            //asignar el id del centro deportivo a la propiedad institucion de la institucion
            const institucion = await Institucion.findByIdAndUpdate(req.body.institucionId, { $push: { centrosDeportivos: centroDeportivo._id } }, { new: true });

            res.status(200).json({ message: "Institución agregada al centro deportivo correctamente", centroDeportivo });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al agregar la institución al centro deportivo", error });
        }
    },
    eliminarInstitucionDeCentroDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const centroDeportivo = await CentrosDeportivos.findByIdAndUpdate(id, { $pull: { institucion: req.body.institucionId } }, { new: true });
            //eliminar el id del centro deportivo de la propiedad institucion de la institucion
            const institucion = await Institucion.findByIdAndUpdate(req.body.institucionId, { $pull: { centrosDeportivos: centroDeportivo._id } }, { new: true });

            res.status(200).json({ message: "Institución eliminada del centro deportivo correctamente", centroDeportivo });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar la institución del centro deportivo", error });
        }
    },
    eliminarCentroDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const centroDeportivo = await CentrosDeportivos.findByIdAndDelete(id);
            //eliminar el id del centro deportivo de la propiedad institucion de la institucion
            const institucion = await Institucion.findByIdAndUpdate(centroDeportivo.institucion, { $pull: { centrosDeportivos: centroDeportivo._id } }, { new: true });
            //si existen admins en el centro deportivo, eliminar el id del centro deportivo de la propiedad admins del usuario
            const user = await User.findByIdAndUpdate(centroDeportivo.admins, { $pull: { centroDeportivo: centroDeportivo._id } }, { new: true });

            res.status(200).json({ message: "Centro deportivo eliminado correctamente", centroDeportivo });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar el centro deportivo", error });
        }
    }
}
module.exports = centrosDeportivosController;