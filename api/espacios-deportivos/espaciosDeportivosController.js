const EspaciosDeportivos = require('./espaciosDeportivosModel');
const User = require('../usuarios-complejos/usuariosComplejos');
const Institucion = require('../institucion/institucionModel');
const CentrosDeportivos = require('../centros-deportivos/centrosDeportivosModel');
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

                nuevoEspacioDeportivo.imgUrl = fileName;
            }




            await nuevoEspacioDeportivo.save();

            if (id) {
                // Asignar el id del espacio deportivo a la propiedad admins del usuario
                await User.findByIdAndUpdate(id, { $push: { espacioDeportivo: nuevoEspacioDeportivo._id } }, { new: true });
            }

            if (institucionID) {
                // Asignar el id del espacio deportivo a la institucion y viceversa
                await Institucion.findByIdAndUpdate(institucionID, { $push: { espaciosDeportivos: nuevoEspacioDeportivo._id } }, { new: true });
                await EspaciosDeportivos.findByIdAndUpdate(nuevoEspacioDeportivo._id, { $addToSet: { institucion: institucionID } }, { new: true });
            }

            if (centroDeportivoID) {
                // Asignar el id del espacio deportivo al centro deportivo y viceversa
                await CentrosDeportivos.findByIdAndUpdate(centroDeportivoID, { $push: { espaciosDeportivos: nuevoEspacioDeportivo._id } }, { new: true });
                await EspaciosDeportivos.findByIdAndUpdate(nuevoEspacioDeportivo._id, { $addToSet: { centroDeportivo: centroDeportivoID } }, { new: true });
            }

            res.status(201).json({ message: "Espacio deportivo creado correctamente", nuevoEspacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear el espacio deportivo", error });
        }
    },
    actualizarEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const { institucion, centroDeportivo } = req.body;
            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(id, req.body, { new: true });

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

                espacioDeportivo.imgUrl = fileName;
                await espacioDeportivo.save();
            }

            // Si se actualiza la institucion, agregar la relación si no existe
            if (institucion) {
                await Institucion.findByIdAndUpdate(institucion, { $addToSet: { espaciosDeportivos: id } }, { new: true });
                await EspaciosDeportivos.findByIdAndUpdate(id, { $addToSet: { institucion } }, { new: true });
            }
            // Si se actualiza el centro deportivo, agregar la relación si no existe
            if (centroDeportivo) {
                await CentrosDeportivos.findByIdAndUpdate(centroDeportivo, { $addToSet: { espaciosDeportivos: id } }, { new: true });
                await EspaciosDeportivos.findByIdAndUpdate(id, { $addToSet: { centroDeportivo } }, { new: true });
            }

            res.status(200).json({ message: "Espacio deportivo actualizado correctamente", espacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar el espacio deportivo", error });
        }
    },
    obtenerEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params;
            const espacioDeportivo = await EspaciosDeportivos.findById(id)
                .populate('institucion')
                .populate('centroDeportivo')
            if (!espacioDeportivo) {
                return res.status(404).json({ message: "Espacio deportivo no encontrado" });
            }
            res.status(200).json({ message: "Espacio deportivo obtenido correctamente", espacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener el espacio deportivo", error });
        }
    },
    obtenerTodosLosEspaciosDeportivos: async (req, res) => {
        try {
            const espaciosDeportivos = await EspaciosDeportivos.find()
                .populate('institucion')
                .populate('centroDeportivo')
            res.status(200).json({ message: "Espacios deportivos obtenidos correctamente", espaciosDeportivos });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener los espacios deportivos", error });
        }
    },
    agregarAdminAEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { adminId } = req.body;
            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(id, { $addToSet: { admins: adminId } }, { new: true });
            await User.findByIdAndUpdate(adminId, { $addToSet: { espacioDeportivo: id } }, { new: true });
            res.status(200).json({ message: "Admin agregado al espacio deportivo correctamente", espacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al agregar admin al espacio deportivo", error });
        }
    },
    eliminarAdminDeEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { adminId } = req.body;
            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(id, { $pull: { admins: adminId } }, { new: true });
            await User.findByIdAndUpdate(adminId, { $pull: { espacioDeportivo: id } }, { new: true });
            res.status(200).json({ message: "Admin eliminado del espacio deportivo correctamente", espacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar admin del espacio deportivo", error });
        }
    },
    agregarInstitucionAEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { institucionId } = req.body;
            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(id, { $addToSet: { institucion: institucionId } }, { new: true });
            await Institucion.findByIdAndUpdate(institucionId, { $addToSet: { espaciosDeportivos: id } }, { new: true });
            res.status(200).json({ message: "Institución agregada al espacio deportivo correctamente", espacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al agregar institución al espacio deportivo", error });
        }
    },
    eliminarInstitucionDeEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { institucionId } = req.body;
            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(id, { $pull: { institucion: institucionId } }, { new: true });
            await Institucion.findByIdAndUpdate(institucionId, { $pull: { espaciosDeportivos: id } }, { new: true });
            res.status(200).json({ message: "Institución eliminada del espacio deportivo correctamente", espacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar institución del espacio deportivo", error });
        }
    },
    agregarCentroDeportivoAEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { centroDeportivoId } = req.body;
            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(id, { $addToSet: { centroDeportivo: centroDeportivoId } }, { new: true });
            await CentrosDeportivos.findByIdAndUpdate(centroDeportivoId, { $addToSet: { espaciosDeportivos: id } }, { new: true });
            res.status(200).json({ message: "Centro deportivo agregado al espacio deportivo correctamente", espacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al agregar centro deportivo al espacio deportivo", error });
        }
    },
    eliminarCentroDeportivoDeEspacioDeportivo: async (req, res) => {
        try {
            const { id } = req.params; // id del espacio deportivo
            const { centroDeportivoId } = req.body;
            const espacioDeportivo = await EspaciosDeportivos.findByIdAndUpdate(id, { $pull: { centroDeportivo: centroDeportivoId } }, { new: true });
            await CentrosDeportivos.findByIdAndUpdate(centroDeportivoId, { $pull: { espaciosDeportivos: id } }, { new: true });
            res.status(200).json({ message: "Centro deportivo eliminado del espacio deportivo correctamente", espacioDeportivo });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar centro deportivo del espacio deportivo", error });
        }
    },
}

module.exports = espaciosDeportivosController;