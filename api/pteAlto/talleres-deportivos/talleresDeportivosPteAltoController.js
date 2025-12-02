const TalleresDeportivos = require('./talleresDeportivosPteAlto');
const EspaciosDeportivos = require('../espacios-deportivos/espaciosDeportivosPteAlto');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const bucketRegion = process.env.AWS_BUCKET_REGION
const bucketName = process.env.AWS_BUCKET_NAME
const publicKey = process.env.AWS_PUBLIC_KEY
const privateKey = process.env.AWS_SECRET_KEY
const crypto = require('crypto');

const clientAWS = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: publicKey,
        secretAccessKey: privateKey,
    },
})

const quizIdentifier = () => crypto.randomBytes(32).toString('hex')


const talleresDeportivosPteAltoController = {

    //crear taller deportivo PTE Alto y agregarlo al espacio deportivo en caso de tenerlo
    crearTallerDeportivoPteAlto: async (req, res) => {
        try {
            const nuevoTallerDeportivoPteAlto = new TalleresDeportivos({
                ...req.body,
            });


            // subir una o hasta 5 imagenes al campo galeria del taller deportivo
            // upload.array('galeria', 5) siempre devuelve un array (puede estar vacío)
            if (req.files && req.files.length > 0) {
                const galeria = [];
                const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                
                // Procesar cada archivo (máximo 5 ya está limitado por el middleware)
                for (const file of req.files) {
                    // Validar tipo de archivo (solo imágenes)
                    const extension = file.originalname.split('.').pop().toLowerCase();
                    if (!allowedExtensions.includes(extension)) {
                        return res.status(400).json({ 
                            message: `Tipo de archivo no permitido: ${extension}. Solo se permiten imágenes (jpg, jpeg, png, gif, webp)`,
                            success: false 
                        });
                    }

                    // Validar tamaño (máximo 5MB por archivo)
                    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
                    if (file.size > maxSize) {
                        return res.status(400).json({ 
                            message: `El archivo ${file.originalname} excede el tamaño máximo de 5MB`,
                            success: false 
                        });
                    }

                    try {
                        const fileContent = file.buffer;
                        const fileName = `talleres/galeria-${quizIdentifier()}.${extension}`;

                        const uploadParams = {
                            Bucket: bucketName,
                            Key: fileName,
                            Body: fileContent,
                            ContentType: file.mimetype || `image/${extension}`,
                        };

                        const uploadCommand = new PutObjectCommand(uploadParams);
                        await clientAWS.send(uploadCommand);

                        // Construir URL completa del archivo en S3
                        const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fileName}`;
                        galeria.push(fileUrl);
                    } catch (uploadError) {
                        console.error(`Error al subir archivo ${file.originalname}:`, uploadError);
                        return res.status(500).json({ 
                            message: `Error al subir el archivo ${file.originalname}`,
                            error: uploadError.message,
                            success: false 
                        });
                    }
                }

                // Asignar la galería al taller
                nuevoTallerDeportivoPteAlto.galeria = galeria;
            }

         
    
            // Cambiar req.params.espacioDeportivo por req.query.espacioDeportivo
            if (req.query.espacioDeportivo) {
                const espacioDeportivoEncontrado = await EspaciosDeportivos.findById(req.query.espacioDeportivo);
                if (!espacioDeportivoEncontrado) {
                    return res.status(404).json({ message: "Espacio deportivo no encontrado" });
                }
                espacioDeportivoEncontrado.talleres.push(nuevoTallerDeportivoPteAlto._id);
                await espacioDeportivoEncontrado.save();
    
                nuevoTallerDeportivoPteAlto.espacioDeportivo = espacioDeportivoEncontrado._id;
                await nuevoTallerDeportivoPteAlto.save();
    
                res.status(201).json({ message: "Taller deportivo PTE Alto creado correctamente", tallerDeportivoPteAlto: nuevoTallerDeportivoPteAlto });
            } else {
                nuevoTallerDeportivoPteAlto.espacioDeportivo = null;
                await nuevoTallerDeportivoPteAlto.save();
                res.status(201).json({ message: "Taller deportivo PTE Alto creado correctamente", tallerDeportivoPteAlto: nuevoTallerDeportivoPteAlto });
            }



        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear el taller deportivo PTE Alto", error });
        }
    },
    obtenerTodosLosTalleresDeportivosPteAlto: async (req, res) => {
        try {
            const talleresDeportivosPteAlto = await TalleresDeportivos.find();
            res.status(200).json({ message: "Talleres deportivos PTE Alto obtenidos correctamente", response: talleresDeportivosPteAlto, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener los talleres deportivos PTE Alto", error });
        }
    },
    obtenerTallerDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const tallerDeportivoPteAlto = await TalleresDeportivos.findById(id);
            res.status(200).json({ message: "Taller deportivo PTE Alto obtenido correctamente", response: tallerDeportivoPteAlto, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener el taller deportivo PTE Alto", error });
        }
    },
    actualizarTallerDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, descripcion, imagen, video, link, complejoDeportivo, espacioDeportivo, capacidad, valor, pago, horarios, dias, fechaInicio, fechaFin, usuarios, profesores, status } = req.body;
            const tallerDeportivoPteAlto = await TalleresDeportivos.findByIdAndUpdate(id, { nombre, descripcion, imagen, video, link, complejoDeportivo, espacioDeportivo, capacidad, valor, pago, horarios, dias, fechaInicio, fechaFin, usuarios, profesores, status }, { new: true });
            res.status(200).json({ message: "Taller deportivo PTE Alto actualizado correctamente", response: tallerDeportivoPteAlto, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar el taller deportivo PTE Alto", error });
        }
    },
    eliminarTallerDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const tallerDeportivoPteAlto = await TalleresDeportivos.findByIdAndDelete(id);

            // en caso de estar asociado a un espacio deportivo, eliminar el taller deportivo del espacio deportivo

            if (tallerDeportivoPteAlto.espacioDeportivo) {
                const espacioDeportivoEncontrado = await EspaciosDeportivos.findById(tallerDeportivoPteAlto.espacioDeportivo);
                if (espacioDeportivoEncontrado) {
                    espacioDeportivoEncontrado.talleres = espacioDeportivoEncontrado.talleres.filter(taller => taller.toString() !== tallerDeportivoPteAlto._id.toString());
                    await espacioDeportivoEncontrado.save();
                }
            }

            res.status(200).json({ message: "Taller deportivo PTE Alto eliminado correctamente", response: tallerDeportivoPteAlto, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar el taller deportivo PTE Alto", error });
        }
    }
}

module.exports = talleresDeportivosPteAltoController;