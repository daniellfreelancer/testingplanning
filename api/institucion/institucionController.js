const Institucion = require('./institucionModel');
const User = require('../usuarios-complejos/usuariosComplejos');
const { uploadMulterFile } = require('../../utils/s3Client'); // helper común

const populateUsersInstitucion = [
  {
    path: 'admins empleados',
    select: 'nombre apellido rut rol telefono email status createdAt',
  },
  {
    path: 'usuarios',
    select: 'nombre apellido rut rol telefono email status createdAt entrenador',
  },
  {
    path: 'profesores',
    select: 'nombre apellido rut rol telefono email status createdAt alumnos',
    populate: {
      path: 'alumnos',
      select: 'nombre apellido rut email status createdAt entrenador',
    },
  },
  {
    path: 'centrosDeportivos',
    select: 'nombre descripcion direccion telefono email rut ciudad comuna horarios',
  },
  {
    path: 'espaciosDeportivos',
    select:
      'nombre descripcion direccion imgUrl email telefono rut ciudad comuna deporte horarios pago valor capacidad status createdAt',
  },
  {
    path: 'usuariosPteAlto',
    select: 'nombre apellido rut rol telefono email status createdAt',
  },
  {
    path: 'adminsPteAlto',
    select: 'nombre apellido rut rol telefono email status createdAt',
    populate: {
      path: 'usuariosPteAlto',
      select: 'nombre apellido rut rol telefono email status createdAt',
    },
  },
];

const institucionController = {
  crearInstitucion: async (req, res) => {
    try {
      const { id } = req.params;

      // validar rut de la institucion
      const rut = req.body.rut;
      const institucionExistente = await Institucion.findOne({ rut });
      if (institucionExistente) {
        return res.status(400).json({ message: 'El rut ya está registrado' });
      }

      const nuevaInstitucion = new Institucion({
        ...req.body,
        admins: [id],
      });

      // Subida de imagen a S3 usando helper
      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
          nuevaInstitucion.imgUrl = key;
        } catch (uploadErr) {
          console.error('Error subiendo imagen de institución a S3:', uploadErr);
          return res.status(500).json({
            message: 'Error al subir la imagen de la institución',
            error: uploadErr.message,
          });
        }
      }

      await nuevaInstitucion.save();

      // asignar el id de la institucion a la propiedad institucion del usuario admin
      await User.findByIdAndUpdate(
        id,
        { $push: { institucion: nuevaInstitucion._id } },
        { new: true }
      );

      res
        .status(201)
        .json({ message: 'Institución creada correctamente', nuevaInstitucion });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: 'Error al crear la institución', error: error.message });
    }
  },

  actualizarInstitucion: async (req, res) => {
    try {
      const { id } = req.params;
      let institucion = await Institucion.findById(id);

      if (!institucion) {
        return res
          .status(404)
          .json({ message: 'Institución no encontrada' });
      }

      // Guardar los admins actuales antes de actualizar
      const prevAdmins = institucion.admins.map((a) => a.toString());
      let newAdmins = req.body.admins
        ? req.body.admins.map((a) => a.toString())
        : null;

      // Actualizar campos generales (sin admins ni imgUrl)
      const updateData = { ...req.body };
      delete updateData.admins;
      delete updateData.imgUrl;

      institucion = await Institucion.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      // Si se recibe admins, actualizar el array y sincronizar usuarios
      if (newAdmins) {
        institucion.admins = newAdmins;
        await institucion.save();

        const agregados = newAdmins.filter((a) => !prevAdmins.includes(a));
        const eliminados = prevAdmins.filter((a) => !newAdmins.includes(a));

        if (agregados.length > 0) {
          await User.updateMany(
            { _id: { $in: agregados } },
            { $addToSet: { institucion: institucion._id } }
          );
        }

        if (eliminados.length > 0) {
          await User.updateMany(
            { _id: { $in: eliminados } },
            { $pull: { institucion: institucion._id } }
          );
        }
      }

      // Manejo de imagen (usando helper)
      if (req.file) {
        try {
          const key = await uploadMulterFile(req.file);
          institucion.imgUrl = key;
          await institucion.save();
        } catch (uploadErr) {
          console.error('Error subiendo nueva imagen de institución a S3:', uploadErr);
          return res.status(500).json({
            message: 'Error al subir la nueva imagen de la institución',
            error: uploadErr.message,
          });
        }
      }

      res
        .status(200)
        .json({ message: 'Institución actualizada correctamente', institucion });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: 'Error al actualizar la institución', error: error.message });
    }
  },

  obtenerInstitucion: async (req, res) => {
    try {
      const { id } = req.params;
      const institucion = await Institucion.findById(id).populate(
        populateUsersInstitucion
      );

      res
        .status(200)
        .json({ message: 'Institución obtenida correctamente', institucion });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: 'Error al obtener la institución', error: error.message });
    }
  },

  obtenerTodasLasInstituciones: async (req, res) => {
    try {
      const instituciones = await Institucion.find();
      res.status(200).json({
        message: 'Instituciones obtenidas correctamente',
        instituciones,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al obtener las instituciones',
        error: error.message,
      });
    }
  },

  agregarAdminAInstitucion: async (req, res) => {
    try {
      const { id } = req.params;
      const { adminId } = req.body;

      const institucion = await Institucion.findByIdAndUpdate(
        id,
        { $push: { admins: adminId } },
        { new: true }
      );

      await User.findByIdAndUpdate(
        adminId,
        { $push: { institucion: institucion._id } },
        { new: true }
      );

      res.status(200).json({
        message: 'Admin agregado a la institución correctamente',
        institucion,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al agregar el admin a la institución',
        error: error.message,
      });
    }
  },

  eliminarAdminDeInstitucion: async (req, res) => {
    try {
      const { id } = req.params;
      const { adminId } = req.body;

      const institucion = await Institucion.findByIdAndUpdate(
        id,
        { $pull: { admins: adminId } },
        { new: true }
      );

      await User.findByIdAndUpdate(
        adminId,
        { $pull: { institucion: institucion._id } },
        { new: true }
      );

      res.status(200).json({
        message: 'Admin eliminado de la institución correctamente',
        institucion,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al eliminar el admin de la institución',
        error: error.message,
      });
    }
  },

  eliminarInstitucion: async (req, res) => {
    try {
      const { id } = req.params;
      const institucion = await Institucion.findByIdAndDelete(id);

      if (!institucion) {
        return res.status(404).json({
          message: 'Institución no encontrada',
        });
      }

      // Eliminar referencia en usuarios admins
      await User.updateMany(
        { _id: { $in: institucion.admins } },
        { $pull: { institucion: institucion._id } }
      );

      res.status(200).json({ message: 'Institución eliminada correctamente' });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error al eliminar la institución',
        error: error.message,
      });
    }
  },
};

module.exports = institucionController;
