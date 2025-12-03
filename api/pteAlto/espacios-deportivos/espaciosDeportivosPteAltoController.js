const EspaciosDeportivos = require('./espaciosDeportivosPteAlto');
const ComplejosDeportivos = require('../complejos-deportivos/complejosDeportivosPteAlto');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
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




const espaciosDeportivosPteAltoController = {
    //crear espacio deportivo PTE Alt, agregarlo y agregarlo al complejo deportivo
    crearEspacioDeportivoPteAlto: async (req, res) => {

        try {
            console.log("🔵 CREAR ESPACIO - req.body:", req.body);
            console.log("🔵 CREAR ESPACIO - req.file:", req.file ? `Sí (${req.file.originalname})` : "No");

            const {complejoDeportivo} = req.params;
            const nuevoEspacioDeportivoPteAlto = new EspaciosDeportivos({
                ...req.body,
            });

            nuevoEspacioDeportivoPteAlto.complejoDeportivo = complejoDeportivo;

            // Add imgUrl from body if provided (for Cloudinary uploads)
            if (req.body.imgUrl) {
                nuevoEspacioDeportivoPteAlto.imgUrl = req.body.imgUrl;
            }

            await nuevoEspacioDeportivoPteAlto.save();

            if (req.file) {
                console.log("📁 Procesando archivo:", req.file.originalname);
                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `espacios/img-${quizIdentifier()}.${extension}`;

                const uploadParams = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileContent,
                    ContentType: req.file.mimetype || `image/${extension}`,
                };

                const uploadCommand = new PutObjectCommand(uploadParams);
                await clientAWS.send(uploadCommand);

                // Guardar URL completa de S3
                const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fileName}`;
                nuevoEspacioDeportivoPteAlto.imgUrl = fileUrl;
                await nuevoEspacioDeportivoPteAlto.save();
                console.log("✅ Imagen subida a S3:", fileUrl);
            } else {
                console.log("⚠️ No se recibió archivo en req.file");
            }


            const complejoEncontrado = await ComplejosDeportivos.findById(complejoDeportivo);
            complejoEncontrado.espaciosDeportivos.push(nuevoEspacioDeportivoPteAlto._id);
            await complejoEncontrado.save();

            console.log("✅ Espacio creado con imgUrl:", nuevoEspacioDeportivoPteAlto.imgUrl);

            res.status(201).json({
                message: "Espacio deportivo creado correctamente",
                response: nuevoEspacioDeportivoPteAlto,
                success: true });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al crear el espacio deportivo PTE Alto", error });
        }
    },
    obtenerTodosLosEspaciosDeportivosPteAlto: async (req, res) => {
        try {
            const espaciosDeportivosPteAlto = await EspaciosDeportivos.find();
            res.status(200).json({ 
                message: "Espacios deportivos PTE Alto obtenidos correctamente", 
                response: espaciosDeportivosPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener los espacios deportivos PTE Alto", error });
        }
    },
    obtenerEspacioDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const espacioDeportivoPteAlto = await EspaciosDeportivos.findById(id);
            res.status(200).json({ 
                message: "Espacio deportivo PTE Alto obtenido correctamente", 
                response: espacioDeportivoPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al obtener el espacio deportivo PTE Alto", error });
        }
    },
    actualizarEspacioDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            let updateData = { ...req.body };

            // Si se sube una nueva imagen, procesarla
            if (req.file) {
                const fileContent = req.file.buffer;
                const extension = req.file.originalname.split('.').pop();
                const fileName = `espacios/img-${quizIdentifier()}.${extension}`;

                const uploadParams = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: fileContent,
                    ContentType: req.file.mimetype || `image/${extension}`,
                };

                const uploadCommand = new PutObjectCommand(uploadParams);
                await clientAWS.send(uploadCommand);

                // Actualizar con la nueva URL de S3
                const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fileName}`;
                updateData.imgUrl = fileUrl;
            }

            const espacioDeportivoPteAlto = await EspaciosDeportivos.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            res.status(200).json({
                message: "Espacio deportivo PTE Alto actualizado correctamente",
                response: espacioDeportivoPteAlto,
                success: true
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al actualizar el espacio deportivo PTE Alto", error });
        }
    },
    eliminarEspacioDeportivoPteAltoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const espacioDeportivoPteAlto = await EspaciosDeportivos.findByIdAndDelete(id);

            //eliminar el espacio deportivo del complejo deportivo
            const complejoEncontrado = await ComplejosDeportivos.findById(espacioDeportivoPteAlto.complejoDeportivo);
            complejoEncontrado.espaciosDeportivos = complejoEncontrado.espaciosDeportivos.filter(espacio => espacio.toString() !== espacioDeportivoPteAlto._id.toString());
            await complejoEncontrado.save();

            res.status(200).json({ 
                message: "Espacio deportivo PTE Alto eliminado correctamente", 
                response: espacioDeportivoPteAlto,
                success: true });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al eliminar el espacio deportivo PTE Alto", error });
        }
    }
}
module.exports = espaciosDeportivosPteAltoController;