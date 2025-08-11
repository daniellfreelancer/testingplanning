const Institucion = require('./institucionModel');
const User = require('../usuarios-complejos/usuariosComplejos');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require('crypto');
const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY

const clientAWS = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: publicKey,
    secretAccessKey: privateKey,
  },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')

const populateUsersInstitucion = [
  {
    path: 'admins',
    select: 'nombre apellido rol telefono email status createdAt',
  },
  {
    path: 'usuarios',
     select: 'nombre apellido rol telefono email status createdAt',
  },
  {
    path: 'profesores',
      select: 'nombre apellido rol telefono email status createdAt alumnos',
      populate: {
        path: 'alumnos',
        select: 'nombre apellido rut email status createdAt',
      }
  },
  {
    path: 'centrosDeportivos',
    select: 'nombre descripcion direccion telefono email rut ciudad comuna horarios',
  },
]


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

            if (req.file) {
                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;
      
                const uploadParams = {
                  Bucket: bucketName,
                  Key: fileName,
                  Body: fileContent,
                };
      
                // Subir el archivo a S3
                const uploadCommand = new PutObjectCommand(uploadParams);
                await clientAWS.send(uploadCommand);

                nuevaInstitucion.imgUrl = fileName;
            }
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
        const { id } = req.params;
        let institucion = await Institucion.findById(id);
        if (!institucion) {
            return res.status(404).json({ message: "Institución no encontrada" });
        }

        // Guardar los admins actuales antes de actualizar
        const prevAdmins = institucion.admins.map(a => a.toString());
        let newAdmins = req.body.admins ? req.body.admins.map(a => a.toString()) : null;

        // Actualizar campos generales (sin admins ni imgUrl)
        const updateData = { ...req.body };
        delete updateData.admins;
        delete updateData.imgUrl;

        institucion = await Institucion.findByIdAndUpdate(id, updateData, { new: true });

        // Si se recibe admins, actualizar el array y sincronizar usuarios
        if (newAdmins) {
            institucion.admins = newAdmins;
            await institucion.save();

            // Determinar usuarios agregados y eliminados
            const agregados = newAdmins.filter(a => !prevAdmins.includes(a));
            const eliminados = prevAdmins.filter(a => !newAdmins.includes(a));

            // Agregar institucion a los nuevos admins
            if (agregados.length > 0) {
                await User.updateMany(
                  { _id: { $in: agregados } },
                  { $addToSet: { institucion: institucion._id } }
                );
            }
            // Quitar institucion de los admins eliminados
            if (eliminados.length > 0) {
                await User.updateMany(
                  { _id: { $in: eliminados } },
                  { $pull: { institucion: institucion._id } }
                );
            }
        }

        // Lógica de imagen (mantener igual)
        if (req.file) {
            const fileContent = req.file.buffer;
            const extension = req.file.originalname.split('.').pop();
            const fileName = `${req.file.fieldname}-${quizIdentifier()}.${extension}`;

            const uploadParams = {
                Bucket: bucketName,
                Key: fileName,
                Body: fileContent,
            };

            const uploadCommand = new PutObjectCommand(uploadParams);
            await clientAWS.send(uploadCommand);

            institucion.imgUrl = fileName;
            await institucion.save();
        }
        res.status(200).json({ message: "Institución actualizada correctamente", institucion });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar la institución", error });
    }
  },
  obtenerInstitucion: async (req, res) => {
    try {
        const {id} = req.params;
        //const institucion = await Institucion.findById(id).populate('admins ',{nombre: 1, apellido: 1, email: 1, rol: 1,telefono: 1},);
        const institucion = await Institucion.findById(id).populate(populateUsersInstitucion);
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