const Institucion = require('./institucionModel');
const User = require('../usuarios-complejos/usuariosComplejos');


const institucionController = {
  crearInstitucion: async (req, res) => {

        try {
            const {id} = req.params;

            //validar rut de la institucion
            const rut = req.body.rut;
            const institucion = await Institucion.findOne({ rut });
            if (institucion) {
                return res.status(400).json({ message: "El rut ya está registrado" });
            }

            const nuevaInstitucion = new Institucion({
                ...req.body,
                admins: [id],
            });
            await nuevaInstitucion.save();

            //asignar el id de la institucion a la propiedad admins del usuario
            const user = await User.findByIdAndUpdate(id, { $push: { institucion: nuevaInstitucion._id } }, { new: true });
            res.status(201).json({ message: "Institución creada correctamente", nuevaInstitucion });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear la institución", error });
        }

  },
  actualizarInstitucion: async (req, res) => {
    try {
        const {id} = req.params;
        const institucion = await Institucion.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ message: "Institución actualizada correctamente", institucion });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar la institución", error });
    }
  },
  obtenerInstitucion: async (req, res) => {
    try {
        const {id} = req.params;
        const institucion = await Institucion.findById(id);
        res.status(200).json({ message: "Institución obtenida correctamente", institucion });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener la institución", error });
    }
  },
  obtenerTodasLasInstituciones: async (req, res) => {
    try {
        const instituciones = await Institucion.find();
        res.status(200).json({ message: "Instituciones obtenidas correctamente", instituciones });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las instituciones", error });
    }
  },
  agregarAdminAInstitucion: async (req, res) => {
    try {
        const {id} = req.params;
        const institucion = await Institucion.findByIdAndUpdate(id, { $push: { admins: req.body.adminId } }, { new: true });

        //asignar el id de la institucion a la propiedad admins del usuario
        const user = await User.findByIdAndUpdate(req.body.adminId, { $push: { institucion: institucion._id } }, { new: true });

        res.status(200).json({ message: "Admin agregado a la institución correctamente", institucion });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al agregar el admin a la institución", error });
    }
  },
  eliminarAdminDeInstitucion: async (req, res) => {
    try {
        const {id} = req.params;
        const institucion = await Institucion.findByIdAndUpdate(id, { $pull: { admins: req.body.adminId } }, { new: true });

        //eliminar el id de la institucion de la propiedad admins del usuario
        const user = await User.findByIdAndUpdate(req.body.adminId, { $pull: { institucion: institucion._id } }, { new: true });

        res.status(200).json({ message: "Admin eliminado de la institución correctamente", institucion });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al eliminar el admin de la institución", error });
    }
  },
  eliminarInstitucion: async (req, res) => {
    try {
        const {id} = req.params;
        const institucion = await Institucion.findByIdAndDelete(id);
        //eliminar el id de la institucion de la propiedad admins del usuario
        const user = await User.findByIdAndUpdate(institucion.admins, { $pull: { institucion: institucion._id } }, { new: true });
        res.status(200).json({ message: "Institución eliminada correctamente"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al eliminar la institución", error });
    }
  }
}

module.exports = institucionController;